/**
 * デザイン JSON → SVG。
 *
 * Phase 0 で確定した規約をここで守る:
 *  1. パーツ内の id（gradient / pattern / clipPath）は描画のたびに接頭辞を付け替える。
 *     同じパーツを2個置くと Chrome では url(#…) が最初の1個を指し、両方同じ色になる
 *  2. 色は {cN} を文字列置換で実色に落とす（var(--cN) は SVG-as-image で効かない環境がある）
 *  3. 書き出す SVG には width/height 属性を必ず付ける（無いと 97x150 や等倍になる）
 *  4. 外部参照を使わない（SVG-as-image は外部 CSS も外部画像も読まない）
 */

import { nailPath, nailHeight, resolveY, NAIL_W } from './parts/shapes.js';
import { getPart, aspectOf } from './parts/parts.js';
import { textMarkup, textBox } from './text.js';
import { inkMarkup } from './ink.js';
import { fontFaceCss } from './fonts.js';

/** ページ内でユニークな id 接頭辞を作る。同じ爪を複数箇所に描いても衝突しない */
let uidSeq = 0;
export function nextUid() { return 'u' + (++uidSeq) + '_'; }

const FALLBACK_COLOR = '#cccccc';

/** {c0} {c1} … を実際の色コードに置換する */
export function paint(markup, colors) {
  return markup.replace(/\{c(\d+)\}/g, (m, i) => colors[+i] || FALLBACK_COLOR);
}

/** id と、それを指す url(#…) / href="#…" をまとめて接頭辞つきに書き換える */
export function prefixIds(markup, prefix) {
  return markup
    .replace(/id="([^"]+)"/g, (m, id) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (m, id) => `url(#${prefix}${id})`)
    .replace(/(xlink:href|href)="#([^"]+)"/g, (m, a, id) => `${a}="#${prefix}${id}"`);
}

/** インデックスの配列をパレットの実色に解決する */
function colorsFromIdx(idx, slots, palette) {
  const out = [];
  for (let i = 0; i < slots; i++) {
    out.push(palette[idx[i]] !== undefined ? palette[idx[i]] : (palette[idx[0]] || FALLBACK_COLOR));
  }
  return out;
}

/** レイヤーの色スロットをパレットの実色に解決する */
function colorsFor(layer, part, palette) {
  const idx = (layer && layer.c && layer.c.length) ? layer.c : (part.defaultC || [0]);
  return colorsFromIdx(idx, part.slots || 1, palette);
}

/** 文字・手書きレイヤーの配置 transform（モチーフと同じ約束） */
function freeTransform(layer, h, scale) {
  const y = resolveY(layer.anchor || 'center', layer.y, h);
  let t = `translate(${round(layer.x != null ? layer.x : 50)} ${round(y)})`;
  if (layer.rot) t += ` rotate(${round(layer.rot)})`;
  if (scale && scale !== 1) t += ` scale(${round(scale, 4)})`;
  return t;
}

/** このデザインで実際に使われている書体の id（書き出し時にこれだけ埋め込む） */
export function usedFonts(design) {
  const set = new Set();
  for (const nail of design.nails) {
    for (const l of (nail.layers || [])) if (l.type === 'text') set.add(l.font || 'script');
  }
  return [...set];
}

/** パーツ1つぶんの markup（色解決・id接頭辞つき、外側の transform は含まない） */
function partMarkup(part, layer, palette, h, prefix) {
  let raw;
  if (part.cat === 'motif') {
    raw = part.svg;
  } else {
    const y = part.cat === 'edge'
      ? resolveY(layer.anchor || part.anchor || 'center', layer.y, h)
      : 0;
    raw = part.make({ h, y });
  }
  return prefixIds(paint(raw, colorsFor(layer, part, palette)), prefix);
}

/** モチーフの配置 transform。box の幅を layer.w に合わせる */
function motifTransform(part, layer, h) {
  const y = resolveY(layer.anchor || 'center', layer.y, h);
  const s = (layer.w || part.defaultW || 40) / part.box[0];
  let t = `translate(${round(layer.x != null ? layer.x : 50)} ${round(y)})`;
  if (layer.rot) t += ` rotate(${round(layer.rot)})`;
  t += ` scale(${round(layer.flip ? -s : s, 4)} ${round(s, 4)})`;
  return t;
}

function round(v, p = 2) {
  const f = Math.pow(10, p);
  return Math.round((Number(v) || 0) * f) / f;
}

/**
 * 爪1本の中身（clipPath と、その中に重ねたレイヤー）。
 * @param {boolean} interactive レイヤーに data-layer を付けてタップで拾えるようにする
 */
export function nailInner(design, nailIdx, opts = {}) {
  const nail = design.nails[nailIdx];
  const h = nailHeight(nail.length || design.length);
  const shape = nail.shape || design.shape;
  const uid = opts.uid || nextUid();
  const palette = design.palette;
  const clipId = uid + 'clip';

  let body = '';

  // ベース（常に最背面。1枚だけ）
  if (nail.base && getPart(nail.base.part)) {
    const p = getPart(nail.base.part);
    body += `<g data-base="1">${partMarkup(p, nail.base, palette, h, uid + 'b_')}</g>`;
  }

  // レイヤー
  (nail.layers || []).forEach((layer, li) => {
    const attrs = opts.interactive ? ` data-layer="${li}"` : '';
    const op = (layer.opacity != null && layer.opacity !== 1) ? ` opacity="${layer.opacity}"` : '';
    const prefix = `${uid}l${li}_`;

    // 文字と手書きはパーツを持たない。配置の約束はモチーフと同じ
    if (layer.type === 'text') {
      const inner = prefixIds(paint(textMarkup(layer), colorsFromIdx(layer.c || [5, 1], 2, palette)), prefix);
      body += `<g${attrs}${op} transform="${freeTransform(layer, h, 1)}">${inner}</g>`;
      return;
    }
    if (layer.type === 'ink') {
      const s = (layer.w || 60) / ((layer.box && layer.box[0]) || 60);
      const inner = prefixIds(paint(inkMarkup(layer), colorsFromIdx(layer.c || [5], 1, palette)), prefix);
      body += `<g${attrs}${op} transform="${freeTransform(layer, h, s)}">${inner}</g>`;
      return;
    }

    const part = getPart(layer.part);
    if (!part) return;   // 古いデータで消えたパーツを参照していても落とさない
    const inner = partMarkup(part, layer, palette, h, prefix);
    if (part.cat === 'motif') {
      body += `<g${attrs}${op} transform="${motifTransform(part, layer, h)}">${inner}</g>`;
    } else {
      body += `<g${attrs}${op}>${inner}</g>`;
    }
  });

  const d = nailPath(shape, h);
  let out = `<defs><clipPath id="${clipId}"><path d="${d}"/></clipPath></defs>`
          + `<g clip-path="url(#${clipId})">${body}</g>`;
  if (opts.outline) {
    out += `<path d="${d}" fill="none" stroke="${opts.outlineColor || 'rgba(120,90,105,.45)'}"`
         + ` stroke-width="${opts.outlineWidth || 1.6}" pointer-events="none"/>`;
  }
  return { markup: out, h, uid };
}

/**
 * 書き出し用のフォント埋め込み。
 * SVG-as-image は外部フォントを読まないので、使っている書体だけを base64 で入れる
 * （全書体を入れると SVG が数MBになり <img> の読み込みが遅くなる）。
 */
function fontDefs(design, opts) {
  if (!opts.embedFonts) return '';
  const ids = usedFonts(design);
  if (!ids.length) return '';
  return `<defs><style type="text/css">${fontFaceCss(ids)}</style></defs>`;
}

/** 爪1本ぶんの完成した SVG 文字列 */
export function nailSvg(design, nailIdx, opts = {}) {
  const scale = opts.scale || 1;
  const { markup, h } = nailInner(design, nailIdx, opts);
  const bg = opts.bgColor ? `<rect x="0" y="0" width="100" height="${h}" fill="${opts.bgColor}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(NAIL_W * scale)}"`
       + ` height="${Math.round(h * scale)}" viewBox="0 0 ${NAIL_W} ${h}">`
       + fontDefs(design, opts) + bg + markup + `</svg>`;
}

/**
 * 10本を2段5列に並べたシート。作例と同じ並び。
 */
export function sheetSvg(design, opts = {}) {
  const scale = opts.scale || 2;
  const gap = opts.gap != null ? opts.gap : 16;
  const cols = 5;
  const heights = design.nails.map((n, i) => nailHeight(n.length || design.length));
  const maxH = Math.max.apply(null, heights);
  const W = cols * NAIL_W + (cols + 1) * gap;
  const H = 2 * maxH + 3 * gap;

  let body = '';
  design.nails.forEach((nail, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = gap + col * (NAIL_W + gap);
    const y = gap + row * (maxH + gap);
    const { markup } = nailInner(design, i, { outline: opts.outline, outlineColor: opts.outlineColor });
    body += `<g transform="translate(${x} ${y})">${markup}</g>`;
  });

  const bg = opts.bgColor ? `<rect x="0" y="0" width="${W}" height="${H}" fill="${opts.bgColor}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(W * scale)}"`
       + ` height="${Math.round(H * scale)}" viewBox="0 0 ${W} ${H}">`
       + fontDefs(design, opts) + bg + body + `</svg>`;
}

/**
 * パーツ一覧のサムネイル。どのカテゴリでも「小さい爪に乗せた状態」で見せる。
 */
export function partThumbSvg(partId, palette, opts = {}) {
  const part = getPart(partId);
  if (!part) return '';
  const h = 155, uid = nextUid(), clipId = uid + 'clip';
  const d = nailPath('round', h);
  const baseColor = opts.baseColor || palette[0] || '#f4dde4';

  let body = `<rect x="-10" y="-20" width="120" height="${h + 40}" fill="${baseColor}"/>`;
  const layer = { c: part.defaultC, y: part.defaultY != null ? part.defaultY : 0, anchor: part.anchor };

  if (part.cat === 'base') {
    body = prefixIds(paint(part.make({ h }), colorsFor(layer, part, palette)), uid + 'p_');
  } else if (part.cat === 'motif') {
    const w = 62;
    const s = w / part.box[0];
    body += `<g transform="translate(50 ${h / 2}) scale(${round(s, 4)})">`
          + prefixIds(paint(part.svg, colorsFor(layer, part, palette)), uid + 'p_') + `</g>`;
  } else {
    body += prefixIds(paint(part.make({ h, y: resolveY(part.anchor || 'center', layer.y, h) }),
                            colorsFor(layer, part, palette)), uid + 'p_');
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${opts.px || 46}"`
       + ` height="${Math.round((opts.px || 46) * h / 100)}" viewBox="0 0 100 ${h}">`
       + `<defs><clipPath id="${clipId}"><path d="${d}"/></clipPath></defs>`
       + `<g clip-path="url(#${clipId})">${body}</g>`
       + `<path d="${d}" fill="none" stroke="rgba(120,90,105,.35)" stroke-width="2"/></svg>`;
}

/** レシピ（1本まるごとの完成テンプレ）のサムネイル */
export function recipeThumbSvg(recipe, palette, opts = {}) {
  const px = opts.px || 46;
  const fake = {
    shape: 'round', length: 'middle', palette,
    nails: [{ shape: null, length: null, base: recipe.base, layers: recipe.layers || [] }],
  };
  return nailSvg(fake, 0, { scale: px / NAIL_W, outline: true });
}

/** 選択中レイヤーの外接枠（回転済み）。エディタのハンドル描画に使う */
export function layerBox(design, nailIdx, layerIdx) {
  const nail = design.nails[nailIdx];
  const layer = nail.layers[layerIdx];
  if (!layer) return null;
  const h = nailHeight(nail.length || design.length);

  if (layer.type === 'text') {
    const [bw, bh] = textBox(layer);
    return { kind: 'motif', cx: layer.x != null ? layer.x : 50,
             cy: resolveY(layer.anchor || 'center', layer.y, h),
             w: bw, h: bh, rot: layer.rot || 0 };
  }
  if (layer.type === 'ink') {
    const bw = layer.w || 60;
    const box = layer.box || [60, 60];
    return { kind: 'motif', cx: layer.x != null ? layer.x : 50,
             cy: resolveY(layer.anchor || 'center', layer.y, h),
             w: bw, h: bw * (box[1] / box[0]), rot: layer.rot || 0 };
  }

  const part = getPart(layer.part);
  if (!part) return null;
  const cy = resolveY(layer.anchor || part.anchor || 'center', layer.y, h);

  if (part.cat === 'motif') {
    const w = layer.w || part.defaultW || 40;
    return { kind: 'motif', cx: layer.x != null ? layer.x : 50, cy, w, h: w * aspectOf(part), rot: layer.rot || 0 };
  }
  if (part.cat === 'edge') {
    return { kind: 'edge', cx: 50, cy, w: 100, h: 10, rot: 0 };
  }
  return { kind: 'full', cx: 50, cy: h / 2, w: 100, h, rot: 0 };
}
