/**
 * デザインのデータ構造と操作。
 *
 * 座標は「幅を100とする整数」。y は anchor（root / tip / center）からの距離。
 * 色は palette のインデックスで持つので、パレットを差し替えると全体が連動する。
 */

import { LENGTHS, SHAPES, nailHeight, unresolveY } from './parts/shapes.js';
import { getPart, aspectOf } from './parts/parts.js';
import { DEFAULT_TEXT } from './text.js';
import { DEFAULT_PEN } from './ink.js';

export const SCHEMA = 1;
export const NAIL_COUNT = 10;

/** 0 ピンク / 1 白 / 2 水色 / 3 赤 / 4 クリーム / 5 チャコール / 6 グレージュ / 7 オレンジ / 8 緑 */
export const DEFAULT_PALETTE =
  ['#F9D2DC', '#FFFFFF', '#7FD4F0', '#E8425A', '#FCF3D0', '#4A3A40', '#B9A0AA', '#E8A05C', '#8FBF6B'];

export const PALETTE_PRESETS = [
  { name: 'ガーリー',   colors: ['#F9D2DC', '#FFFFFF', '#7FD4F0', '#E8425A', '#FCF3D0', '#4A3A40', '#B9A0AA', '#E8A05C', '#8FBF6B'] },
  { name: 'くすみ',     colors: ['#D9C3C0', '#FBF7F3', '#A8B9AE', '#9A6B62', '#EADFCF', '#4B4340', '#C0AFA6', '#C99A6E', '#93A98A'] },
  { name: 'モノトーン', colors: ['#EDEDEF', '#FFFFFF', '#B9BCC4', '#E8425A', '#F5F5F7', '#22222A', '#8A8D96', '#C7A87E', '#9AA79B'] },
];

function uid() {
  return 'd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

export function emptyNail() {
  return {
    shape: null,     // null = デザイン全体の設定を使う
    length: null,
    scale: 1,        // 指ごとの幅倍率。v1 は常に1（親指を広くしたくなった時のため予約）
    base: { part: 'base.solid', c: [0] },
    layers: [],
  };
}

export function newDesign(name) {
  const nails = [];
  for (let i = 0; i < NAIL_COUNT; i++) nails.push(emptyNail());
  return {
    schema: SCHEMA,
    id: uid(),
    name: name || '無題',
    shape: 'round',
    length: 'middle',
    palette: DEFAULT_PALETTE.slice(),
    nails,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * 古い形式を今の形式に寄せる。
 * 配った相手の端末に古いデータが残ったままアプリだけ更新されるので、読み込みは必ずここを通す。
 */
export function migrate(d) {
  if (!d || typeof d !== 'object') return newDesign();
  const out = Object.assign({}, d);

  out.schema = SCHEMA;
  if (!out.id) out.id = uid();
  if (typeof out.name !== 'string') out.name = '無題';
  if (!SHAPES[out.shape]) out.shape = 'round';
  if (!LENGTHS[out.length]) out.length = 'middle';
  if (!Array.isArray(out.palette) || !out.palette.length) out.palette = DEFAULT_PALETTE.slice();
  // あとから既定パレットに色を足しても、古いデータが灰色にならないよう埋める
  for (let i = out.palette.length; i < DEFAULT_PALETTE.length; i++) out.palette.push(DEFAULT_PALETTE[i]);
  if (!out.createdAt) out.createdAt = Date.now();
  if (!out.updatedAt) out.updatedAt = out.createdAt;

  const nails = Array.isArray(out.nails) ? out.nails.slice(0, NAIL_COUNT) : [];
  while (nails.length < NAIL_COUNT) nails.push(emptyNail());
  out.nails = nails.map(n => {
    const nail = Object.assign(emptyNail(), n || {});
    if (nail.shape && !SHAPES[nail.shape]) nail.shape = null;
    if (nail.length && !LENGTHS[nail.length]) nail.length = null;
    if (!nail.base || !getPart(nail.base.part)) nail.base = { part: 'base.solid', c: [0] };
    // 消えたパーツを参照していても落とさない。文字と手書きはパーツを持たない
    nail.layers = (Array.isArray(nail.layers) ? nail.layers : [])
      .filter(l => l && (l.type === 'text' || l.type === 'ink' ? true : getPart(l.part)))
      .map(l => Object.assign({}, l));
    return nail;
  });

  return out;
}

export function touch(design) {
  design.updatedAt = Date.now();
  return design;
}

export function clone(design) {
  return JSON.parse(JSON.stringify(design));
}

/* ------------------------------------------------------------------ */
/* レイヤー操作                                                        */
/* ------------------------------------------------------------------ */

/** パーツを1つ置く。cat ごとに妥当な初期値を入れる。戻り値は新しいレイヤーの index */
export function addLayer(design, nailIdx, partId) {
  const part = getPart(partId);
  if (!part) return -1;
  const nail = design.nails[nailIdx];
  const h = nailHeight(nail.length || design.length);

  if (part.cat === 'base') {
    nail.base = { part: partId, c: (part.defaultC || [0]).slice() };
    return -1;
  }

  const layer = { part: partId, c: (part.defaultC || [0]).slice() };

  if (part.cat === 'motif') {
    layer.anchor = 'center';
    layer.x = 50;
    layer.y = 0;
    layer.w = part.defaultW || 40;
    layer.rot = 0;
  } else if (part.cat === 'edge') {
    layer.anchor = part.anchor || 'center';
    layer.y = part.defaultY != null ? part.defaultY : 0;
  }
  // pattern は位置を持たない

  // 柄は1爪に1つまで。同じ柄を重ねても見た目が汚れるだけ
  if (part.cat === 'pattern') {
    const existing = nail.layers.findIndex(l => (getPart(l.part) || {}).cat === 'pattern');
    if (existing >= 0) {
      nail.layers[existing] = layer;
      return existing;
    }
    // 柄はモチーフより下に入れる
    const firstMotif = nail.layers.findIndex(l => (getPart(l.part) || {}).cat === 'motif');
    const at = firstMotif < 0 ? nail.layers.length : firstMotif;
    nail.layers.splice(at, 0, layer);
    return at;
  }

  nail.layers.push(layer);
  return nail.layers.length - 1;
}

export function removeLayer(design, nailIdx, layerIdx) {
  const layers = design.nails[nailIdx].layers;
  if (layerIdx < 0 || layerIdx >= layers.length) return false;
  layers.splice(layerIdx, 1);
  return true;
}

export function duplicateLayer(design, nailIdx, layerIdx) {
  const layers = design.nails[nailIdx].layers;
  const src = layers[layerIdx];
  if (!src) return -1;
  const copy = JSON.parse(JSON.stringify(src));
  if (copy.x != null) copy.x = Math.min(92, copy.x + 8);
  if (copy.y != null) copy.y = copy.y + 8;
  layers.splice(layerIdx + 1, 0, copy);
  return layerIdx + 1;
}

/** 重ね順を1つ動かす。戻り値は移動後の index */
export function moveLayer(design, nailIdx, layerIdx, dir) {
  const layers = design.nails[nailIdx].layers;
  const to = layerIdx + dir;
  if (to < 0 || to >= layers.length) return layerIdx;
  const [l] = layers.splice(layerIdx, 1);
  layers.splice(to, 0, l);
  return to;
}

/** ドラッグ結果の実座標を、anchor 基準の値に戻して書き込む */
export function setLayerPos(design, nailIdx, layerIdx, actualX, actualY) {
  const nail = design.nails[nailIdx];
  const layer = nail.layers[layerIdx];
  if (!layer) return;
  const part = getPart(layer.part);
  const h = nailHeight(nail.length || design.length);
  // 自由配置できるもの（モチーフ・文字・手書き）だけ横に動かせる。縁は上下だけ
  const free = layer.type === 'text' || layer.type === 'ink' || (part && part.cat === 'motif');
  if (free) layer.x = clamp(actualX, -20, 120);
  layer.y = unresolveY(layer.anchor || (part && part.anchor) || 'center', actualY, h);
}

/** 文字レイヤーを追加する。戻り値は新しいレイヤーの index */
export function addTextLayer(design, nailIdx, text, opts = {}) {
  const layer = Object.assign({}, DEFAULT_TEXT, opts, { s: text || 'A' });
  design.nails[nailIdx].layers.push(layer);
  return design.nails[nailIdx].layers.length - 1;
}

/** 手書きストロークを追加する。d と box は ink.js の normalize() の結果を渡す */
export function addInkLayer(design, nailIdx, { d, box }, opts = {}) {
  const layer = Object.assign({
    type: 'ink', d, box,
    anchor: 'center', x: 50, y: 0, w: box[0], rot: 0,
    sw: DEFAULT_PEN.sw, c: [DEFAULT_PEN.colorSlot],
  }, opts);
  design.nails[nailIdx].layers.push(layer);
  return design.nails[nailIdx].layers.length - 1;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ------------------------------------------------------------------ */
/* 10本への一括展開                                                    */
/* ------------------------------------------------------------------ */

/** 1本を残り9本に流し込む */
export function applyToAll(design, srcIdx) {
  const src = JSON.stringify(design.nails[srcIdx]);
  for (let i = 0; i < NAIL_COUNT; i++) if (i !== srcIdx) design.nails[i] = JSON.parse(src);
}

/**
 * 上段5本（左手）を反転して下段5本（右手）へ。
 * 同じ指どうしが対応するよう、親指は親指へ写す（端から折り返さない）。
 */
export function mirrorHands(design) {
  for (let i = 0; i < 5; i++) {
    const copy = JSON.parse(JSON.stringify(design.nails[i]));
    copy.layers.forEach(l => {
      if (l.x != null) l.x = 100 - l.x;
      if (l.rot) l.rot = -l.rot;
    });
    design.nails[5 + i] = copy;
  }
}

/** ベース（地の色）だけを全部に適用する。モチーフはそのまま */
export function applyBaseToAll(design, srcIdx) {
  const base = JSON.stringify(design.nails[srcIdx].base);
  design.nails.forEach(n => { n.base = JSON.parse(base); });
}

/**
 * 指の並び。上段が左手、下段が右手。どちらも親指→小指の順。
 * 「薬指だけ別デザイン」を指定できるよう、並びを画面にも出す。
 */
export const FINGERS = ['親', '人', '中', '薬', '小'];
export const ACCENT_INDEXES = [3, 8];   // 両手の薬指

/** 今の1本をアクセント以外に流し込む（薬指だけ今のデザインを残す定番の形） */
export function applyToAllExceptAccent(design, srcIdx, accent = ACCENT_INDEXES) {
  const src = JSON.stringify(design.nails[srcIdx]);
  for (let i = 0; i < NAIL_COUNT; i++) {
    if (i === srcIdx || accent.includes(i)) continue;
    design.nails[i] = JSON.parse(src);
  }
}

/** レシピ（1本まるごとの完成テンプレ）を1本に流し込む */
export function applyRecipe(design, nailIdx, recipe) {
  const nail = design.nails[nailIdx];
  nail.base = JSON.parse(JSON.stringify(recipe.base));
  nail.layers = JSON.parse(JSON.stringify(recipe.layers || []));
}

/* ------------------------------------------------------------------ */
/* Undo / Redo                                                         */
/* ------------------------------------------------------------------ */

/**
 * デザインは小さな JSON なので、まるごとスナップショットを積むだけで足りる。
 * 変更経路ごとにフックを足すより単純で、取りこぼしがない。
 */
export function createHistory(initial, limit = 60) {
  let stack = [JSON.stringify(initial)];
  let pos = 0;

  return {
    push(state) {
      const s = JSON.stringify(state);
      if (s === stack[pos]) return;          // 変化なしなら積まない
      stack = stack.slice(0, pos + 1);
      stack.push(s);
      if (stack.length > limit) stack.shift();
      pos = stack.length - 1;
    },
    undo() { if (pos > 0) { pos--; return JSON.parse(stack[pos]); } return null; },
    redo() { if (pos < stack.length - 1) { pos++; return JSON.parse(stack[pos]); } return null; },
    canUndo() { return pos > 0; },
    canRedo() { return pos < stack.length - 1; },
    reset(state) { stack = [JSON.stringify(state)]; pos = 0; },
  };
}

/* ------------------------------------------------------------------ */
/* バックアップ（データ喪失に対する唯一の保険）                          */
/* ------------------------------------------------------------------ */

export function exportJson(designs) {
  return JSON.stringify({
    app: 'nail_designer', schema: SCHEMA, exportedAt: new Date().toISOString(),
    designs: Array.isArray(designs) ? designs : [designs],
  }, null, 1);
}

/** 書き出した JSON を読む。単体デザイン / 束のどちらでも受ける */
export function importJson(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data
             : Array.isArray(data.designs) ? data.designs
             : [data];
  return list.map(d => {
    const m = migrate(d);
    m.id = uid();                 // 取り込みは常に別物として扱う（既存を上書きしない）
    m.updatedAt = Date.now();
    return m;
  });
}

export { aspectOf };
