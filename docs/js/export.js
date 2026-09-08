/**
 * 書き出し。SVG → <img> → canvas → PNG。
 *
 * Phase 0 の確認事項:
 *  - blob: / data: どちらでも読める。blob: を既定にする
 *  - SVG には width/height が必須（無いと Chrome 97x150 / Safari は等倍になる）
 *  - 外部参照は読まれないので、すべてインラインで組む
 *  - canvas は汚染されない（外部参照を使っていないため）
 *  - navigator.share はタップ直後でないと iOS で拒否されるので、Blob は画面を開いた時点で作っておく
 */

import { sheetSvg, nailSvg } from './render.js';

function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('SVG を画像として読み込めませんでした'));
    img.src = url;
  });
}

/** SVG 文字列を PNG の Blob にする */
export async function svgToPngBlob(svgString, { bg = null } = {}) {
  const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = await loadImg(url);
    if (img.decode) { try { await img.decode(); } catch (e) { /* Safari で稀に失敗するが描画はできる */ } }
    const w = Math.max(1, img.naturalWidth);
    const h = Math.max(1, img.naturalHeight);
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise((resolve, reject) => {
      cv.toBlob(b => b ? resolve(b) : reject(new Error('PNG に変換できませんでした')), 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 10本を2段5列に並べたシート画像 */
export function sheetPng(design, opts = {}) {
  const svg = sheetSvg(design, {
    embedFonts: true,
    scale: opts.scale || 2,
    bgColor: opts.transparent ? null : (opts.bgColor || '#FFFFFF'),
    outline: opts.outline !== false,
  });
  return svgToPngBlob(svg);
}

/** 1本だけ大きく */
export function singlePng(design, nailIdx, opts = {}) {
  const svg = nailSvg(design, nailIdx, {
    embedFonts: true,
    scale: opts.scale || 6,
    bgColor: opts.transparent ? null : (opts.bgColor || '#FFFFFF'),
    outline: opts.outline !== false,
  });
  return svgToPngBlob(svg);
}

export function safeFileName(name) {
  return (String(name || 'nail').replace(/[\\/:*?"<>|]+/g, '_').trim() || 'nail').slice(0, 40);
}

/**
 * ファイルとして保存。
 * iOS のホーム画面アプリでは <a download> が効かないので、
 * 呼び出し側は必ず「画像を長押しして保存」の導線も残しておくこと。
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function canShareFiles(blob, filename) {
  if (!navigator.canShare || !navigator.share) return false;
  try {
    return navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] });
  } catch (e) {
    return false;
  }
}

/** 用意済みの Blob を他アプリへ渡す。タップ直後に呼ぶこと */
export async function sharePng(blob, filename, title) {
  const file = new File([blob], filename, { type: 'image/png' });
  await navigator.share({ files: [file], title: title || filename });
}

/** テキスト（バックアップ JSON）をファイルとして保存 */
export function downloadText(text, filename) {
  downloadBlob(new Blob([text], { type: 'application/json' }), filename);
}
