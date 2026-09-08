/**
 * パーツ追加定義（第3弾・トレンド質感/柄/フレンチ）。
 *
 * parts.js の規約に厳密に合わせる:
 *  - 色は {c0} {c1} … のプレースホルダで書く（var(--c0) は使わない）
 *  - gradient / pattern の id は短い固定名（1パーツ定義内でのみユニークならよい）
 *  - 外部参照・foreignObject・filter・mix-blend-mode は使わない
 *  - linearGradient / radialGradient / fill-opacity は使用可（実機確認済み）
 *
 * cat ごとの持ち方は parts.js と同じ:
 *  - base    … make({h}) が全面の markup を返す
 *  - edge    … make({h, y}) の y は解決済みの実 Y 座標。anchor / defaultY 必須
 *  - pattern … make({h})
 */

/** 爪より一回り大きい塗り。parts.js の full() と同じ実装（意図的に重複させている） */
const full = (fill, h) => `<rect x="-10" y="-20" width="120" height="${h + 40}" fill="${fill}"/>`;

/* ------------------------------------------------------------------ */
/* ベース（8つ）                                                        */
/* ------------------------------------------------------------------ */

export const EXTRA_BASES = {
  'base.magnet': {
    // マグネット（猫目）。中央に明るい帯が縦に走る、コントラスト強めの多段グラデ
    name: 'マグネット', tags: ['トレンド'], slots: 2, defaultC: [5, 2],
    make: ({ h }) =>
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="0">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="0.36" stop-color="{c0}"/>` +
      `<stop offset="0.47" stop-color="{c1}"/><stop offset="0.53" stop-color="{c1}"/>` +
      `<stop offset="0.64" stop-color="{c0}"/><stop offset="1" stop-color="{c0}"/>` +
      `</linearGradient>` + full('url(#g)', h),
  },
  'base.mirror': {
    // ミラー。斜めの明暗バンドを急なストップで硬く見せる
    name: 'ミラー', tags: ['トレンド'], slots: 3, defaultC: [5, 6, 1],
    make: ({ h }) =>
      `<linearGradient id="g" x1="0" y1="0" x2="0.55" y2="1">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="0.2" stop-color="{c0}"/>` +
      `<stop offset="0.22" stop-color="{c1}"/><stop offset="0.38" stop-color="{c1}"/>` +
      `<stop offset="0.4" stop-color="{c0}"/><stop offset="0.62" stop-color="{c0}"/>` +
      `<stop offset="0.64" stop-color="{c2}"/><stop offset="0.8" stop-color="{c2}"/>` +
      `<stop offset="0.82" stop-color="{c0}"/><stop offset="1" stop-color="{c0}"/>` +
      `</linearGradient>` + full('url(#g)', h),
  },
  'base.aurora': {
    // オーロラ。複数色がなめらかに移り変わる斜めグラデ
    name: 'オーロラ', tags: ['トレンド'], slots: 4, defaultC: [2, 0, 1, 6],
    make: ({ h }) =>
      `<linearGradient id="g" x1="0" y1="1" x2="0.7" y2="0">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="0.35" stop-color="{c1}"/>` +
      `<stop offset="0.65" stop-color="{c2}"/><stop offset="1" stop-color="{c3}"/>` +
      `</linearGradient>` + full('url(#g)', h),
  },
  'base.bekko': {
    // べっ甲。半透明の濃淡の塊を radialGradient + fill-opacity で重ねる
    name: 'べっ甲', tags: ['トレンド'], slots: 3, defaultC: [4, 7, 5],
    make: ({ h }) =>
      full('{c0}', h) +
      `<radialGradient id="g1" cx="0.4" cy="0.35" r="0.7">` +
      `<stop offset="0" stop-color="{c1}"/><stop offset="0.6" stop-color="{c1}"/>` +
      `<stop offset="1" stop-color="{c0}"/></radialGradient>` +
      `<ellipse cx="26" cy="${h * 0.22}" rx="34" ry="26" fill="url(#g1)" fill-opacity="0.75" transform="rotate(-18 26 ${h * 0.22})"/>` +
      `<ellipse cx="74" cy="${h * 0.5}" rx="30" ry="38" fill="url(#g1)" fill-opacity="0.7" transform="rotate(12 74 ${h * 0.5})"/>` +
      `<ellipse cx="30" cy="${h * 0.78}" rx="36" ry="28" fill="url(#g1)" fill-opacity="0.7" transform="rotate(-10 30 ${h * 0.78})"/>` +
      `<radialGradient id="g2" cx="0.5" cy="0.5" r="0.7">` +
      `<stop offset="0" stop-color="{c2}"/><stop offset="0.55" stop-color="{c2}"/>` +
      `<stop offset="1" stop-color="{c1}"/></radialGradient>` +
      `<ellipse cx="55" cy="${h * 0.4}" rx="20" ry="24" fill="url(#g2)" fill-opacity="0.6"/>` +
      `<ellipse cx="18" cy="${h * 0.62}" rx="16" ry="20" fill="url(#g2)" fill-opacity="0.55"/>`,
  },
  'base.tiedye': {
    // タイダイ。外側を透明に落とした大きな円を重ねて、境目が溶けるようにする。
    // filter が使えないので、にじみは radialGradient の stop-opacity で作る
    name: 'タイダイ', tags: ['トレンド'], slots: 4, defaultC: [1, 0, 2, 7],
    make: ({ h }) => {
      const blobs = [[1, 26, 0.22, 50], [2, 76, 0.40, 46], [3, 38, 0.66, 52], [2, 80, 0.88, 42]];
      let out = full('{c0}', h);
      blobs.forEach(([ci, cx, ty, r], i) => {
        out += `<radialGradient id="b${i}" cx="0.5" cy="0.5" r="0.5">`
             + `<stop offset="0" stop-color="{c${ci}}" stop-opacity="0.9"/>`
             + `<stop offset="0.55" stop-color="{c${ci}}" stop-opacity="0.5"/>`
             + `<stop offset="1" stop-color="{c${ci}}" stop-opacity="0"/></radialGradient>`
             + `<circle cx="${cx}" cy="${(h * ty).toFixed(1)}" r="${r}" fill="url(#b${i})"/>`;
      });
      return out;
    },
  },
  'base.marble': {
    // マーブル。実寸40px でも筋が見えるよう、線を太くして不透明度も上げる
    name: 'マーブル', tags: ['トレンド'], slots: 2, defaultC: [1, 6],
    make: ({ h }) => {
      const y = t => (h * t).toFixed(1);
      return full('{c0}', h) +
        `<g fill="none" stroke="{c1}" stroke-linecap="round">` +
        `<path d="M -10 ${y(0.20)} Q 28 ${y(0.10)} 52 ${y(0.30)} T 110 ${y(0.22)}" stroke-width="3.4" stroke-opacity="0.75"/>` +
        `<path d="M -10 ${y(0.56)} Q 38 ${y(0.70)} 62 ${y(0.48)} T 110 ${y(0.62)}" stroke-width="3" stroke-opacity="0.65"/>` +
        `<path d="M -10 ${y(0.86)} Q 34 ${y(0.97)} 68 ${y(0.80)} T 110 ${y(0.92)}" stroke-width="2.6" stroke-opacity="0.55"/>` +
        `<path d="M 6 ${y(0.24)} Q 40 ${y(0.16)} 58 ${y(0.34)}" stroke-width="1.4" stroke-opacity="0.9"/>` +
        `<path d="M 4 ${y(0.60)} Q 46 ${y(0.73)} 70 ${y(0.52)}" stroke-width="1.2" stroke-opacity="0.8"/>` +
        `</g>`;
    },
  },
  'base.gemstone': {
    // 天然石。不規則な多角形の層を fill-opacity で重ね、細い金色ラインを2本入れる
    name: '天然石', tags: ['トレンド'], slots: 4, defaultC: [2, 0, 5, 7],
    make: ({ h }) =>
      full('{c0}', h) +
      `<polygon points="-8,${h * 0.1} 60,${h * 0.02} 108,${h * 0.28} 70,${h * 0.42} -6,${h * 0.35}" fill="{c1}" fill-opacity="0.55"/>` +
      `<polygon points="-4,${h * 0.42} 62,${h * 0.36} 106,${h * 0.6} 66,${h * 0.78} -6,${h * 0.7}" fill="{c2}" fill-opacity="0.4"/>` +
      `<polygon points="0,${h * 0.7} 58,${h * 0.66} 104,${h * 0.9} 60,${h + 16} -6,${h + 16}" fill="{c1}" fill-opacity="0.45"/>` +
      `<path d="M -8 ${h * 0.3} L 106 ${h * 0.58}" stroke="{c3}" stroke-width="1.6" stroke-opacity="0.8"/>` +
      `<path d="M -6 ${h * 0.62} L 100 ${h * 0.85}" stroke="{c3}" stroke-width="1.2" stroke-opacity="0.65"/>`,
  },
  'base.nuance': {
    // ニュアンス。不規則な曲線の塊をいくつか置いた抽象柄
    name: 'ニュアンス', tags: ['シンプル'], slots: 3, defaultC: [0, 4, 6],
    make: ({ h }) =>
      full('{c0}', h) +
      `<path d="M -10 ${h * 0.05} C 20 ${h * 0.02}, 46 ${h * 0.22}, 30 ${h * 0.4} C 14 ${h * 0.56}, -10 ${h * 0.5}, -10 ${h * 0.3} Z" fill="{c1}" fill-opacity="0.65"/>` +
      `<path d="M 60 ${h * 0.3} C 90 ${h * 0.24}, 112 ${h * 0.42}, 100 ${h * 0.6} C 88 ${h * 0.76}, 56 ${h * 0.68}, 58 ${h * 0.48} Z" fill="{c2}" fill-opacity="0.6"/>` +
      `<path d="M 10 ${h * 0.62} C 40 ${h * 0.58}, 56 ${h * 0.8}, 36 ${h + 10} C 20 ${h + 16}, -4 ${h * 0.92}, 4 ${h * 0.78} Z" fill="{c1}" fill-opacity="0.5"/>`,
  },
};

/* ------------------------------------------------------------------ */
/* 縁（6つ）                                                            */
/* ------------------------------------------------------------------ */

/** ぼかしフレンチ用: フレンチ形の帯を不透明度を上げながら数枚重ね、境界を滲ませる */
function blurFrench(y) {
  const n = 5;
  let s = '';
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1); // 0: 境界寄り(y) / 1: 先端寄り
    const yy = y - t * (y + 14);
    const op = (0.16 + t * 0.21).toFixed(2);
    s += `<path d="M -10 ${(yy + 6).toFixed(1)} Q 50 ${(yy - 10).toFixed(1)} 110 ${(yy + 6).toFixed(1)} L 110 -20 L -10 -20 Z" fill="{c0}" fill-opacity="${op}"/>`;
  }
  return s;
}

export const EXTRA_EDGES = {
  'edge.skinny_french': {
    name: 'スキニーフレンチ', tags: ['シンプル'], slots: 1, defaultC: [3],
    anchor: 'tip', defaultY: 12,
    make: ({ y }) =>
      `<path d="M -10 ${y + 3} Q 50 ${y - 5} 110 ${y + 3} L 110 -20 L -10 -20 Z" fill="{c0}"/>`,
  },
  'edge.double_french': {
    name: 'ダブルフレンチ', tags: ['トレンド'], slots: 2, defaultC: [3, 1],
    anchor: 'tip', defaultY: 32,
    make: ({ y }) =>
      `<path d="M -10 ${y + 8} Q 50 ${y - 12} 110 ${y + 8} L 110 -20 L -10 -20 Z" fill="{c0}"/>` +
      `<path d="M -10 ${y - 4} Q 50 ${y - 22} 110 ${y - 4} L 110 -20 L -10 -20 Z" fill="{c1}"/>`,
  },
  'edge.heart_french': {
    name: 'ハートフレンチ', tags: ['ガーリー'], slots: 1, defaultC: [0],
    anchor: 'tip', defaultY: 34,
    make: ({ y }) =>
      `<path d="M -10 ${y + 6} Q 10 ${y - 8} 30 ${y + 2} Q 42 ${y - 10} 50 ${y + 4} Q 58 ${y - 10} 70 ${y + 2} Q 90 ${y - 8} 110 ${y + 6} L 110 -20 L -10 -20 Z" fill="{c0}"/>`,
  },
  'edge.gradient_french': {
    name: 'ぼかしフレンチ', tags: ['トレンド'], slots: 1, defaultC: [1],
    anchor: 'tip', defaultY: 36,
    make: ({ y }) => blurFrench(y),
  },
  'edge.mirror_tip': {
    name: 'ミラー先端', tags: ['トレンド'], slots: 2, defaultC: [6, 1],
    anchor: 'tip', defaultY: 30,
    make: ({ y }) =>
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="0">` +
      `<stop offset="0" stop-color="{c0}"/><stop offset="0.3" stop-color="{c1}"/>` +
      `<stop offset="0.5" stop-color="{c0}"/><stop offset="0.7" stop-color="{c1}"/>` +
      `<stop offset="1" stop-color="{c0}"/></linearGradient>` +
      `<path d="M -10 ${y + 8} Q 50 ${y - 12} 110 ${y + 8} L 110 -20 L -10 -20 Z" fill="url(#g)"/>`,
  },
  'edge.deep_french': {
    name: '深フレンチ', tags: ['トレンド'], slots: 1, defaultC: [5],
    anchor: 'tip', defaultY: 46,
    make: ({ y }) =>
      `<path d="M -10 ${y + 26} Q 40 ${y - 6} 70 ${y - 2} Q 95 ${y + 2} 110 ${y - 20} L 110 -20 L -10 -20 Z" fill="{c0}"/>`,
  },
};

/* ------------------------------------------------------------------ */
/* 柄（9つ）                                                            */
/* ------------------------------------------------------------------ */

/** ラメ。大きさと不透明度をばらけさせた小さな円・三角を散らす（filter は使わない） */
function glitterTile() {
  return (
    `<circle cx="4" cy="5" r="1.1" fill="{c0}" fill-opacity="0.9"/>` +
    `<circle cx="14" cy="3" r="0.9" fill="{c0}" fill-opacity="0.6"/>` +
    `<polygon points="18,12 19.8,15.2 16.2,15.2" fill="{c0}" fill-opacity="0.75"/>` +
    `<circle cx="9" cy="14" r="1.4" fill="{c0}" fill-opacity="0.7"/>` +
    `<polygon points="3,17 4.9,20.4 1.1,20.4" fill="{c0}" fill-opacity="0.55"/>` +
    `<circle cx="19" cy="20" r="1" fill="{c0}" fill-opacity="0.85"/>`
  );
}

/** 先端に向かって密度・粒サイズが増すラメ（爪全面。y=-20 が先端側） */
function tipGlitterRows(h) {
  const rows = 8;
  let s = '';
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1); // 0: 根元側 / 1: 先端側
    const y = h + 20 - t * (h + 40);
    const count = 3 + Math.round(t * 8);
    const baseR = 0.7 + t * 1.5;
    for (let i = 0; i < count; i++) {
      const x = -10 + (i + 0.5) * (120 / count);
      const rr = Math.max(0.5, baseR * (0.6 + 0.4 * Math.sin(i * 2.1 + r)));
      const op = (0.35 + 0.5 * Math.abs(Math.sin(i * 1.7 + r * 0.5))).toFixed(2);
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" fill="{c0}" fill-opacity="${op}"/>`;
    }
  }
  return s;
}

export const EXTRA_PATTERNS = {
  'pattern.glitter': {
    name: 'ラメ', tags: ['トレンド'], slots: 1, defaultC: [1],
    make: ({ h }) =>
      `<pattern id="p" width="22" height="22" patternUnits="userSpaceOnUse">` +
      glitterTile() + `</pattern>` + full('url(#p)', h),
  },
  'pattern.glitter_tip': {
    name: 'ラメ（先端密）', tags: ['トレンド'], slots: 1, defaultC: [1],
    make: ({ h }) => tipGlitterRows(h),
  },
  'pattern.foil': {
    name: '金箔', tags: ['トレンド'], slots: 2, defaultC: [7, 4],
    make: ({ h }) =>
      `<pattern id="p" width="26" height="26" patternUnits="userSpaceOnUse">` +
      `<polygon points="3,4 12,2 15,10 8,14 2,11" fill="{c0}" fill-opacity="0.8"/>` +
      `<polygon points="17,14 24,13 25,20 19,23 15,19" fill="{c1}" fill-opacity="0.7"/>` +
      `<polygon points="6,18 13,17 12,25 5,25" fill="{c0}" fill-opacity="0.55"/>` +
      `</pattern>` + full('url(#p)', h),
  },
  'pattern.quilting': {
    name: 'キルティング', tags: ['オフィス'], slots: 2, defaultC: [0, 1],
    make: ({ h }) =>
      `<pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="20" height="20" fill="{c0}"/>` +
      `<g stroke="{c1}" stroke-width="1.4" stroke-opacity="0.6">` +
      `<line x1="0" y1="20" x2="20" y2="0"/><line x1="-10" y1="10" x2="10" y2="-10"/><line x1="10" y1="30" x2="30" y2="10"/>` +
      `<line x1="0" y1="0" x2="20" y2="20"/><line x1="-10" y1="10" x2="10" y2="30"/><line x1="10" y1="-10" x2="30" y2="10"/>` +
      `</g>` +
      `<circle cx="10" cy="10" r="1.5" fill="{c1}"/><circle cx="0" cy="0" r="1.5" fill="{c1}"/>` +
      `<circle cx="20" cy="0" r="1.5" fill="{c1}"/><circle cx="0" cy="20" r="1.5" fill="{c1}"/><circle cx="20" cy="20" r="1.5" fill="{c1}"/>` +
      `</pattern>` + full('url(#p)', h),
  },
  'pattern.leopard': {
    name: 'ヒョウ柄', tags: ['トレンド'], slots: 3, defaultC: [4, 7, 5],
    make: ({ h }) =>
      `<pattern id="p" width="26" height="24" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="26" height="24" fill="{c0}"/>` +
      `<g fill="{c1}">` +
      `<ellipse cx="6" cy="6" rx="4" ry="3"/><ellipse cx="19" cy="4" rx="3.4" ry="2.6"/>` +
      `<ellipse cx="13" cy="14" rx="4.2" ry="3.2"/><ellipse cx="23" cy="17" rx="3" ry="2.4"/>` +
      `<ellipse cx="3" cy="18" rx="3" ry="2.4"/>` +
      `</g>` +
      `<g fill="none" stroke="{c2}" stroke-width="1.3">` +
      `<path d="M 2 4 Q 6 2 9 5 Q 7 8 4 8 Q 1 7 2 4 Z"/>` +
      `<path d="M 16 2 Q 20 1 22 4 Q 21 6 18 6 Q 15 5 16 2 Z"/>` +
      `<path d="M 9 12 Q 14 10 17 13 Q 16 17 12 17 Q 8 16 9 12 Z"/>` +
      `<path d="M 20 15 Q 24 14 26 17 Q 24 19 21 19 Q 19 17 20 15 Z"/>` +
      `<path d="M 0 16 Q 4 15 6 18 Q 4 20 1 20 Q -1 18 0 16 Z"/>` +
      `</g></pattern>` + full('url(#p)', h),
  },
  'pattern.zebra': {
    name: 'ゼブラ', tags: ['トレンド'], slots: 2, defaultC: [1, 5],
    make: ({ h }) =>
      `<pattern id="p" width="30" height="18" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="30" height="18" fill="{c0}"/>` +
      `<path d="M -2 2 Q 8 -2 16 3 Q 24 7 32 2 L 32 7 Q 24 12 16 8 Q 8 3 -2 8 Z" fill="{c1}"/>` +
      `<path d="M -2 12 Q 8 8 18 13 Q 26 17 32 12 L 32 18 L -2 18 Z" fill="{c1}"/>` +
      `</pattern>` + full('url(#p)', h),
  },
  'pattern.knit': {
    name: 'ニット', tags: ['季節', '秋'], slots: 2, defaultC: [4, 6],
    make: ({ h }) =>
      `<pattern id="p" width="14" height="12" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="14" height="12" fill="{c0}"/>` +
      `<path d="M 0 3 L 4 0 L 7 3 L 10 0 L 14 3" fill="none" stroke="{c1}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M 0 9 L 4 6 L 7 9 L 10 6 L 14 9" fill="none" stroke="{c1}" stroke-width="1.6" stroke-linecap="round"/>` +
      `</pattern>` + full('url(#p)', h),
  },
  'pattern.pinstripe': {
    name: '極細ストライプ', tags: ['オフィス'], slots: 2, defaultC: [4, 5],
    make: ({ h }) =>
      `<pattern id="p" width="12" height="12" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="12" height="12" fill="{c0}"/>` +
      `<rect x="0" y="0" width="3" height="12" fill="{c1}"/>` +
      `</pattern>` + full('url(#p)', h),
  },
  'pattern.check_block': {
    name: 'ブロックチェック', tags: ['季節', '秋'], slots: 2, defaultC: [4, 6],
    make: ({ h }) =>
      `<pattern id="p" width="24" height="24" patternUnits="userSpaceOnUse">` +
      `<rect x="0" y="0" width="24" height="24" fill="{c0}"/>` +
      `<rect x="0" y="0" width="12" height="12" fill="{c1}"/>` +
      `<rect x="12" y="12" width="12" height="12" fill="{c1}"/>` +
      `</pattern>` + full('url(#p)', h),
  },
};
