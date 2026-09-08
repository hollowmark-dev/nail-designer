/**
 * パーツ追加定義（第1弾）。
 *
 * parts.js の規約に厳密に合わせる:
 *  - 色は {c0} {c1} … のプレースホルダで書く（var(--c0) は使わない）
 *  - gradient / pattern の id は短い固定名（1パーツ定義内でのみユニークならよい）
 *  - 外部参照・foreignObject・filter・mix-blend-mode は使わない
 *
 * cat ごとの持ち方は parts.js と同じ:
 *  - base    … make({h}) が全面の markup を返す
 *  - edge    … make({h, y}) の y は解決済みの実 Y 座標。anchor / defaultY 必須
 *  - pattern … make({h})
 *  - motif   … box[bw,bh] の中に原点中心で描く
 */

/** 爪より一回り大きい塗り。parts.js の full() と同じ実装（意図的に重複させている） */
const full = (fill, h) => `<rect x="-10" y="-20" width="120" height="${h + 40}" fill="${fill}"/>`;

/* ------------------------------------------------------------------ */
/* ベース（5つ）                                                        */
/* ------------------------------------------------------------------ */

export const EXTRA_BASES = {
  'base.bicolor_v': {
    name: 'バイカラー（上下）', slots: 2, defaultC: [0, 2], tags: ['定番'],
    make: ({ h }) =>
      `<rect x="-10" y="-20" width="120" height="${h / 2 + 20}" fill="{c0}"/>` +
      `<rect x="-10" y="${h / 2}" width="120" height="${h / 2 + 20}" fill="{c1}"/>`,
  },
  'base.bicolor_h': {
    name: 'バイカラー（左右）', slots: 2, defaultC: [0, 2], tags: ['定番'],
    make: ({ h }) =>
      `<rect x="-10" y="-20" width="60" height="${h + 40}" fill="{c0}"/>` +
      `<rect x="50" y="-20" width="60" height="${h + 40}" fill="{c1}"/>`,
  },
  'base.diagonal_french': {
    name: '斜めフレンチ風バイカラー', slots: 2, defaultC: [0, 2], tags: ['定番'],
    make: ({ h }) =>
      full('{c0}', h) +
      `<polygon points="-10,${h * 0.5} 110,${h * 0.15} 110,${h + 20} -10,${h + 20}" fill="{c1}"/>`,
  },
  'base.diagonal_grad': {
    name: '斜めグラデ', slots: 2, defaultC: [1, 2], tags: ['シンプル'],
    make: ({ h }) =>
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="1" stop-color="{c1}"/></linearGradient>` +
      full('url(#g)', h),
  },
  'base.clear': {
    name: 'クリア', slots: 1, defaultC: [0], tags: ['シンプル'],
    make: ({ h }) => `<rect x="-10" y="-20" width="120" height="${h + 40}" fill="{c0}" fill-opacity="0.28"/>`,
  },
};

/* ------------------------------------------------------------------ */
/* 縁（5つ）                                                            */
/* ------------------------------------------------------------------ */

/** 波型の輪郭（スカラップとは違い、上下に交互に振れるジグザグ波） */
function waveEdge(y, amp = 6, period = 14) {
  let d = `M -10 ${y}`;
  let x = -10;
  let up = true;
  while (x < 110) {
    const nx = Math.min(x + period, 110);
    const cy = up ? y - amp : y + amp;
    d += ` Q ${(x + nx) / 2} ${cy} ${nx} ${y}`;
    up = !up;
    x = nx;
  }
  return d;
}

/** 先端に向かって密度が増すドット群（ラメの代わり）。y は帯の開始 Y、h は爪の高さ */
function tipDots(y, h) {
  let s = '';
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1); // 0: 帯の開始側 / 1: 先端側（上）
    const ry = y - t * (y + 20);
    const count = 3 + Math.round(t * 7);
    const radius = 1.2 + t * 1.6;
    for (let i = 0; i < count; i++) {
      const rx = -10 + (i + 0.5) * (120 / count);
      s += `<circle cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="${radius.toFixed(1)}" fill="{c0}"/>`;
    }
  }
  return s;
}

export const EXTRA_EDGES = {
  'edge.diagonal_french': {
    name: '斜めフレンチ', slots: 1, defaultC: [1], tags: ['定番'],
    anchor: 'tip', defaultY: 30,
    make: ({ y }) =>
      `<polygon points="-10,${y - 15} 110,${y + 15} 110,-20 -10,-20" fill="{c0}"/>`,
  },
  'edge.v_french': {
    name: 'V字フレンチ', slots: 1, defaultC: [1], tags: ['定番'],
    anchor: 'tip', defaultY: 32,
    make: ({ y }) =>
      `<path d="M -10 ${y + 10} L 50 ${y - 14} L 110 ${y + 10} L 110 -20 L -10 -20 Z" fill="{c0}"/>`,
  },
  'edge.reverse_french': {
    name: '逆フレンチ', slots: 1, defaultC: [1], tags: ['定番'],
    anchor: 'root', defaultY: 28,
    make: ({ h, y }) =>
      `<rect x="-10" y="${y}" width="120" height="${Math.max(0, h + 20 - y)}" fill="{c0}"/>`,
  },
  'edge.lace_wave': {
    name: 'レース（波型）', slots: 2, defaultC: [1, 6], tags: ['ガーリー'],
    anchor: 'root', defaultY: 26,
    make: ({ h, y }) =>
      `<path d="${waveEdge(y)} L 110 ${h + 20} L -10 ${h + 20} Z" fill="{c0}"/>` +
      `<path d="${waveEdge(y)}" fill="none" stroke="{c1}" stroke-width="1.6" stroke-opacity="0.55"/>`,
  },
  'edge.tip_dots_grad': {
    name: '先端ドットグラデ', slots: 1, defaultC: [1], tags: ['定番'],
    anchor: 'tip', defaultY: 46,
    make: ({ h, y }) => tipDots(y, h),
  },
};

/* ------------------------------------------------------------------ */
/* 柄（7つ）                                                            */
/* ------------------------------------------------------------------ */

export const EXTRA_PATTERNS = {
  'pattern.gingham': {
    name: 'ギンガムチェック', slots: 2, defaultC: [1, 2], tags: ['定番'],
    make: ({ h }) =>
      `<pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="16" height="16" fill="{c0}"/>` +
      `<rect x="0" y="0" width="16" height="8" fill="{c1}" fill-opacity="0.5"/>` +
      `<rect x="0" y="0" width="8" height="16" fill="{c1}" fill-opacity="0.5"/>` +
      `</pattern>` + full('url(#p)', h),
  },
  'pattern.tartan': {
    name: 'タータンチェック', slots: 3, defaultC: [0, 5, 3], tags: ['季節'],
    make: ({ h }) =>
      `<pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="20" height="20" fill="{c0}"/>` +
      `<rect x="0" y="0" width="20" height="6" fill="{c1}" fill-opacity="0.5"/>` +
      `<rect x="0" y="0" width="6" height="20" fill="{c1}" fill-opacity="0.5"/>` +
      `<rect x="9" y="0" width="2" height="20" fill="{c2}" fill-opacity="0.8"/>` +
      `<rect x="0" y="9" width="20" height="2" fill="{c2}" fill-opacity="0.8"/>` +
      `</pattern>` + full('url(#p)', h),
  },
  'pattern.argyle': {
    name: 'アーガイル', slots: 3, defaultC: [4, 6, 1], tags: ['定番'],
    make: ({ h }) =>
      `<pattern id="p" width="24" height="24" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="24" height="24" fill="{c0}"/>` +
      `<rect x="4" y="4" width="16" height="16" fill="{c1}" transform="rotate(45 12 12)"/>` +
      `<g stroke="{c2}" stroke-width="1.4" stroke-opacity="0.7">` +
      `<line x1="0" y1="0" x2="24" y2="24"/><line x1="24" y1="0" x2="0" y2="24"/>` +
      `</g></pattern>` + full('url(#p)', h),
  },
  'pattern.border': {
    name: 'ボーダー', slots: 1, defaultC: [2], tags: ['定番'],
    make: ({ h }) =>
      `<pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="16" height="7" fill="{c0}"/></pattern>` + full('url(#p)', h),
  },
  'pattern.houndstooth': {
    name: '千鳥格子', slots: 2, defaultC: [5, 1], tags: ['オフィス'],
    make: ({ h }) =>
      `<pattern id="p" width="12" height="12" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="12" height="12" fill="{c1}"/>` +
      `<rect x="0" y="0" width="6" height="6" fill="{c0}"/>` +
      `<rect x="6" y="6" width="6" height="6" fill="{c0}"/>` +
      `<polygon points="6,0 9,0 6,3" fill="{c0}"/>` +
      `<polygon points="0,6 0,9 3,6" fill="{c0}"/>` +
      `<polygon points="6,12 3,12 6,9" fill="{c0}"/>` +
      `<polygon points="12,6 12,3 9,6" fill="{c0}"/>` +
      `</pattern>` + full('url(#p)', h),
  },
  'pattern.flower_hand': {
    name: '手描き風フラワー柄', slots: 2, defaultC: [1, 0], tags: ['ガーリー'],
    make: ({ h }) =>
      `<pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse">` +
      `<g fill="{c0}">` +
      `<circle cx="6" cy="5" r="2.6"/><circle cx="10.5" cy="7" r="2.6"/>` +
      `<circle cx="9" cy="11" r="2.6"/><circle cx="4" cy="10.5" r="2.6"/>` +
      `</g><circle cx="7" cy="8" r="1.6" fill="{c1}"/>` +
      `</pattern>` + full('url(#p)', h),
  },
  'pattern.dot_irregular': {
    name: '不規則ドット', slots: 1, defaultC: [7], tags: ['シンプル'],
    make: ({ h }) =>
      `<pattern id="p" width="24" height="22" patternUnits="userSpaceOnUse">` +
      `<circle cx="4" cy="5" r="1.6" fill="{c0}"/>` +
      `<circle cx="13" cy="3" r="2.6" fill="{c0}"/>` +
      `<circle cx="19" cy="10" r="1.2" fill="{c0}"/>` +
      `<circle cx="8" cy="14" r="2.2" fill="{c0}"/>` +
      `<circle cx="17" cy="18" r="1.8" fill="{c0}"/>` +
      `<circle cx="2" cy="19" r="1.3" fill="{c0}"/>` +
      `</pattern>` + full('url(#p)', h),
  },
};

/* ------------------------------------------------------------------ */
/* パーツ風モチーフ（5つ）                                               */
/* ------------------------------------------------------------------ */

export const EXTRA_MOTIFS = {
  'motif.pearl': {
    name: 'パール', box: [80, 80], slots: 2, defaultC: [1, 6], defaultW: 14, tags: ['定番'],
    svg:
      `<radialGradient id="q" cx="0.32" cy="0.28" r="0.9">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="0.6" stop-color="{c0}"/>` +
      `<stop offset="1" stop-color="{c1}"/></radialGradient>` +
      `<circle cx="0" cy="0" r="38" fill="url(#q)"/>` +
      `<ellipse cx="-13" cy="-14" rx="10" ry="7" fill="#ffffff" opacity="0.85" transform="rotate(-30 -13 -14)"/>`,
  },
  'motif.teardrop_stone': {
    name: '雫型ストーン', box: [68, 92], slots: 3, defaultC: [1, 3, 5], defaultW: 16, tags: ['定番'],
    svg:
      `<radialGradient id="q" cx="0.34" cy="0.24" r="0.9">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="0.55" stop-color="{c1}"/>` +
      `<stop offset="1" stop-color="{c2}"/></radialGradient>` +
      `<path d="M 0 -38 C 24 -6, 34 10, 34 22 C 34 41, 19 54, 0 54 ` +
      `C -19 54, -34 41, -34 22 C -34 10, -24 -6, 0 -38 Z" fill="url(#q)"/>` +
      `<ellipse cx="-11" cy="4" rx="9" ry="6" fill="#ffffff" opacity="0.7" transform="rotate(-25 -11 4)"/>`,
  },
  'motif.square_stone': {
    name: 'スクエアストーン', box: [70, 70], slots: 3, defaultC: [1, 2, 5], defaultW: 18, tags: ['オフィス'],
    svg:
      `<linearGradient id="q" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="0.5" stop-color="{c1}"/>` +
      `<stop offset="1" stop-color="{c2}"/></linearGradient>` +
      `<rect x="-30" y="-30" width="60" height="60" fill="url(#q)" stroke="{c2}" stroke-width="2"/>` +
      `<g stroke="#ffffff" stroke-width="1.4" stroke-opacity="0.55">` +
      `<line x1="-30" y1="-30" x2="30" y2="30"/><line x1="30" y1="-30" x2="-30" y2="30"/>` +
      `<line x1="0" y1="-30" x2="0" y2="30"/><line x1="-30" y1="0" x2="30" y2="0"/>` +
      `</g>`,
  },
  'motif.studs': {
    name: 'スタッズ', box: [50, 50], slots: 2, defaultC: [1, 6], defaultW: 14, tags: ['定番'],
    svg:
      `<rect x="-22" y="-22" width="44" height="44" rx="7" fill="{c1}"/>` +
      `<polygon points="-22,-22 22,-22 0,0" fill="{c0}"/>` +
      `<polygon points="-22,-22 -22,22 0,0" fill="{c0}" fill-opacity="0.55"/>` +
      `<polygon points="22,22 -22,22 0,0" fill="{c1}" fill-opacity="0.5"/>` +
      `<rect x="-22" y="-22" width="44" height="44" rx="7" fill="none" stroke="{c1}" stroke-width="2.6"/>`,
  },
  'motif.chain': {
    name: 'チェーン', box: [100, 28], slots: 1, defaultC: [5], defaultW: 40, tags: ['定番'],
    svg:
      `<g fill="none" stroke="{c0}" stroke-width="5.5">` +
      `<ellipse cx="-36" cy="0" rx="9" ry="13"/>` +
      `<ellipse cx="-18" cy="0" rx="13" ry="9"/>` +
      `<ellipse cx="0" cy="0" rx="9" ry="13"/>` +
      `<ellipse cx="18" cy="0" rx="13" ry="9"/>` +
      `<ellipse cx="36" cy="0" rx="9" ry="13"/>` +
      `</g>`,
  },
};
