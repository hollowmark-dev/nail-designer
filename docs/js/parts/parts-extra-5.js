/**
 * 追加モチーフ定義（第3弾・動物6 + 小物/記号14 = 20個）。
 *
 * parts.js の MOTIFS / parts-extra-2.js と完全に同じ形式でエクスポートする。
 * id・cat は付けない（呼び出し側で付与される想定）。
 *
 * 守っている規約（README / parts.js のコメント参照）:
 *  - 色は {c0} {c1} … のプレースホルダのみ。var(--c0) は使わない
 *  - gradient/pattern の id は短い固定名。本ファイルでは未使用（グラデーション不使用）
 *  - 外部参照・filter・mix-blend-mode・foreignObject は使わない
 *  - box は原点中心。実寸40px程度でも見えるよう線は太め・要素は大きめにする
 */

/* ------------------------------------------------------------------ */
/* 動物の顔（parts-extra-2.js の animalFace() と同じ作り: 耳 + 顔の楕円 +      */
/* にっこり目 + 鼻 + 口 + ほお。色スロットは 0=顔, 1=線, 2=鼻・ほお）           */
/* ------------------------------------------------------------------ */

function animalFace(ears, marks) {
  return (
    ears +
    `<ellipse cx="0" cy="4" rx="40" ry="33" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    (marks || '') +
    `<g fill="none" stroke="{c1}" stroke-width="3.4" stroke-linecap="round">` +
    `<path d="M -25 3 Q -17 -6 -9 3"/><path d="M 9 3 Q 17 -6 25 3"/>` +
    `<path d="M -9 20 Q 0 26 9 20"/></g>` +
    `<path d="M -5 11 L 5 11 L 0 17 Z" fill="{c2}"/>` +
    `<circle cx="-27" cy="15" r="6" fill="{c2}" opacity="0.65"/>` +
    `<circle cx="27" cy="15" r="6" fill="{c2}" opacity="0.65"/>`
  );
}

/** もこもこの毛（ひつじの頭まわり）。loop で並べる */
function woolBumps() {
  const xs = [-34, -23, -12, 0, 12, 23, 34];
  let s = '<g fill="{c0}" stroke="{c1}" stroke-width="2.2" stroke-linejoin="round">';
  for (const x of xs) {
    const y = -28 + Math.abs(x) * 0.1;
    s += `<circle cx="${x}" cy="${y}" r="11"/>`;
  }
  return s + '</g>';
}

function sheepFace() {
  const ears =
    woolBumps() +
    `<ellipse cx="-40" cy="2" rx="8" ry="13" fill="{c2}" stroke="{c1}" stroke-width="2.4" transform="rotate(-24 -40 2)"/>` +
    `<ellipse cx="40" cy="2" rx="8" ry="13" fill="{c2}" stroke="{c1}" stroke-width="2.4" transform="rotate(24 40 2)"/>`;
  return animalFace(ears);
}

/** ぺんぎん。耳の代わりにフリッパー、模様スロット(c3)で黒い頭巾を重ねる */
function penguinFace() {
  const ears =
    `<path d="M -38 -2 Q -54 12 -44 36 Q -34 30 -30 8 Z" fill="{c3}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M 38 -2 Q 54 12 44 36 Q 34 30 30 8 Z" fill="{c3}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>`;
  const marks =
    `<ellipse cx="0" cy="-12" rx="40" ry="26" fill="{c3}"/>` +
    `<ellipse cx="0" cy="13" rx="26" ry="21" fill="{c0}"/>`;
  return animalFace(ears, marks);
}

/** きつね。大きな三角耳＋耳の内側と口まわりに模様スロット(c3) */
function foxFace() {
  const ears =
    `<path d="M -38 -10 L -52 -46 L -14 -24 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M 38 -10 L 52 -46 L 14 -24 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M -36 -16 L -44 -38 L -21 -24 Z" fill="{c3}"/>` +
    `<path d="M 36 -16 L 44 -38 L 21 -24 Z" fill="{c3}"/>`;
  const marks = `<ellipse cx="0" cy="15" rx="22" ry="15" fill="{c3}"/>`;
  return animalFace(ears, marks);
}

/** りす。丸耳＋右側にふさふさの尻尾 */
function squirrelFace() {
  const ears =
    `<ellipse cx="-25" cy="-38" rx="13" ry="16" fill="{c0}" stroke="{c1}" stroke-width="2.8"/>` +
    `<ellipse cx="25" cy="-38" rx="13" ry="16" fill="{c0}" stroke="{c1}" stroke-width="2.8"/>` +
    `<ellipse cx="-25" cy="-38" rx="6" ry="8" fill="{c2}"/>` +
    `<ellipse cx="25" cy="-38" rx="6" ry="8" fill="{c2}"/>` +
    `<path d="M 22 20 Q 54 14 58 -18 Q 60 -46 32 -52 Q 52 -42 48 -16 Q 44 10 20 16 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M 32 -4 Q 44 -12 46 -26 M 26 6 Q 38 -2 42 -16" fill="none" stroke="{c1}" stroke-width="1.8" opacity="0.5"/>`;
  return animalFace(ears);
}

/** ハムスター。近めの丸耳＋ほお袋を強調する下地の丸(marks) */
function hamsterFace() {
  const ears =
    `<circle cx="-28" cy="-24" r="10" fill="{c0}" stroke="{c1}" stroke-width="2.6"/>` +
    `<circle cx="28" cy="-24" r="10" fill="{c0}" stroke="{c1}" stroke-width="2.6"/>` +
    `<circle cx="-28" cy="-24" r="5" fill="{c2}"/>` +
    `<circle cx="28" cy="-24" r="5" fill="{c2}"/>`;
  const marks =
    `<ellipse cx="-28" cy="16" rx="11" ry="10" fill="{c2}" opacity="0.45"/>` +
    `<ellipse cx="28" cy="16" rx="11" ry="10" fill="{c2}" opacity="0.45"/>`;
  return animalFace(ears, marks);
}

/** ことり。顔ではなく横向きの全身（体・頭・くちばし・翼・脚） */
function bird() {
  return (
    `<path d="M -40 4 L -18 -8 L -18 14 Z" fill="{c0}" stroke="{c1}" stroke-width="2.6" stroke-linejoin="round"/>` +
    `<ellipse cx="-4" cy="4" rx="26" ry="20" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    `<circle cx="22" cy="-12" r="15" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    `<path d="M 34 -12 L 46 -8 L 34 -4 Z" fill="{c2}"/>` +
    `<circle cx="25" cy="-15" r="2.2" fill="{c1}"/>` +
    `<path d="M -10 -2 Q -2 -16 16 -8 Q 2 0 -6 12 Q -14 6 -10 -2 Z" fill="{c2}" opacity="0.9"/>` +
    `<path d="M -8 22 L -8 30 M 2 22 L 2 30" fill="none" stroke="{c1}" stroke-width="2.2" stroke-linecap="round"/>`
  );
}

/* ------------------------------------------------------------------ */
/* 甘いもの                                                             */
/* ------------------------------------------------------------------ */

/** ショートケーキ（断面のウェッジ・クリーム層・いちご） */
function cake() {
  return (
    `<path d="M -34 32 L 34 32 L 0 -30 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M -18 4 L 18 4" stroke="{c2}" stroke-width="9" stroke-linecap="round"/>` +
    `<circle cx="-14" cy="20" r="3" fill="{c2}"/><circle cx="0" cy="24" r="3" fill="{c2}"/><circle cx="14" cy="20" r="3" fill="{c2}"/>` +
    `<circle cx="0" cy="-30" r="8" fill="{c3}" stroke="{c1}" stroke-width="2"/>`
  );
}

/** ドーナツ（evenodd で穴を開けたリング・アイシング・スプリンクル） */
function donut() {
  let s =
    `<path fill-rule="evenodd" d="M -38 0 A 38 38 0 1 0 38 0 A 38 38 0 1 0 -38 0 Z M -15 0 A 15 15 0 1 0 15 0 A 15 15 0 1 0 -15 0 Z" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    `<path d="M -33 -8 Q -20 -28 -2 -18 Q 12 -32 30 -12 Q 16 -16 6 -6 Q -4 -18 -16 -6 Q -26 -16 -33 -8 Z" fill="{c2}"/>`;
  const sprinkles = [
    [-24, -14, 20], [-8, -24, -30], [10, -20, 60],
    [24, -10, -60], [-16, -6, 10], [6, -16, 100],
  ];
  for (const [x, y, rot] of sprinkles) {
    s += `<rect x="-1.6" y="-4.5" width="3.2" height="9" rx="1.6" fill="{c3}" transform="translate(${x} ${y}) rotate(${rot})"/>`;
  }
  return s;
}

/** 棒付きキャンディ（渦は同心円+破線で表現。loop で並べる） */
function candy() {
  let s =
    `<rect x="-4" y="14" width="8" height="42" rx="4" fill="{c2}"/>` +
    `<circle cx="0" cy="-8" r="34" fill="{c0}" stroke="{c1}" stroke-width="3"/>`;
  for (let i = 0; i < 4; i++) {
    const r = 7 + i * 6.5;
    const half = (r * Math.PI).toFixed(1);
    s += `<circle cx="0" cy="-8" r="${r}" fill="none" stroke="{c1}" stroke-width="2.2" stroke-dasharray="${half} ${half}" transform="rotate(${i * 47} 0 -8)"/>`;
  }
  return s;
}

/** マカロン（上下シェル+フィリング。縁のプチマカロン粒は loop） */
function macaron() {
  let s =
    `<ellipse cx="0" cy="-15" rx="30" ry="14" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    `<ellipse cx="0" cy="15" rx="30" ry="14" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    `<rect x="-28" y="-5" width="56" height="10" fill="{c2}"/>`;
  const xs = [-24, -16, -8, 0, 8, 16, 24];
  for (const x of xs) {
    s += `<circle cx="${x}" cy="-27" r="3" fill="{c0}" stroke="{c1}" stroke-width="1.2"/>`;
    s += `<circle cx="${x}" cy="27" r="3" fill="{c0}" stroke="{c1}" stroke-width="1.2"/>`;
  }
  return s;
}

/** コーヒーカップ（持ち手・受け皿・湯気） */
function coffee() {
  return (
    `<ellipse cx="-2" cy="34" rx="34" ry="6" fill="{c0}" stroke="{c1}" stroke-width="2.4"/>` +
    `<path d="M -26 -10 L -22 22 Q -22 32 -10 32 L 8 32 Q 20 32 22 22 L 26 -10 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M 26 -6 Q 42 -6 42 8 Q 42 20 24 18" fill="none" stroke="{c1}" stroke-width="4"/>` +
    `<ellipse cx="0" cy="-10" rx="24" ry="6" fill="{c2}"/>` +
    `<path d="M -8 -30 Q -14 -40 -8 -48" fill="none" stroke="{c1}" stroke-width="2.4" stroke-linecap="round" opacity="0.6"/>` +
    `<path d="M 6 -30 Q 0 -40 6 -48" fill="none" stroke="{c1}" stroke-width="2.4" stroke-linecap="round" opacity="0.6"/>`
  );
}

/* ------------------------------------------------------------------ */
/* かわいい系                                                           */
/* ------------------------------------------------------------------ */

function wingHalf() {
  return 'M 2 6 C 8 -8 14 -30 42 -44 C 34 -30 38 -20 44 -14 C 34 -10 32 -2 40 6 ' +
    'C 28 3 26 11 32 20 C 20 14 16 20 20 28 C 8 20 2 14 2 6 Z';
}
function wingFeatherLines() {
  return (
    `<path d="M 40 -12 L 20 -2" stroke="{c1}" stroke-width="1.6" opacity="0.45"/>` +
    `<path d="M 34 2 L 16 10" stroke="{c1}" stroke-width="1.6" opacity="0.45"/>` +
    `<path d="M 26 16 L 12 22" stroke="{c1}" stroke-width="1.6" opacity="0.45"/>`
  );
}
/** 天使の羽（左右対称。片側を作って scale(-1,1) でミラー） */
function wing() {
  const path = wingHalf();
  return (
    `<path d="${path}" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    wingFeatherLines() +
    `<g transform="scale(-1,1)">` +
    `<path d="${path}" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    wingFeatherLines() +
    `</g>`
  );
}

/** ティアラ（尖り＋宝石を loop で並べる） */
function tiara() {
  let s = `<path d="M -40 22 L -40 8 Q 0 -4 40 8 L 40 22 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>`;
  const spikes = [[-28, 4, 10], [-14, -4, 17], [0, -10, 24], [14, -4, 17], [28, 4, 10]];
  for (const [x, y, h] of spikes) {
    s += `<path d="M ${x - 6} ${y} L ${x} ${y - h} L ${x + 6} ${y} Z" fill="{c0}" stroke="{c1}" stroke-width="2.4" stroke-linejoin="round"/>`;
  }
  const jewels = [[-28, 2], [-14, -6], [0, -12], [14, -6], [28, 2]];
  for (const [x, y] of jewels) {
    s += `<circle cx="${x}" cy="${y}" r="3.6" fill="{c2}"/>`;
  }
  return s + `<circle cx="0" cy="10" r="6" fill="{c2}" stroke="{c1}" stroke-width="1.6"/>`;
}

/** ハートの鍵（開いたハート型の頭 + 軸 + 歯） */
function keyHeart() {
  return (
    `<path d="M 0 -2 C -9 -10 -19 -16 -19 -26 C -19 -33 -13 -37 -7 -37 C -3 -37 0 -34 0 -31 ` +
    `C 0 -34 3 -37 7 -37 C 13 -37 19 -33 19 -26 C 19 -16 9 -10 0 -2 Z" fill="none" stroke="{c0}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<rect x="-4" y="-4" width="8" height="40" fill="{c0}" stroke="{c1}" stroke-width="2"/>` +
    `<rect x="4" y="18" width="12" height="6" fill="{c0}" stroke="{c1}" stroke-width="2"/>` +
    `<rect x="4" y="28" width="16" height="6" fill="{c0}" stroke="{c1}" stroke-width="2"/>` +
    `<circle cx="0" cy="-22" r="4" fill="{c2}"/>`
  );
}

/** 南京錠（シャックル + 本体 + 鍵穴） */
function padlock() {
  return (
    `<path d="M -14 -12 L -14 -28 A 14 14 0 0 1 14 -28 L 14 -12" fill="none" stroke="{c0}" stroke-width="8" stroke-linecap="round"/>` +
    `<rect x="-22" y="-12" width="44" height="38" rx="7" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    `<circle cx="0" cy="0" r="6" fill="{c2}"/>` +
    `<rect x="-3" y="0" width="6" height="12" fill="{c2}"/>`
  );
}

/** 唇（キスマーク。ハイライトのみ固定の白リテラル） */
function lips() {
  return (
    `<path d="M -30 0 Q -22 -14 -10 -6 Q -4 -14 0 -6 Q 4 -14 10 -6 Q 22 -14 30 0 ` +
    `Q 26 12 12 12 Q 6 18 0 12 Q -6 18 -12 12 Q -26 12 -30 0 Z" fill="{c0}" stroke="{c1}" stroke-width="2.6" stroke-linejoin="round"/>` +
    `<path d="M -20 0 Q 0 6 20 0" fill="none" stroke="{c1}" stroke-width="2" opacity="0.5"/>` +
    `<ellipse cx="-14" cy="-4" rx="5" ry="3" fill="#ffffff" opacity="0.5" transform="rotate(-20 -14 -4)"/>`
  );
}

/* ------------------------------------------------------------------ */
/* 記号                                                                */
/* ------------------------------------------------------------------ */

/** 十字（中心に小さな宝石） */
function cross() {
  return (
    `<path d="M -8 -40 L 8 -40 L 8 -10 L 34 -10 L 34 8 L 8 8 L 8 40 L -8 40 L -8 8 L -34 8 L -34 -10 L -8 -10 Z" ` +
    `fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<circle cx="0" cy="-1" r="5" fill="{c2}"/>`
  );
}

/** 星座（小さい星を線でつなぐ。点も線も loop 相当のデータ駆動） */
function constellation() {
  // 実寸40px だと星が3px しかなく点に見えるので、星も線も大きく太くする
  const pts = [[-30, 12], [-8, -14], [16, -2], [32, -30], [4, 26]];
  const lineD = 'M ' + pts.map(p => p.join(' ')).join(' L ');
  let s = `<path d="${lineD}" fill="none" stroke="{c1}" stroke-width="2.8" stroke-linecap="round" opacity="0.75"/>`;
  pts.forEach(([x, y], i) => {
    const r = i === 3 ? 11 : 8;
    s += `<g transform="translate(${x} ${y})">` +
      `<path d="M 0 ${-r} L ${r * 0.28} ${-r * 0.28} L ${r} 0 L ${r * 0.28} ${r * 0.28}` +
      ` L 0 ${r} L ${-r * 0.28} ${r * 0.28} L ${-r} 0 L ${-r * 0.28} ${-r * 0.28} Z" fill="{c0}"/></g>`;
  });
  return s;
}

/** きらめき（四方に伸びる光。大小3つを loop 生成の関数で作る） */
function sparkleShape(scale) {
  const r1 = 30 * scale, r2 = 4 * scale;
  return `<path d="M 0 -${r1} Q ${r2} -${r2} ${r1} 0 Q ${r2} ${r2} 0 ${r1} Q -${r2} ${r2} -${r1} 0 Q -${r2} -${r2} 0 -${r1} Z" fill="{c0}" stroke="{c1}" stroke-width="1.2"/>`;
}
function sparkle() {
  return (
    sparkleShape(1) +
    `<g transform="translate(22 -20)">${sparkleShape(0.34)}</g>` +
    `<g transform="translate(-18 18)">${sparkleShape(0.26)}</g>`
  );
}

/** 連桁つき8分音符2つ */
function musicalDouble() {
  return (
    `<g fill="{c0}">` +
    `<path d="M -8 -46 L 0 -46 L 0 32 L -8 32 Z"/>` +
    `<path d="M 24 -56 L 32 -56 L 32 32 L 24 32 Z"/>` +
    `<path d="M -8 -46 L 32 -56 L 32 -44 L -8 -34 Z"/>` +
    `<path d="M -8 -34 L 32 -44 L 32 -32 L -8 -22 Z"/>` +
    `<ellipse cx="-18" cy="36" rx="14" ry="10" transform="rotate(-16 -18 36)"/>` +
    `<ellipse cx="18" cy="36" rx="14" ry="10" transform="rotate(-16 18 36)"/>` +
    `</g>`
  );
}

/* ------------------------------------------------------------------ */
/* モチーフ本体                                                         */
/* ------------------------------------------------------------------ */

export const EXTRA_MOTIFS = {
  /* --- 動物 --- */
  'motif.sheep': {
    name: 'ひつじ', box: [108, 92], slots: 3, defaultC: [1, 5, 6], defaultW: 45, tags: ['動物'],
    svg: sheepFace(),
  },
  'motif.penguin': {
    name: 'ぺんぎん', box: [116, 88], slots: 4, defaultC: [1, 5, 7, 5], defaultW: 42, tags: ['動物'],
    svg: penguinFace(),
  },
  'motif.fox': {
    name: 'きつね', box: [112, 94], slots: 4, defaultC: [7, 5, 3, 1], defaultW: 44, tags: ['動物'],
    svg: foxFace(),
  },
  'motif.squirrel': {
    name: 'りす', box: [120, 110], slots: 3, defaultC: [6, 5, 4], defaultW: 46, tags: ['動物'],
    svg: squirrelFace(),
  },
  'motif.bird': {
    name: 'ことり', box: [92, 64], slots: 3, defaultC: [2, 5, 7], defaultW: 34, tags: ['動物'],
    svg: bird(),
  },
  'motif.hamster': {
    name: 'ハムスター', box: [92, 80], slots: 3, defaultC: [7, 5, 4], defaultW: 42, tags: ['動物'],
    svg: hamsterFace(),
  },

  /* --- スイーツ --- */
  'motif.cake': {
    name: 'ショートケーキ', box: [76, 80], slots: 4, defaultC: [4, 5, 1, 3], defaultW: 30, tags: ['スイーツ'],
    svg: cake(),
  },
  'motif.donut': {
    name: 'ドーナツ', box: [84, 84], slots: 4, defaultC: [4, 5, 3, 2], defaultW: 32, tags: ['スイーツ'],
    svg: donut(),
  },
  'motif.candy': {
    name: 'キャンディ', box: [76, 116], slots: 3, defaultC: [3, 1, 4], defaultW: 30, tags: ['スイーツ'],
    svg: candy(),
  },
  'motif.macaron': {
    name: 'マカロン', box: [74, 68], slots: 3, defaultC: [0, 5, 1], defaultW: 30, tags: ['スイーツ'],
    svg: macaron(),
  },
  'motif.coffee': {
    name: 'コーヒー', box: [90, 100], slots: 3, defaultC: [1, 6, 5], defaultW: 32, tags: ['スイーツ'],
    svg: coffee(),
  },

  /* --- ガーリー --- */
  'motif.wing': {
    name: '天使の羽', box: [92, 92], slots: 2, defaultC: [1, 5], defaultW: 38, tags: ['ガーリー'],
    svg: wing(),
  },
  'motif.tiara': {
    name: 'ティアラ', box: [88, 74], slots: 3, defaultC: [1, 5, 2], defaultW: 32, tags: ['ガーリー'],
    svg: tiara(),
  },
  'motif.key_heart': {
    name: 'ハートの鍵', box: [52, 84], slots: 3, defaultC: [4, 5, 3], defaultW: 22, tags: ['ガーリー'],
    svg: keyHeart(),
  },
  'motif.padlock': {
    name: '南京錠', box: [52, 66], slots: 3, defaultC: [4, 6, 5], defaultW: 26, tags: ['ガーリー'],
    svg: padlock(),
  },
  'motif.lips': {
    name: '唇', box: [76, 40], slots: 2, defaultC: [3, 5], defaultW: 32, tags: ['ガーリー'],
    svg: lips(),
  },

  /* --- 記号 --- */
  'motif.cross': {
    name: '十字', box: [76, 88], slots: 3, defaultC: [1, 5, 2], defaultW: 30, tags: ['記号'],
    svg: cross(),
  },
  'motif.constellation': {
    name: '星座', box: [68, 64], slots: 2, defaultC: [1, 6], defaultW: 28, tags: ['記号'],
    svg: constellation(),
  },
  'motif.sparkle': {
    name: 'きらめき', box: [84, 84], slots: 2, defaultC: [1, 6], defaultW: 32, tags: ['記号'],
    svg: sparkle(),
  },
  'motif.musical_double': {
    name: '8分音符×2', box: [76, 116], slots: 1, defaultC: [5], defaultW: 28, tags: ['記号'],
    svg: musicalDouble(),
  },
};
