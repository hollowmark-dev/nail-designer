/**
 * 追加モチーフ定義（第2弾・25個）。
 *
 * parts.js の MOTIFS と完全に同じ形式でエクスポートする。
 * id・cat は付けない（呼び出し側で付与される想定）。
 *
 * 守っている規約（README / parts.js のコメント参照）:
 *  - 色は {c0} {c1} … のプレースホルダのみ。var(--c0) は使わない
 *  - gradient/pattern の id は短い固定名。ただし1パーツ内で重複させない（本ファイルでは未使用）
 *  - 外部参照・filter・mix-blend-mode・foreignObject は使わない
 *  - box は原点中心。実寸40px程度でも見えるよう線は太め・要素は大きめにする
 */

/* ------------------------------------------------------------------ */
/* 動物の顔（motif.cat の作りに揃える: 耳 + 顔の楕円 + にっこり目 + 鼻 + 口 + ほお） */
/* 色スロットは猫と同じ順序: 0=顔, 1=線, 2=鼻・ほお                        */
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

function bearFace() {
  const ears =
    `<circle cx="-32" cy="-25" r="15" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    `<circle cx="32" cy="-25" r="15" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    `<circle cx="-32" cy="-25" r="7" fill="{c2}"/>` +
    `<circle cx="32" cy="-25" r="7" fill="{c2}"/>`;
  return animalFace(ears);
}

function rabbitFace() {
  const ears =
    `<ellipse cx="-22" cy="-52" rx="11" ry="36" fill="{c0}" stroke="{c1}" stroke-width="3" transform="rotate(-8 -22 -52)"/>` +
    `<ellipse cx="22" cy="-52" rx="11" ry="36" fill="{c0}" stroke="{c1}" stroke-width="3" transform="rotate(8 22 -52)"/>` +
    `<ellipse cx="-22" cy="-52" rx="5" ry="26" fill="{c2}" transform="rotate(-8 -22 -52)"/>` +
    `<ellipse cx="22" cy="-52" rx="5" ry="26" fill="{c2}" transform="rotate(8 22 -52)"/>`;
  return animalFace(ears);
}

function dogFace() {
  const ears =
    `<path d="M -31 -19 Q -50 -15 -46 7 Q -44 20 -33 16 L -27 -13 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M 31 -19 Q 50 -15 46 7 Q 44 20 33 16 L 27 -13 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>`;
  return animalFace(ears);
}

function pandaFace() {
  const ears =
    `<circle cx="-30" cy="-28" r="14" fill="{c1}"/>` +
    `<circle cx="30" cy="-28" r="14" fill="{c1}"/>`;
  const marks =
    `<ellipse cx="-17" cy="-2" rx="11" ry="15" fill="{c1}" opacity="0.9" transform="rotate(-12 -17 -2)"/>` +
    `<ellipse cx="17" cy="-2" rx="11" ry="15" fill="{c1}" opacity="0.9" transform="rotate(12 17 -2)"/>`;
  return animalFace(ears, marks);
}

/* ------------------------------------------------------------------ */
/* 花・繰り返しパーツ（flower() と同じく for ループで rotate を並べる）       */
/* ------------------------------------------------------------------ */

function rose() {
  let s = '';
  for (let i = 0; i < 5; i++) {
    s += `<path d="M 0 0 C -14 -6 -14 -20 0 -24 C 14 -20 14 -6 0 0 Z" fill="{c0}" stroke="{c1}" stroke-width="2.2" stroke-linejoin="round" transform="rotate(${i * 72})"/>`;
  }
  for (let i = 0; i < 5; i++) {
    s += `<path d="M 0 0 C -8 -4 -8 -12 0 -14 C 8 -12 8 -4 0 0 Z" fill="{c0}" stroke="{c1}" stroke-width="2" stroke-linejoin="round" transform="rotate(${i * 72 + 36})"/>`;
  }
  return s;
}

function daisy() {
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += `<ellipse cx="0" cy="-24" rx="7" ry="17" fill="{c0}" stroke="{c1}" stroke-width="1.6" transform="rotate(${i * 45})"/>`;
  }
  return s + `<circle cx="0" cy="0" r="12" fill="{c2}"/>`;
}

function sakura() {
  const petal =
    `M 0 -6 C -13 -11 -17 -25 -8 -31 C -3 -34 0 -30 0 -25 C 0 -30 3 -34 8 -31 C 17 -25 13 -11 0 -6 Z`;
  let s = '';
  for (let i = 0; i < 5; i++) {
    s += `<path d="${petal}" fill="{c0}" stroke="{c1}" stroke-width="2" stroke-linejoin="round" transform="rotate(${i * 72})"/>`;
  }
  return s + `<circle cx="0" cy="0" r="6" fill="{c1}"/>`;
}

function tinyFlower(cx, cy, scale, alt) {
  const fill = alt ? '{c2}' : '{c0}';
  let s = `<g transform="translate(${cx} ${cy}) scale(${scale})">`;
  for (let i = 0; i < 4; i++) {
    s += `<ellipse cx="0" cy="-9" rx="5.5" ry="9" fill="${fill}" transform="rotate(${i * 90 + 45})"/>`;
  }
  s += `<circle cx="0" cy="0" r="3.4" fill="{c1}"/></g>`;
  return s;
}

function oshibana() {
  const spots = [
    [-30, -14, 1, false],
    [10, -26, 0.8, true],
    [30, 6, 0.9, false],
    [-8, 16, 0.7, true],
    [-32, 20, 0.65, false],
  ];
  return spots.map(([x, y, s, alt]) => tinyFlower(x, y, s, alt)).join('');
}

/* ------------------------------------------------------------------ */
/* いちごの種（loop）                                                   */
/* ------------------------------------------------------------------ */

function berrySeeds() {
  const pts = [
    [-14, 4], [0, -2], [14, 4], [-8, 18], [8, 18],
    [-16, 22], [16, 22], [0, 32],
  ];
  let s = '';
  for (const [x, y] of pts) {
    s += `<ellipse cx="${x}" cy="${y}" rx="2" ry="3" fill="{c2}" transform="rotate(${((x * 2) % 20) - 10} ${x} ${y})"/>`;
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* オレンジの輪切り（loop）                                              */
/* ------------------------------------------------------------------ */

function orangeSlice() {
  let s =
    `<circle cx="0" cy="0" r="36" fill="{c0}" stroke="{c1}" stroke-width="4"/>` +
    `<circle cx="0" cy="0" r="30" fill="{c2}"/>`;
  for (let i = 0; i < 8; i++) {
    s += `<path d="M 0 0 L 0 -30" stroke="{c0}" stroke-width="2" transform="rotate(${i * 45})"/>`;
  }
  return s + `<circle cx="0" cy="0" r="5" fill="{c0}"/>`;
}

/* ------------------------------------------------------------------ */
/* 雪の結晶（6方向・loop）                                              */
/* ------------------------------------------------------------------ */

function snowflake() {
  let s = '';
  for (let i = 0; i < 6; i++) {
    s +=
      `<g transform="rotate(${i * 60})">` +
      `<path d="M 0 0 L 0 -38" stroke="{c0}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<path d="M 0 -18 L -10 -26 M 0 -18 L 10 -26" stroke="{c0}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M 0 -30 L -8 -36 M 0 -30 L 8 -36" stroke="{c0}" stroke-width="3" stroke-linecap="round"/>` +
      `</g>`;
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* ひまわり（花びら10枚 + 種の輪・loop）                                  */
/* ------------------------------------------------------------------ */

function sunflower() {
  let s = '';
  for (let i = 0; i < 10; i++) {
    s += `<path d="M 0 -18 C -8 -30 -6 -44 0 -46 C 6 -44 8 -30 0 -18 Z" fill="{c0}" transform="rotate(${i * 36})"/>`;
  }
  s += `<circle cx="0" cy="0" r="20" fill="{c2}" stroke="{c1}" stroke-width="2"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const r = 11;
    const x = Math.round(r * Math.cos(a) * 10) / 10;
    const y = Math.round(r * Math.sin(a) * 10) / 10;
    s += `<circle cx="${x}" cy="${y}" r="1.8" fill="{c1}"/>`;
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* 貝殻（放射リブ・loop）                                                */
/* ------------------------------------------------------------------ */

function shell() {
  let s =
    `<path d="M -38 10 C -38 -22 -14 -40 0 -40 C 14 -40 38 -22 38 10 C 38 10 20 22 0 10 C -20 22 -38 10 -38 10 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>`;
  for (let i = -3; i <= 3; i++) {
    s += `<path d="M 0 -38 L ${i * 11} 8" stroke="{c1}" stroke-width="1.8" opacity="0.55"/>`;
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* 花火（放射の光条・loop）                                              */
/* ------------------------------------------------------------------ */

function fireworks() {
  let s = '';
  for (let i = 0; i < 8; i++) {
    s +=
      `<g transform="rotate(${i * 45})">` +
      `<path d="M 0 -6 L 0 -36" stroke="{c0}" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="0" cy="-42" r="3" fill="{c1}"/>` +
      `</g>`;
  }
  for (let i = 0; i < 8; i++) {
    s += `<path d="M 0 -14 L 0 -24" stroke="{c1}" stroke-width="2" stroke-linecap="round" transform="rotate(${i * 45 + 22.5})"/>`;
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* モチーフ本体                                                         */
/* ------------------------------------------------------------------ */

export const EXTRA_MOTIFS = {
  /* --- 定番 --- */
  'motif.crown': {
    name: '王冠', box: [88, 60], slots: 2, defaultC: [4, 5], defaultW: 32, tags: ['定番'],
    svg:
      `<path d="M -38 22 L -38 -8 L -20 10 L 0 -26 L 20 10 L 38 -8 L 38 22 Z" fill="{c0}" stroke="{c1}" stroke-width="3.5" stroke-linejoin="round"/>` +
      `<circle cx="-20" cy="-2" r="5" fill="{c1}"/><circle cx="0" cy="-18" r="5.5" fill="{c1}"/><circle cx="20" cy="-2" r="5" fill="{c1}"/>` +
      `<rect x="-38" y="16" width="76" height="10" fill="{c0}" stroke="{c1}" stroke-width="3.5"/>`,
  },
  'motif.clover': {
    name: 'クローバー', box: [72, 84], slots: 2, defaultC: [8, 5], defaultW: 28, tags: ['定番'],
    svg:
      `<circle cx="0" cy="-30" r="17" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      `<circle cx="17.3" cy="0" r="17" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      `<circle cx="-17.3" cy="0" r="17" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      `<path d="M 0 8 L 0 34" stroke="{c1}" stroke-width="4" stroke-linecap="round"/>`,
  },
  'motif.crescent': {
    name: '三日月', box: [70, 70], slots: 2, defaultC: [4, 7], defaultW: 28, tags: ['定番'],
    svg:
      `<path d="M 14 -30 C -22 -22, -22 22, 14 30 C -6 16, -6 -16, 14 -30 Z" fill="{c0}"/>` +
      `<path d="M -28 -6 L -24 -14 L -20 -6 L -12 -2 L -20 2 L -24 10 L -28 2 L -36 -2 Z" fill="{c1}"/>`,
  },
  'motif.drop': {
    name: '雫', box: [56, 84], slots: 2, defaultC: [2, 1], defaultW: 24, tags: ['定番'],
    svg:
      `<path d="M 0 -34 C 20 -10 26 8 26 20 C 26 36 14 46 0 46 C -14 46 -26 36 -26 20 C -26 8 -20 -10 0 -34 Z" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      `<ellipse cx="-9" cy="16" rx="6" ry="10" fill="#ffffff" opacity="0.55" transform="rotate(-20 -9 16)"/>`,
  },

  /* --- 動物 --- */
  'motif.bear': {
    name: 'くま', box: [96, 80], slots: 3, defaultC: [4, 5, 0], defaultW: 46, tags: ['動物'],
    svg: bearFace(),
  },
  'motif.rabbit': {
    name: 'うさぎ', box: [86, 128], slots: 3, defaultC: [1, 5, 0], defaultW: 40, tags: ['動物'],
    svg: rabbitFace(),
  },
  'motif.dog': {
    name: '犬', box: [104, 84], slots: 3, defaultC: [6, 5, 0], defaultW: 44, tags: ['動物'],
    svg: dogFace(),
  },
  'motif.panda': {
    name: 'ぱんだ', box: [86, 82], slots: 3, defaultC: [1, 5, 0], defaultW: 46, tags: ['動物'],
    svg: pandaFace(),
  },

  /* --- 花 --- */
  'motif.rose': {
    name: 'バラ', box: [56, 56], slots: 2, defaultC: [3, 5], defaultW: 26, tags: ['花'],
    svg: rose(),
  },
  'motif.daisy': {
    name: 'デイジー', box: [82, 82], slots: 3, defaultC: [1, 5, 7], defaultW: 30, tags: ['花'],
    svg: daisy(),
  },
  'motif.sakura': {
    name: '桜', box: [70, 70], slots: 2, defaultC: [0, 5], defaultW: 28, tags: ['花'],
    svg: sakura(),
  },
  'motif.oshibana': {
    name: '押し花', box: [88, 70], slots: 3, defaultC: [0, 3, 4], defaultW: 34, tags: ['花'],
    svg: oshibana(),
  },
  'motif.leaf': {
    name: '葉', box: [56, 88], slots: 2, defaultC: [8, 5], defaultW: 22, tags: ['花'],
    svg:
      `<path d="M 0 -40 C 26 -24 26 20 0 42 C -26 20 -26 -24 0 -40 Z" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      `<path d="M 0 -34 L 0 36" stroke="{c1}" stroke-width="2.2"/>` +
      `<path d="M 0 -14 L -12 -22 M 0 4 L 12 -6 M 0 22 L -12 12" stroke="{c1}" stroke-width="1.6"/>`,
  },

  /* --- フルーツ --- */
  'motif.strawberry': {
    name: 'いちご', box: [70, 74], slots: 3, defaultC: [3, 5, 6], defaultW: 30, tags: ['フルーツ'],
    svg:
      `<path d="M 0 44 C -30 44 -34 4 -20 -10 C -8 -22 8 -22 20 -10 C 34 4 30 44 0 44 Z" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      berrySeeds() +
      `<path d="M -18 -14 L -6 -26 L 0 -14 L 6 -26 L 18 -14 L 10 -6 L -10 -6 Z" fill="{c2}" stroke="{c1}" stroke-width="2.4" stroke-linejoin="round"/>`,
  },
  'motif.cherry': {
    name: 'さくらんぼ', box: [70, 84], slots: 2, defaultC: [3, 5], defaultW: 26, tags: ['フルーツ'],
    svg:
      `<path d="M -6 -10 C -10 -34 6 -40 14 -34" fill="none" stroke="{c1}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<path d="M 8 -8 C 14 -30 30 -34 34 -30" fill="none" stroke="{c1}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<circle cx="-10" cy="10" r="20" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      `<circle cx="16" cy="18" r="20" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      `<ellipse cx="-16" cy="2" rx="5" ry="7" fill="#ffffff" opacity="0.5" transform="rotate(-20 -16 2)"/>`,
  },
  'motif.lemon': {
    name: 'レモン', box: [88, 56], slots: 2, defaultC: [4, 5], defaultW: 34, tags: ['フルーツ'],
    svg:
      `<path d="M -41 0 C -34 -17 -16 -25 0 -25 C 16 -25 34 -17 41 0 C 34 17 16 25 0 25 C -16 25 -34 17 -41 0 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M -10 -8 Q 0 -14 10 -8 M -12 4 Q 0 -2 12 4" fill="none" stroke="{c1}" stroke-width="1.6" opacity="0.6"/>`,
  },
  'motif.orange': {
    name: 'オレンジ', box: [78, 78], slots: 3, defaultC: [7, 5, 4], defaultW: 32, tags: ['フルーツ'],
    svg: orangeSlice(),
  },

  /* --- 季節 --- */
  'motif.snowflake': {
    name: '雪の結晶', box: [82, 82], slots: 1, defaultC: [2], defaultW: 30, tags: ['季節', '冬'],
    svg: snowflake(),
  },
  'motif.snowman': {
    name: '雪だるま', box: [60, 88], slots: 3, defaultC: [1, 5, 3], defaultW: 24, tags: ['季節', '冬'],
    svg:
      `<circle cx="0" cy="20" r="26" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      `<circle cx="0" cy="-16" r="18" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      `<circle cx="-6" cy="-20" r="2.4" fill="{c1}"/><circle cx="6" cy="-20" r="2.4" fill="{c1}"/>` +
      `<path d="M 0 -14 L 10 -10 L 0 -8 Z" fill="{c2}"/>` +
      `<circle cx="0" cy="10" r="2.2" fill="{c1}"/><circle cx="0" cy="20" r="2.2" fill="{c1}"/><circle cx="0" cy="30" r="2.2" fill="{c1}"/>` +
      `<rect x="-18" y="-4" width="36" height="8" fill="{c2}" transform="rotate(-6)"/>`,
  },
  'motif.xmastree': {
    name: 'クリスマスツリー', box: [70, 96], slots: 3, defaultC: [8, 5, 3], defaultW: 30, tags: ['季節', '冬'],
    svg:
      `<path d="M 0 -40 L 18 -14 L 10 -14 L 26 8 L 16 8 L 32 32 L -32 32 L -16 8 L -26 8 L -10 -14 L -18 -14 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
      `<rect x="-8" y="32" width="16" height="14" fill="{c1}"/>` +
      `<circle cx="-10" cy="10" r="4" fill="{c2}"/><circle cx="10" cy="0" r="4" fill="{c2}"/><circle cx="0" cy="24" r="4" fill="{c2}"/><circle cx="-14" cy="24" r="4" fill="{c2}"/>` +
      `<path d="M 0 -46 L -4 -38 L 4 -38 Z" fill="{c2}"/>`,
  },
  'motif.pumpkin': {
    name: 'かぼちゃ', box: [76, 80], slots: 3, defaultC: [7, 5, 5], defaultW: 32, tags: ['季節', '秋'],
    svg:
      `<path d="M -34 6 C -34 -16 -16 -26 0 -26 C 16 -26 34 -16 34 6 C 34 26 16 36 0 36 C -16 36 -34 26 -34 6 Z" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
      `<path d="M -17 -22 C -17 4 -17 20 -17 34 M 0 -26 L 0 36 M 17 -22 C 17 4 17 20 17 34" fill="none" stroke="{c1}" stroke-width="2" opacity="0.6"/>` +
      `<path d="M 0 -26 C -2 -36 6 -40 10 -34" fill="none" stroke="{c2}" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M -12 0 L -4 10 L -18 10 Z M 12 0 L 20 10 L 4 10 Z" fill="{c2}"/>` +
      `<path d="M -14 20 L -8 26 L -2 20 L 4 26 L 10 20 L 16 26" fill="none" stroke="{c2}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  'motif.bat': {
    name: 'こうもり', box: [96, 46], slots: 2, defaultC: [5, 3], defaultW: 40, tags: ['季節', '秋'],
    svg:
      `<path d="M -8 -2 L -44 -12 C -39 -3 -41 6 -46 13 C -37 9 -29 11 -23 18 C -18 9 -13 4 -8 4 Z" fill="{c0}"/>` +
      `<path d="M 8 -2 L 44 -12 C 39 -3 41 6 46 13 C 37 9 29 11 23 18 C 18 9 13 4 8 4 Z" fill="{c0}"/>` +
      `<path d="M -8 -10 L -11 -22 L -2 -13 Z" fill="{c0}"/><path d="M 8 -10 L 11 -22 L 2 -13 Z" fill="{c0}"/>` +
      `<ellipse cx="0" cy="0" rx="10" ry="13" fill="{c0}"/>` +
      `<circle cx="-3.5" cy="-2" r="2" fill="{c1}"/><circle cx="3.5" cy="-2" r="2" fill="{c1}"/>`,
  },
  'motif.sunflower': {
    name: 'ひまわり', box: [100, 100], slots: 3, defaultC: [7, 5, 4], defaultW: 36, tags: ['季節', '夏'],
    svg: sunflower(),
  },
  'motif.shell': {
    name: '貝殻', box: [80, 66], slots: 2, defaultC: [4, 6], defaultW: 30, tags: ['季節', '夏'],
    svg: shell(),
  },
  'motif.fireworks': {
    name: '花火', box: [88, 88], slots: 2, defaultC: [2, 3], defaultW: 34, tags: ['季節', '夏'],
    svg: fireworks(),
  },
};
