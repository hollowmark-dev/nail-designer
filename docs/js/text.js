/**
 * 文字レイヤー（イニシャル・日付・短い単語）。
 *
 * 規約（parts/parts.js・render.js と同じ）:
 *  - 色は {c0} {c1} のプレースホルダで書く。var(--c0) は使わない
 *  - 外部参照を使わない。フォントは fonts.js の base64 埋め込みに委ねる
 *  - filter / mix-blend-mode / foreignObject は使わない
 *
 * 湾曲配置（textPath）は作らない。爪に乗るのは1〜2文字が中心で、
 * 直線配置で十分と判断したため（依頼側の設計判断）。
 *
 * レイヤーのデータ形（model.js 側で作る）:
 *   { type: 'text', s: 'A', font: 'script', size: 30, weight: 700, outline: true,
 *     anchor: 'center', x: 50, y: 0, rot: 0, c: [3, 1] }
 *   c[0] = 文字色, c[1] = 縁取り色
 */

import { FONTS, getFont } from './fonts.js';

/** サイズの下限。爪は小さいので、これより小さいと縁取り込みで潰れる */
export const MIN_SIZE = 12;

export const DEFAULT_TEXT = {
  type: 'text',
  s: '',
  font: 'script',
  size: 24,
  weight: 700,
  outline: true,
  anchor: 'center',
  x: 50,
  y: 0,
  rot: 0,
  c: [3, 1],
};

/**
 * layer.s を XML の特殊文字についてエスケープする。
 * 文字入力はユーザーの自由入力なので、markup に埋め込む前に必ず通す。
 */
function escapeXml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

/**
 * 原点中心に描く文字の markup を返す。{c0} {c1} を使う（実色への解決は render.js 側）。
 *
 * anchor/x/y/rot はここでは扱わない。render.js の parts.js（motif）と同じ約束で、
 * パーツ側は原点中心の「中身」だけを返し、実際の配置（translate(x,y) rotate(rot)）は
 * 呼び出し側が外側の <g transform="..."> で組み立てる（render.js の motifTransform 相当）。
 * こうしておくと、テキストレイヤーも既存の motif と同じ配置パイプラインに乗せられる。
 *
 * 垂直方向の中央合わせは dominant-baseline="central" ではなく dy で行う。
 * 理由: dominant-baseline は SVG-as-image 経由の書き出し（Phase 0 で確定した
 * このアプリの書き出し方式）では対応がブラウザ間で割れることが知られており、
 * このアプリが実機確認した Android Chrome / iOS Safari の組でも見た目がずれる
 * リスクがある。一方 dy はテキスト行送りの相対移動であり、number ベースで
 * どの環境でも同じ量だけ動くため、書き出し互換性を最優先するこのプロジェクトでは
 * dy を採用する。dy の量はフォントの上下メトリクスにきっちり合わせるのではなく、
 * 「size に対する固定比率」で近似する（0.35em 相当）。実測で大きくずれる書体が
 * 出た場合はここを書体ごとに調整する。
 */
export function textMarkup(layer) {
  const font = getFont(layer.font);
  const size = Math.max(MIN_SIZE, Number(layer.size) || DEFAULT_TEXT.size);
  const weight = layer.weight || DEFAULT_TEXT.weight;
  const text = escapeXml(layer.s);

  const outlineAttrs = layer.outline
    ? ` stroke="{c1}" stroke-width="${round(size * 0.09, 2)}" paint-order="stroke" stroke-linejoin="round"`
    : '';

  return (
    `<text x="0" y="0" dy="${round(size * 0.35, 2)}" text-anchor="middle" ` +
    `font-family="${font.family}" font-size="${round(size, 2)}" font-weight="${weight}" ` +
    `fill="{c0}"${outlineAttrs}>${text}</text>`
  );
}

/**
 * 文字の外接箱の概算 [幅, 高さ]。選択枠とハンドルの位置決めに使う。
 * fonts.js の advance（1文字あたりの平均送り幅 ÷ size）を使う。
 * 空文字のときは最小サイズ相当の箱を返す（選択直後にハンドルが潰れないように）。
 */
export function textBox(layer) {
  const font = getFont(layer.font);
  const size = Math.max(MIN_SIZE, Number(layer.size) || DEFAULT_TEXT.size);
  const len = Math.max(1, String(layer.s || '').length);
  const w = size * font.advance * len * 1.05;
  const h = size * 1.2;
  return [w, h];
}

/** 画面表示用に @font-face を document に1度だけ注入する */
let injectedIds = new Set();
export function ensureFontsLoaded(ids) {
  const list = Array.isArray(ids) ? ids : [ids];
  const missing = list.filter(id => !injectedIds.has(id));
  if (missing.length === 0) return;

  missing.forEach(id => injectedIds.add(id));
  const style = document.createElement('style');
  style.setAttribute('data-nd-fonts', missing.join(','));
  style.textContent = missing
    .map(id => getFont(id))
    .filter(Boolean)
    .map(f => `@font-face { font-family: '${f.family}'; font-weight: 400 700; src: url(${f.dataUri}) format('woff2'); }`)
    .join('');
  document.head.appendChild(style);
}

function round(v, p = 2) {
  const f = Math.pow(10, p);
  return Math.round((Number(v) || 0) * f) / f;
}

export { FONTS };
