/**
 * パーツ定義。
 *
 * 規約（Phase 0 で確定）:
 *  - 色は {c0} {c1} … のプレースホルダで書く。描画時に文字列置換で実色に落とす。
 *    var(--c0) は SVG-as-image で効かない環境があるので使わない
 *  - グラデーション等の id は短い固定名で書く。描画時に render.js が接頭辞を付け替える
 *    （同じパーツを2個置くと Chrome では id が衝突して同じ色になる。作例のリボン2個がこのケース）
 *
 * cat ごとの持ち方:
 *  - base    … 最背面。make({h}) が全面の markup を返す
 *  - edge    … 根元/先端に吸着する帯。make({h, y}) の y は解決済みの実 Y 座標
 *  - pattern … 爪全面のタイル。make({h})
 *  - motif   … 自由配置。box[bw,bh] の中に原点中心で描く。配置時に w/bw で拡大する
 *
 * パーツ本体はこのファイルと parts-extra-*.js に分かれている。
 * 増やすときは extra 側に足して、下の PARTS に登録するだけでよい。
 */

import {
  EXTRA_BASES as X1_BASES,
  EXTRA_EDGES as X1_EDGES,
  EXTRA_PATTERNS as X1_PATTERNS,
  EXTRA_MOTIFS as X1_MOTIFS,
} from './parts-extra-1.js';
import { EXTRA_MOTIFS as X2_MOTIFS } from './parts-extra-2.js';

/* ------------------------------------------------------------------ */
/* ベース                                                              */
/* ------------------------------------------------------------------ */

/** 爪より一回り大きい塗り。clipPath で切られる前提 */
const full = (fill, h) => `<rect x="-10" y="-20" width="120" height="${h + 40}" fill="${fill}"/>`;

const BASES = {
  'base.solid': {
    name: 'ワンカラー', tags: ['シンプル'], slots: 1, defaultC: [0],
    make: ({ h }) => full('{c0}', h),
  },
  'base.grad_v': {
    name: '上下グラデ', tags: ['韓国風'], slots: 2, defaultC: [1, 0],
    make: ({ h }) =>
      `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="1" stop-color="{c1}"/></linearGradient>` +
      full('url(#g)', h),
  },
  'base.grad_h': {
    name: '左右グラデ', tags: ['韓国風'], slots: 2, defaultC: [1, 0],
    make: ({ h }) =>
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="0">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="1" stop-color="{c1}"/></linearGradient>` +
      full('url(#g)', h),
  },
};

/* ------------------------------------------------------------------ */
/* 縁（根元・先端に吸着する帯。爪の輪郭沿いのパスは持たない）             */
/* ------------------------------------------------------------------ */

/**
 * スカラップ（半円の連なり）の輪郭。左から右へ描く。
 * down=true で下に膨らむ（先端側のレース）、false で上に膨らむ（根元側のレース）。
 */
function scallopEdge(y, down = true, r = 7.5) {
  const sweep = down ? 1 : 0;
  let d = `M -10 ${y}`;
  for (let x = -10; x < 110; x += r * 2) d += ` a ${r} ${r} 0 0 ${sweep} ${r * 2} 0`;
  return d;
}

const EDGES = {
  'edge.french': {
    name: 'フレンチ', tags: ['定番','オフィス'], slots: 1, defaultC: [1],
    anchor: 'tip', defaultY: 34,
    make: ({ y }) =>
      `<path d="M -10 ${y + 8} Q 50 ${y - 12} 110 ${y + 8} L 110 -20 L -10 -20 Z" fill="{c0}"/>`,
  },
  'edge.french_straight': {
    name: 'フレンチ（直線）', tags: ['オフィス'], slots: 1, defaultC: [1],
    anchor: 'tip', defaultY: 30,
    make: ({ y }) =>
      `<rect x="-10" y="-20" width="120" height="${Math.max(0, y + 20)}" fill="{c0}"/>`,
  },
  'edge.lace_scallop': {
    name: 'レース', tags: ['ガーリー'], slots: 2, defaultC: [1, 0],
    anchor: 'root', defaultY: 26,
    make: ({ h, y }) =>
      `<path d="${scallopEdge(y, false)} L 110 ${h + 20} L -10 ${h + 20} Z" fill="{c0}"/>` +
      `<path d="${scallopEdge(y, false)}" fill="none" stroke="{c1}" stroke-width="1.6" stroke-opacity="0.55"/>`,
  },
  'edge.lace_french': {
    // 先端側のレース。スカラップが甘皮に向かって垂れる
    name: 'レースフレンチ', tags: ['ガーリー'], slots: 2, defaultC: [1, 0],
    anchor: 'tip', defaultY: 34,
    make: ({ y }) =>
      `<path d="${scallopEdge(y, true)} L 110 -20 L -10 -20 Z" fill="{c0}"/>` +
      `<path d="${scallopEdge(y, true)}" fill="none" stroke="{c1}" stroke-width="1.6" stroke-opacity="0.55"/>`,
  },
  'edge.halfmoon': {
    name: 'ハーフムーン', tags: ['韓国風'], slots: 1, defaultC: [1],
    anchor: 'root', defaultY: 30,
    make: ({ h, y }) =>
      `<path d="M -10 ${y} Q 50 ${y - 24} 110 ${y} L 110 ${h + 20} L -10 ${h + 20} Z" fill="{c0}"/>`,
  },
  'edge.line': {
    name: 'ライン', tags: ['シンプル'], slots: 1, defaultC: [3],
    anchor: 'center', defaultY: 0,
    make: ({ y }) => `<rect x="-10" y="${y - 2.5}" width="120" height="5" fill="{c0}"/>`,
  },
  'edge.line_double': {
    name: 'ライン2本', tags: ['シンプル'], slots: 1, defaultC: [3],
    anchor: 'center', defaultY: 0,
    make: ({ y }) =>
      `<rect x="-10" y="${y - 7}" width="120" height="3.6" fill="{c0}"/>` +
      `<rect x="-10" y="${y + 3.4}" width="120" height="3.6" fill="{c0}"/>`,
  },
};

/* ------------------------------------------------------------------ */
/* 柄（全面タイル。pattern は Phase 0 で高解像度書き出しに耐えると確認済み） */
/* ------------------------------------------------------------------ */

const PATTERNS = {
  'pattern.dot_s': {
    name: '小ドット', tags: ['定番'], slots: 1, defaultC: [5],
    make: ({ h }) =>
      `<pattern id="p" width="10" height="10" patternUnits="userSpaceOnUse">` +
      `<circle cx="5" cy="5" r="2" fill="{c0}"/></pattern>` + full('url(#p)', h),
  },
  'pattern.dot_m': {
    name: '大ドット', tags: ['ガーリー'], slots: 1, defaultC: [1],
    make: ({ h }) =>
      `<pattern id="p" width="17" height="17" patternUnits="userSpaceOnUse">` +
      `<circle cx="8.5" cy="8.5" r="4.2" fill="{c0}"/></pattern>` + full('url(#p)', h),
  },
  'pattern.stripe': {
    name: 'ストライプ', tags: ['シンプル'], slots: 1, defaultC: [1],
    make: ({ h }) =>
      `<pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="6" height="14" fill="{c0}"/></pattern>` + full('url(#p)', h),
  },
};

/* ------------------------------------------------------------------ */
/* モチーフ（原点中心に描く。box = [幅, 高さ]）                          */
/* ------------------------------------------------------------------ */

/** 猫の顔。tabby=true で額に縞を足す */
function catFace(tabby) {
  return (
    // 耳
    `<path d="M -40 -14 L -33 -44 L -9 -29 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M 40 -14 L 33 -44 L 9 -29 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M -33 -19 L -29 -36 L -16 -27 Z" fill="{c2}"/>` +
    `<path d="M 33 -19 L 29 -36 L 16 -27 Z" fill="{c2}"/>` +
    // 顔
    `<ellipse cx="0" cy="4" rx="40" ry="33" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    (tabby
      ? `<g fill="none" stroke="{c3}" stroke-width="3.4" stroke-linecap="round">` +
        `<path d="M -15 -20 L -11 -9"/><path d="M 0 -24 L 0 -12"/><path d="M 15 -20 L 11 -9"/></g>`
      : '') +
    // 目（にっこり）・鼻・口
    `<g fill="none" stroke="{c1}" stroke-width="3.4" stroke-linecap="round">` +
    `<path d="M -25 3 Q -17 -6 -9 3"/><path d="M 9 3 Q 17 -6 25 3"/>` +
    `<path d="M -9 20 Q 0 26 9 20"/></g>` +
    `<path d="M -5 11 L 5 11 L 0 17 Z" fill="{c2}"/>` +
    // ほお
    `<circle cx="-27" cy="15" r="6" fill="{c2}" opacity="0.65"/>` +
    `<circle cx="27" cy="15" r="6" fill="{c2}" opacity="0.65"/>`
  );
}

/** 5枚花びらの小花 */
function flower() {
  let s = '';
  for (let i = 0; i < 5; i++) {
    s += `<ellipse cx="0" cy="-27" rx="15" ry="21" fill="{c0}" transform="rotate(${i * 72})"/>`;
  }
  return s + `<circle cx="0" cy="0" r="11" fill="{c1}"/>`;
}

const MOTIFS = {
  'motif.ribbon': {
    // 結び目から外へ開く三角。丸いループにすると小さいサイズで「∞」に見えてしまう
    name: 'リボン', tags: ['定番','ガーリー'], box: [104, 50], slots: 2, defaultC: [2, 5], defaultW: 44,
    svg:
      `<g fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round">` +
      `<path d="M -8 -2 L -45 -22 Q -50 -24 -50 -18 L -50 14 Q -50 20 -45 18 L -8 4 Z"/>` +
      `<path d="M 8 -2 L 45 -22 Q 50 -24 50 -18 L 50 14 Q 50 20 45 18 L 8 4 Z"/>` +
      `<path d="M -9 -7 Q 0 -3 9 -7 L 9 7 Q 0 11 -9 7 Z"/></g>`,
  },
  'motif.heart': {
    name: 'ハート', tags: ['定番'], box: [94, 67], slots: 1, defaultC: [3], defaultW: 34,
    svg:
      `<path d="M 0 26 C -28 6, -47 -8, -47 -22 C -47 -34, -35 -41, -25 -41 ` +
      `C -14 -41, -6 -33, 0 -25 C 6 -33, 14 -41, 25 -41 C 35 -41, 47 -34, 47 -22 ` +
      `C 47 -8, 28 6, 0 26 Z" fill="{c0}"/>`,
  },
  'motif.star': {
    name: '星', tags: ['定番'], box: [92, 87], slots: 1, defaultC: [1], defaultW: 30,
    svg:
      `<path d="M 0 -48 L 11.8 -16.2 L 45.7 -14.8 L 19 6.2 L 28.2 38.8 ` +
      `L 0 20 L -28.2 38.8 L -19 6.2 L -45.7 -14.8 L -11.8 -16.2 Z" fill="{c0}"/>`,
  },
  'motif.note8': {
    name: '音符', tags: ['定番'], box: [80, 108], slots: 1, defaultC: [5], defaultW: 30,
    svg:
      `<g fill="{c0}">` +
      `<path d="M 4 -55 L 12 -55 L 12 34 L 4 34 Z"/>` +
      `<path d="M 12 -55 C 38 -42, 44 -20, 30 2 C 38 -20, 30 -36, 12 -42 Z"/>` +
      `<ellipse cx="-14" cy="38" rx="22" ry="15" transform="rotate(-18 -14 38)"/></g>`,
  },
  'motif.clef': {
    name: 'ト音記号', tags: ['定番'], box: [46, 112], slots: 1, defaultC: [3], defaultW: 22,
    svg:
      `<path d="M -8 50 C 4 55, 11 43, 1 37 C -13 29, -21 14, -18 -3 ` +
      `C -15 -23, -2 -35, 3 -53 C 12 -35, 13 -13, 1 1 C -11 15, -15 29, -3 35 ` +
      `C 9 41, 17 27, 9 16" fill="none" stroke="{c0}" stroke-width="6.5" ` +
      `stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="-10" cy="50" r="4.5" fill="{c0}"/>`,
  },
  'motif.cat': {
    name: '猫', tags: ['動物'], box: [86, 82], slots: 3, defaultC: [1, 5, 0], defaultW: 46,
    svg: catFace(false),
  },
  'motif.cat_tabby': {
    name: '猫（トラ）', tags: ['動物'], box: [86, 82], slots: 4, defaultC: [4, 5, 0, 6], defaultW: 46,
    svg: catFace(true),
  },
  'motif.flower': {
    name: '小花', tags: ['花'], box: [96, 96], slots: 2, defaultC: [1, 3], defaultW: 30,
    svg: flower(),
  },
  'motif.stone': {
    name: 'ストーン', tags: ['パーツ風'], box: [96, 96], slots: 3, defaultC: [1, 2, 5], defaultW: 16,
    svg:
      `<radialGradient id="s" cx="0.34" cy="0.28" r="0.85">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="0.55" stop-color="{c1}"/>` +
      `<stop offset="1" stop-color="{c2}"/></radialGradient>` +
      `<circle cx="0" cy="0" r="48" fill="url(#s)"/>` +
      `<ellipse cx="-16" cy="-18" rx="13" ry="9" fill="#ffffff" opacity="0.72" ` +
      `transform="rotate(-30 -16 -18)"/>`,
  },
};

/* ------------------------------------------------------------------ */
/* 索引                                                                */
/* ------------------------------------------------------------------ */

function tag(obj, cat) {
  const out = {};
  for (const id of Object.keys(obj)) out[id] = Object.assign({ id, cat }, obj[id]);
  return out;
}

export const PARTS = Object.assign(
  {},
  tag(BASES, 'base'),
  tag(X1_BASES, 'base'),
  tag(EDGES, 'edge'),
  tag(X1_EDGES, 'edge'),
  tag(PATTERNS, 'pattern'),
  tag(X1_PATTERNS, 'pattern'),
  tag(MOTIFS, 'motif'),
  tag(X1_MOTIFS, 'motif'),
  tag(X2_MOTIFS, 'motif'),
);

export const CATS = [
  { key: 'base',    label: 'ベース' },
  { key: 'edge',    label: '縁' },
  { key: 'pattern', label: '柄' },
  { key: 'motif',   label: 'パーツ' },
];

export function getPart(id) { return PARTS[id] || null; }

/** @param {string} [tag] 指定するとそのタグを持つものだけ返す */
export function listByCat(cat, tag) {
  return Object.values(PARTS)
    .filter(p => p.cat === cat)
    .filter(p => !tag || (p.tags || []).includes(tag));
}

/** そのカテゴリに実際に存在するタグを、パーツ数の多い順に返す */
export function allTags(cat) {
  const count = new Map();
  for (const p of Object.values(PARTS)) {
    if (p.cat !== cat) continue;
    for (const t of (p.tags || [])) count.set(t, (count.get(t) || 0) + 1);
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);
}

/** モチーフの縦横比（高さ / 幅） */
export function aspectOf(part) {
  return part.box ? part.box[1] / part.box[0] : 1;
}
