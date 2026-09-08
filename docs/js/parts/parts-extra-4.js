/**
 * 追加モチーフ定義（第4弾）。
 *
 * parts.js の MOTIFS と完全に同じ形式でエクスポートする。
 * id・cat は付けない（呼び出し側で付与される想定）。
 *
 * 守っている規約（README / parts.js のコメント参照）:
 *  - 色は {c0} {c1} … のプレースホルダのみ。var(--c0) は使わない
 *  - gradient の id は短い固定名。ただし1パーツ内でのみユニークならよい
 *  - 外部参照・filter・mix-blend-mode・foreignObject は使わない
 *  - box は原点中心。実寸40px程度でも見えるよう線は太め・要素は大きめにする
 *
 * 構成:
 *  - ビジュー・パーツ風 6つ（radialGradient / linearGradient でカット面・立体感を出す）
 *  - 季節・イベント 16つ（春3・夏4・秋3・冬（クリスマス）3・ハロウィン2・お正月1）
 */

/* ------------------------------------------------------------------ */
/* ビジュー・パーツ風                                                    */
/* ------------------------------------------------------------------ */

/** 六角ファセットの光条（放射状の切子線）。r は宝石の半径目安（正確な楕円境界でなくてよい） */
function facetFan(r) {
  const pts = [0, 60, 120, 180, 240, 300].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return [Math.round(Math.cos(rad) * r * 10) / 10, Math.round(Math.sin(rad) * r * 10) / 10];
  });
  return (
    `<g stroke="{c1}" stroke-width="1.3" stroke-opacity="0.65">` +
    pts.map(([x, y]) => `<path d="M 0 0 L ${x} ${y}"/>`).join('') +
    `</g>`
  );
}

function bijouOval() {
  return (
    `<radialGradient id="g" cx="0.3" cy="0.26" r="0.95">` +
    `<stop offset="0" stop-color="{c0}"/><stop offset="0.55" stop-color="{c1}"/>` +
    `<stop offset="1" stop-color="{c2}"/></radialGradient>` +
    `<ellipse cx="0" cy="0" rx="36" ry="27" fill="url(#g)" stroke="{c2}" stroke-width="2.2"/>` +
    facetFan(27) +
    `<ellipse cx="-13" cy="-11" rx="8" ry="5" fill="#ffffff" opacity="0.85" transform="rotate(-25 -13 -11)"/>`
  );
}

function bijouMarquise() {
  return (
    `<radialGradient id="g" cx="0.3" cy="0.4" r="0.95">` +
    `<stop offset="0" stop-color="{c0}"/><stop offset="0.55" stop-color="{c1}"/>` +
    `<stop offset="1" stop-color="{c2}"/></radialGradient>` +
    `<path d="M -40 0 Q 0 -36 40 0 Q 0 36 -40 0 Z" fill="url(#g)" stroke="{c2}" stroke-width="2.2"/>` +
    `<g stroke="{c1}" stroke-width="1.3" stroke-opacity="0.65">` +
    `<path d="M -40 0 L 40 0"/><path d="M -20 -8 L 20 8"/><path d="M -20 8 L 20 -8"/>` +
    `<path d="M 0 -18 L 0 18"/></g>` +
    `<ellipse cx="-14" cy="-6" rx="8" ry="4.5" fill="#ffffff" opacity="0.85" transform="rotate(-15 -14 -6)"/>`
  );
}

function brion() {
  const balls = [
    [-15, -4, 8], [3, -11, 8], [18, -2, 7.5], [-4, 9, 8], [13, 11, 7], [-17, 12, 6.5],
  ];
  let s =
    `<radialGradient id="g" cx="0.32" cy="0.28" r="0.9">` +
    `<stop offset="0" stop-color="{c0}"/><stop offset="1" stop-color="{c1}"/></radialGradient>`;
  for (const [x, y, r] of balls) {
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#g)" stroke="{c1}" stroke-width="1.2"/>`;
  }
  return s;
}

function goldFlakeShape(tx, ty, rot, scale, op) {
  return (
    `<g transform="translate(${tx} ${ty}) rotate(${rot}) scale(${scale})">` +
    `<path d="M -16 -6 L -4 -16 L 12 -11 L 17 3 L 6 14 L -8 11 L -17 0 Z" fill="{c0}" fill-opacity="${op}" ` +
    `stroke="{c1}" stroke-width="1.2" stroke-opacity="0.6" stroke-linejoin="round"/>` +
    `<path d="M -9 -6 L 4 -11 M -2 2 L 11 -2" stroke="{c1}" stroke-width="1" stroke-opacity="0.4"/>` +
    `</g>`
  );
}

function goldFlake() {
  return (
    goldFlakeShape(-12, -8, -15, 0.95, 0.85) +
    goldFlakeShape(11, 3, 25, 0.8, 0.9) +
    goldFlakeShape(-1, 13, 55, 0.7, 0.78)
  );
}

function cabochon() {
  return (
    `<radialGradient id="g" cx="0.32" cy="0.26" r="0.95">` +
    `<stop offset="0" stop-color="{c0}"/><stop offset="0.6" stop-color="{c1}"/>` +
    `<stop offset="1" stop-color="{c2}"/></radialGradient>` +
    `<circle cx="0" cy="0" r="34" fill="{c2}"/>` +
    `<circle cx="0" cy="0" r="30" fill="url(#g)"/>` +
    `<ellipse cx="-11" cy="-12" rx="12" ry="8" fill="#ffffff" opacity="0.5" transform="rotate(-30 -11 -12)"/>` +
    `<ellipse cx="-13" cy="-14" rx="5" ry="3" fill="#ffffff" opacity="0.9" transform="rotate(-30 -13 -14)"/>`
  );
}

function heartStone() {
  return (
    `<radialGradient id="g" cx="0.34" cy="0.24" r="0.95">` +
    `<stop offset="0" stop-color="{c0}"/><stop offset="0.55" stop-color="{c1}"/>` +
    `<stop offset="1" stop-color="{c2}"/></radialGradient>` +
    `<path d="M 0 22 C -24 5, -40 -7, -40 -19 C -40 -30, -30 -36, -21 -36 ` +
    `C -12 -36, -5 -29, 0 -22 C 5 -29, 12 -36, 21 -36 C 30 -36, 40 -30, 40 -19 ` +
    `C 40 -7, 24 5, 0 22 Z" fill="url(#g)" stroke="{c2}" stroke-width="2.2" stroke-linejoin="round"/>` +
    `<g stroke="{c1}" stroke-width="1.3" stroke-opacity="0.6">` +
    `<path d="M 0 -8 L 0 20"/><path d="M 0 -8 L -40 -19"/><path d="M 0 -8 L 40 -19"/>` +
    `<path d="M 0 -8 L -21 -36"/><path d="M 0 -8 L 21 -36"/></g>` +
    `<ellipse cx="-14" cy="-16" rx="7" ry="4.5" fill="#ffffff" opacity="0.85" transform="rotate(-20 -14 -16)"/>`
  );
}

/* ------------------------------------------------------------------ */
/* 春                                                                  */
/* ------------------------------------------------------------------ */

function tulipPetal(tx, ty, rot, scale) {
  return (
    `<path d="M 0 6 C -14 6 -18 -10 -14 -26 C -10 -40 -4 -46 0 -50 ` +
    `C 4 -46 10 -40 14 -26 C 18 -10 14 6 0 6 Z" fill="{c0}" stroke="{c1}" stroke-width="2.6" ` +
    `stroke-linejoin="round" transform="translate(${tx} ${ty}) rotate(${rot}) scale(${scale})"/>`
  );
}

function tulip() {
  return (
    `<path d="M 0 8 L 0 46" stroke="{c2}" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M 0 26 C 18 22 26 8 22 -4 C 14 10 6 18 0 26 Z" fill="{c2}"/>` +
    tulipPetal(-15, 6, -20, 0.82) +
    tulipPetal(15, 6, 20, 0.82) +
    tulipPetal(0, 0, 0, 1) +
    `<path d="M 0 2 L 0 -40" stroke="{c1}" stroke-width="1.4" stroke-opacity="0.4"/>`
  );
}

function mimosaBall(cx, cy, r) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="{c0}"/>`;
  const n = 10;
  for (let i = 0; i < n; i++) {
    const rad = ((i * 360) / n * Math.PI) / 180;
    const x = Math.round((cx + Math.cos(rad) * r * 0.9) * 10) / 10;
    const y = Math.round((cy + Math.sin(rad) * r * 0.9) * 10) / 10;
    s += `<circle cx="${x}" cy="${y}" r="${Math.round(r * 0.32 * 10) / 10}" fill="{c0}"/>`;
  }
  return s;
}

function mimosa() {
  const balls = [
    [-26, -30, 8], [-8, -38, 9], [12, -32, 8.5], [26, -20, 7.5],
    [-30, -8, 7], [-4, -14, 9], [18, -6, 8], [0, 10, 8], [-16, 14, 7],
  ];
  let s =
    `<path d="M 0 34 C -6 10 -2 -16 6 -34" stroke="{c1}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
    `<path d="M -2 6 C -14 4 -20 -6 -18 -16" stroke="{c1}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
    `<path d="M 2 -14 C 12 -18 18 -26 16 -34" stroke="{c1}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  for (const [x, y, r] of balls) s += mimosaBall(x, y, r);
  return s;
}

function butterfly() {
  return (
    `<g fill="{c0}" stroke="{c1}" stroke-width="2.6" stroke-linejoin="round">` +
    `<path d="M -2 -6 C -16 -34 -46 -38 -50 -16 C -52 0 -32 6 -2 -4 Z"/>` +
    `<path d="M 2 -6 C 16 -34 46 -38 50 -16 C 52 0 32 6 2 -4 Z"/>` +
    `<path d="M -2 4 C -12 20 -32 30 -30 42 C -28 50 -10 44 -2 22 Z"/>` +
    `<path d="M 2 4 C 12 20 32 30 30 42 C 28 50 10 44 2 22 Z"/>` +
    `</g>` +
    `<circle cx="-24" cy="-20" r="4.5" fill="{c2}"/><circle cx="24" cy="-20" r="4.5" fill="{c2}"/>` +
    `<circle cx="-16" cy="30" r="3.2" fill="{c2}"/><circle cx="16" cy="30" r="3.2" fill="{c2}"/>` +
    `<ellipse cx="0" cy="2" rx="3.4" ry="28" fill="{c1}"/>` +
    `<path d="M -1.5 -24 C -8 -32 -14 -32 -16 -28 M 1.5 -24 C 8 -32 14 -32 16 -28" ` +
    `fill="none" stroke="{c1}" stroke-width="2" stroke-linecap="round"/>`
  );
}

/* ------------------------------------------------------------------ */
/* 夏                                                                  */
/* ------------------------------------------------------------------ */

function watermelon() {
  const seedPts = [[-16, 20], [0, 10], [16, 20], [-8, 26], [8, 26]];
  let seeds = '';
  for (const [x, y] of seedPts) {
    seeds += `<ellipse cx="${x}" cy="${y}" rx="2" ry="3.2" fill="{c1}" transform="rotate(${x} ${x} ${y})"/>`;
  }
  return (
    `<path d="M -40 30 A 40 40 0 0 1 40 30 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M -33 30 A 33 33 0 0 1 33 30 Z" fill="{c2}"/>` +
    `<path d="M -26 30 A 26 26 0 0 1 26 30 Z" fill="{c3}"/>` +
    seeds
  );
}

function goldfish() {
  return (
    `<path d="M -20 0 C -46 -20 -58 -6 -60 0 C -58 6 -46 20 -20 0 Z" fill="{c0}" stroke="{c1}" ` +
    `stroke-width="2.6" stroke-linejoin="round"/>` +
    `<ellipse cx="10" cy="0" rx="30" ry="20" fill="{c0}" stroke="{c1}" stroke-width="3"/>` +
    `<path d="M 4 -18 C 8 -32 20 -32 22 -20" fill="{c0}" stroke="{c1}" stroke-width="2.4"/>` +
    `<path d="M 6 10 C 0 22 -8 24 -14 20 C -6 16 0 12 6 10 Z" fill="{c0}" stroke="{c1}" ` +
    `stroke-width="2" stroke-linejoin="round"/>` +
    `<circle cx="30" cy="-4" r="4.2" fill="{c2}"/><circle cx="31.5" cy="-5.5" r="1.4" fill="#ffffff"/>` +
    `<path d="M 38 4 Q 42 6 38 8" fill="none" stroke="{c1}" stroke-width="1.6"/>` +
    `<path d="M -2 -6 Q 4 -2 -2 2 M 6 -10 Q 12 -6 6 -2 M 6 4 Q 12 8 6 12" ` +
    `fill="none" stroke="{c1}" stroke-width="1.2" stroke-opacity="0.4"/>`
  );
}

function hydrangeaFloret(cx, cy, scale, alt) {
  const fill = alt ? '{c2}' : '{c0}';
  let s = `<g transform="translate(${cx} ${cy}) scale(${scale})">`;
  for (let i = 0; i < 4; i++) {
    s += `<path d="M 0 0 L -4 -8 Q 0 -12 4 -8 Z" fill="${fill}" stroke="{c1}" stroke-width="0.8" ` +
      `transform="rotate(${i * 90})"/>`;
  }
  return s + `</g>`;
}

function hydrangea() {
  const pts = [
    [0, -30, 1, false], [-20, -18, 0.9, true], [20, -18, 0.9, false],
    [-28, 4, 0.85, false], [28, 4, 0.85, true], [-14, 18, 0.9, true], [14, 18, 0.9, false],
    [0, -6, 1.05, false], [-6, 26, 0.8, true], [6, 26, 0.8, false], [0, 10, 0.85, true],
  ];
  return pts.map(([x, y, s, alt]) => hydrangeaFloret(x, y, s, alt)).join('');
}

function icecream() {
  return (
    `<path d="M -16 0 L 16 0 L 4 40 Q 0 46 -4 40 Z" fill="{c2}" stroke="{c1}" stroke-width="2.6" ` +
    `stroke-linejoin="round"/>` +
    `<path d="M -12 8 L 12 8 M -9 18 L 9 18 M -6 28 L 6 28" stroke="{c1}" stroke-width="1.4" stroke-opacity="0.5"/>` +
    `<path d="M -22 0 C -22 -20 -10 -34 0 -34 C 10 -34 22 -20 22 0 Z" fill="{c0}" stroke="{c1}" ` +
    `stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M -14 -6 C -12 -20 -4 -30 0 -32 M 4 -32 C 10 -28 16 -18 16 -4" fill="none" stroke="{c1}" ` +
    `stroke-width="1.4" stroke-opacity="0.4"/>` +
    `<path d="M -14 -20 Q -6 -14 0 -22 Q 6 -30 14 -22" fill="none" stroke="{c3}" stroke-width="2.6" ` +
    `stroke-linecap="round"/>` +
    `<circle cx="0" cy="-36" r="5" fill="{c3}"/>`
  );
}

/* ------------------------------------------------------------------ */
/* 秋                                                                  */
/* ------------------------------------------------------------------ */

function maple() {
  return (
    `<path d="M 0 -44 L 8 -24 L 26 -34 L 20 -14 L 40 -16 L 24 0 L 38 14 L 18 10 L 22 32 L 6 18 ` +
    `L 0 34 L -6 18 L -22 32 L -18 10 L -38 14 L -24 0 L -40 -16 L -20 -14 L -26 -34 L -8 -24 Z" ` +
    `fill="{c0}" stroke="{c1}" stroke-width="2.6" stroke-linejoin="round"/>` +
    `<path d="M 0 34 L 0 48" stroke="{c1}" stroke-width="3" stroke-linecap="round"/>` +
    `<g stroke="{c1}" stroke-width="1.4" stroke-opacity="0.5">` +
    `<path d="M 0 20 L 0 -38"/><path d="M 0 4 L 24 -28"/><path d="M 0 4 L -24 -28"/>` +
    `<path d="M 0 14 L 30 6"/><path d="M 0 14 L -30 6"/></g>`
  );
}

function ginkgo() {
  return (
    `<path d="M 0 30 C -30 26 -38 4 -30 -14 C -22 -30 -10 -34 -4 -30 L 0 -16 L 4 -30 ` +
    `C 10 -34 22 -30 30 -14 C 38 4 30 26 0 30 Z" fill="{c0}" stroke="{c1}" stroke-width="2.8" ` +
    `stroke-linejoin="round"/>` +
    `<g stroke="{c1}" stroke-width="1.2" stroke-opacity="0.45">` +
    `<path d="M 0 24 L -4 -20"/><path d="M 0 24 L 4 -20"/><path d="M 0 24 L -18 -6"/>` +
    `<path d="M 0 24 L 18 -6"/></g>` +
    `<path d="M 0 30 L 0 44" stroke="{c1}" stroke-width="3" stroke-linecap="round"/>`
  );
}

function acorn() {
  return (
    `<path d="M -18 4 C -18 26 -8 38 0 38 C 8 38 18 26 18 4 C 18 -10 10 -18 0 -18 ` +
    `C -10 -18 -18 -10 -18 4 Z" fill="{c0}" stroke="{c1}" stroke-width="2.8" stroke-linejoin="round"/>` +
    `<path d="M -8 10 Q 0 4 8 10 M -9 20 Q 0 14 9 20" fill="none" stroke="{c1}" stroke-width="1.2" ` +
    `stroke-opacity="0.4"/>` +
    `<path d="M -20 -6 C -20 -22 -10 -30 0 -30 C 10 -30 20 -22 20 -6 C 12 -12 -12 -12 -20 -6 Z" ` +
    `fill="{c2}" stroke="{c1}" stroke-width="2.8" stroke-linejoin="round"/>` +
    `<g stroke="{c1}" stroke-width="1.2" stroke-opacity="0.5">` +
    `<path d="M -14 -10 L -14 -22"/><path d="M -5 -13 L -5 -27"/><path d="M 5 -13 L 5 -27"/>` +
    `<path d="M 14 -10 L 14 -22"/></g>` +
    `<path d="M 0 -30 L 0 -38" stroke="{c1}" stroke-width="3" stroke-linecap="round"/>`
  );
}

/* ------------------------------------------------------------------ */
/* 冬・クリスマス                                                        */
/* ------------------------------------------------------------------ */

function wreathLeaf(cx, cy, rot) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="14" fill="{c0}" stroke="{c1}" stroke-width="1.6" ` +
    `transform="rotate(${rot} ${cx} ${cy})"/>`;
}

function wreath() {
  let s = '';
  const n = 14;
  const R = 32;
  for (let i = 0; i < n; i++) {
    const a = (i * 360) / n;
    const rad = (a * Math.PI) / 180;
    const x = Math.round(Math.cos(rad) * R * 10) / 10;
    const y = Math.round(Math.sin(rad) * R * 10) / 10;
    s += wreathLeaf(x, y, a + 90);
  }
  const berries = [[0, -32], [22, -22], [-22, -22], [28, 10], [-28, 10], [0, 32]];
  for (const [x, y] of berries) s += `<circle cx="${x}" cy="${y}" r="4" fill="{c2}"/>`;
  s += `<path d="M -12 40 L -2 34 L -2 46 Z M 12 40 L 2 34 L 2 46 Z" fill="{c2}" stroke="{c1}" ` +
    `stroke-width="1.6" stroke-linejoin="round"/>`;
  return s;
}

function stocking() {
  return (
    `<path d="M -14 -34 L 14 -34 L 14 4 C 14 4 30 4 34 18 C 38 32 26 40 10 38 C -6 36 -14 26 -14 10 Z" ` +
    `fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M -14 -34 L 14 -34 L 14 -22 L -14 -22 Z" fill="{c2}" stroke="{c1}" stroke-width="3" ` +
    `stroke-linejoin="round"/>` +
    `<circle cx="-8" cy="-8" r="3" fill="{c2}"/><circle cx="4" cy="-14" r="3" fill="{c2}"/>` +
    `<circle cx="-2" cy="20" r="3" fill="{c2}"/>`
  );
}

function bell() {
  return (
    `<path d="M 0 -30 C -18 -30 -22 -10 -26 6 C -28 14 -34 18 -34 18 L 34 18 C 34 18 28 14 26 6 ` +
    `C 22 -10 18 -30 0 -30 Z" fill="{c0}" stroke="{c1}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M -34 18 L 34 18 L 30 26 L -30 26 Z" fill="{c0}" stroke="{c1}" stroke-width="2.6" ` +
    `stroke-linejoin="round"/>` +
    `<circle cx="0" cy="34" r="5" fill="{c2}"/>` +
    `<rect x="-6" y="-40" width="12" height="8" rx="3" fill="{c1}"/>` +
    `<path d="M -20 -4 Q 0 4 20 -4" fill="none" stroke="{c2}" stroke-width="2" stroke-opacity="0.6"/>`
  );
}

/* ------------------------------------------------------------------ */
/* ハロウィン                                                           */
/* ------------------------------------------------------------------ */

function ghost() {
  return (
    `<path d="M -26 10 C -26 -20 -14 -36 0 -36 C 14 -36 26 -20 26 10 L 20 4 L 13 12 L 6 4 L 0 12 ` +
    `L -6 4 L -13 12 L -20 4 Z" fill="{c0}" stroke="{c1}" stroke-width="2.8" stroke-linejoin="round"/>` +
    `<circle cx="-9" cy="-6" r="3.6" fill="{c1}"/><circle cx="9" cy="-6" r="3.6" fill="{c1}"/>` +
    `<ellipse cx="0" cy="4" rx="4" ry="5" fill="{c1}"/>`
  );
}

function spiderweb() {
  let s = '';
  const spokes = 8;
  const R = 34;
  for (let i = 0; i < spokes; i++) {
    const a = (i * 360) / spokes;
    const rad = (a * Math.PI) / 180;
    const x = Math.round(Math.cos(rad) * R * 10) / 10;
    const y = Math.round(Math.sin(rad) * R * 10) / 10;
    s += `<path d="M 0 0 L ${x} ${y}" stroke="{c0}" stroke-width="1.8" stroke-opacity="0.75"/>`;
  }
  const rings = [10, 18, 26, 34];
  for (const r of rings) {
    let d = '';
    for (let i = 0; i <= spokes; i++) {
      const a = (i * 360) / spokes;
      const rad = (a * Math.PI) / 180;
      const x = Math.round(Math.cos(rad) * r * 10) / 10;
      const y = Math.round(Math.sin(rad) * r * 10) / 10;
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    s += `<path d="${d}" fill="none" stroke="{c0}" stroke-width="1.6" stroke-opacity="0.7"/>`;
  }
  s +=
    `<g transform="translate(14 -14)">` +
    `<ellipse cx="0" cy="0" rx="5" ry="6" fill="{c1}"/>` +
    `<circle cx="0" cy="-7" r="3" fill="{c1}"/>` +
    `<g stroke="{c1}" stroke-width="1.4">` +
    `<path d="M -4 -2 L -10 -6 M -4 2 L -10 4 M -4 5 L -9 9"/>` +
    `<path d="M 4 -2 L 10 -6 M 4 2 L 10 4 M 4 5 L 9 9"/>` +
    `</g></g>`;
  return s;
}

/* ------------------------------------------------------------------ */
/* お正月                                                               */
/* ------------------------------------------------------------------ */

function plumBlossom() {
  let petals = '';
  for (let i = 0; i < 5; i++) {
    petals += `<circle cx="0" cy="-18" r="12" fill="{c0}" stroke="{c1}" stroke-width="1.8" ` +
      `transform="rotate(${i * 72})"/>`;
  }
  let stamens = '';
  for (let i = 0; i < 7; i++) {
    const rad = ((i * 360) / 7 * Math.PI) / 180;
    const x1 = Math.round(Math.cos(rad) * 4 * 10) / 10;
    const y1 = Math.round(Math.sin(rad) * 4 * 10) / 10;
    const x2 = Math.round(Math.cos(rad) * 10 * 10) / 10;
    const y2 = Math.round(Math.sin(rad) * 10 * 10) / 10;
    stamens += `<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="{c2}" stroke-width="1.4" stroke-linecap="round"/>`;
  }
  return (
    `<path d="M -30 30 C -10 20 0 10 4 0" fill="none" stroke="{c1}" stroke-width="2.6" stroke-linecap="round"/>` +
    petals + stamens +
    `<circle cx="0" cy="0" r="4" fill="{c2}"/>` +
    `<circle cx="-24" cy="22" r="6" fill="{c0}" stroke="{c1}" stroke-width="1.6"/>`
  );
}

/* ------------------------------------------------------------------ */
/* モチーフ本体                                                         */
/* ------------------------------------------------------------------ */

export const EXTRA_MOTIFS = {
  /* --- ビジュー・パーツ風 --- */
  'motif.bijou_oval': {
    name: 'ビジュー（オーバル）', box: [76, 58], slots: 3, defaultC: [1, 3, 5], defaultW: 26, tags: ['パーツ風'],
    svg: bijouOval(),
  },
  'motif.bijou_marquise': {
    name: 'ビジュー（マーキス）', box: [88, 44], slots: 3, defaultC: [1, 8, 5], defaultW: 30, tags: ['パーツ風'],
    svg: bijouMarquise(),
  },
  'motif.brion': {
    name: 'ブリオン', box: [60, 46], slots: 2, defaultC: [7, 5], defaultW: 22, tags: ['パーツ風'],
    svg: brion(),
  },
  'motif.gold_flake': {
    // 金箔。大きさのちがう角ばった箔を数枚、少しずつ重ねて散らす
    name: '金箔', tags: ['パーツ風', 'トレンド'], box: [96, 82], slots: 2, defaultC: [7, 4], defaultW: 34,
    svg:
      `<polygon points="-44,-30 -18,-36 -8,-14 -30,-4 -46,-14" fill="{c0}"/>` +
      `<polygon points="-40,-28 -24,-32 -20,-20 -34,-14" fill="{c1}" fill-opacity="0.55"/>` +
      `<polygon points="6,-26 34,-32 46,-8 22,2 4,-10" fill="{c0}"/>` +
      `<polygon points="12,-22 30,-26 36,-12 18,-6" fill="{c1}" fill-opacity="0.45"/>` +
      `<polygon points="-30,8 -6,2 4,24 -18,34 -34,22" fill="{c0}"/>` +
      `<polygon points="-24,12 -10,8 -4,20 -18,26" fill="{c1}" fill-opacity="0.5"/>` +
      `<polygon points="20,14 42,10 48,30 26,36" fill="{c0}"/>`,
  },
  'motif.heart_stone': {
    name: 'ハートストーン', box: [84, 64], slots: 3, defaultC: [1, 0, 3], defaultW: 30, tags: ['パーツ風'],
    svg: heartStone(),
  },
  'motif.cabochon': {
    name: 'カボション', box: [76, 76], slots: 3, defaultC: [1, 2, 5], defaultW: 24, tags: ['パーツ風'],
    svg: cabochon(),
  },

  /* --- 春 --- */
  'motif.tulip': {
    name: 'チューリップ', box: [72, 104], slots: 3, defaultC: [3, 5, 8], defaultW: 28, tags: ['季節', '春'],
    svg: tulip(),
  },
  'motif.mimosa': {
    name: 'ミモザ', box: [82, 92], slots: 2, defaultC: [7, 8], defaultW: 34, tags: ['季節', '春'],
    svg: mimosa(),
  },
  'motif.butterfly': {
    name: '蝶', box: [108, 96], slots: 3, defaultC: [2, 5, 0], defaultW: 40, tags: ['季節', '春'],
    svg: butterfly(),
  },

  /* --- 夏 --- */
  'motif.watermelon': {
    name: 'すいか', box: [88, 44], slots: 4, defaultC: [8, 5, 1, 3], defaultW: 34, tags: ['季節', '夏'],
    svg: watermelon(),
  },
  'motif.goldfish': {
    name: '金魚', box: [106, 60], slots: 3, defaultC: [7, 5, 5], defaultW: 40, tags: ['季節', '夏'],
    svg: goldfish(),
  },
  'motif.hydrangea': {
    // あじさい。4枚花びらの小花を球状にかためる。小さいと消えるので花を大きめに
    name: 'あじさい', tags: ['季節', '夏', '花'], box: [92, 92], slots: 3, defaultC: [2, 0, 4], defaultW: 34,
    svg: (() => {
      const spots = [[0, -22], [-24, -6], [24, -6], [-13, 20], [13, 20], [0, -1], [-30, 24], [30, 24]];
      let out = '';
      spots.forEach(([x, y], i) => {
        const col = i % 3 === 1 ? '{c1}' : '{c0}';
        for (let k = 0; k < 4; k++) {
          out += `<ellipse cx="0" cy="-9" rx="6.5" ry="9" fill="${col}"` +
                 ` transform="translate(${x} ${y}) rotate(${k * 90})"/>`;
        }
        out += `<circle cx="${x}" cy="${y}" r="3" fill="{c2}"/>`;
      });
      return out;
    })(),
  },
  'motif.icecream': {
    name: 'アイス', box: [52, 92], slots: 4, defaultC: [0, 5, 7, 3], defaultW: 22, tags: ['季節', '夏'],
    svg: icecream(),
  },

  /* --- 秋 --- */
  'motif.maple': {
    // もみじ。5枚の掌状の葉。ギザギザの星にすると「星」に見えてしまうので、
    // 葉柄から放射する細長い葉先＋切れ込みで作る
    name: 'もみじ', tags: ['季節', '秋'], box: [92, 96], slots: 2, defaultC: [3, 5], defaultW: 30,
    svg: (() => {
      const lobes = [0, -46, 46, -92, 92];
      let out = '';
      for (const a of lobes) {
        const len = Math.abs(a) > 60 ? 30 : Math.abs(a) > 20 ? 38 : 44;
        out += `<path d="M 0 12 L ${-7} ${12 - len * 0.45} L ${-3} ${12 - len * 0.62}` +
               ` L 0 ${12 - len} L 3 ${12 - len * 0.62} L 7 ${12 - len * 0.45} Z"` +
               ` fill="{c0}" stroke="{c1}" stroke-width="2" stroke-linejoin="round"` +
               ` transform="rotate(${a} 0 12)"/>`;
      }
      out += `<path d="M 0 12 L 0 44" stroke="{c1}" stroke-width="3" stroke-linecap="round"/>`;
      return out;
    })(),
  },
  'motif.ginkgo': {
    name: 'いちょう', box: [82, 84], slots: 2, defaultC: [7, 5], defaultW: 30, tags: ['季節', '秋'],
    svg: ginkgo(),
  },
  'motif.acorn': {
    name: 'どんぐり', box: [48, 84], slots: 3, defaultC: [7, 5, 6], defaultW: 22, tags: ['季節', '秋'],
    svg: acorn(),
  },

  /* --- 冬・クリスマス --- */
  'motif.wreath': {
    name: 'リース', box: [96, 96], slots: 3, defaultC: [8, 5, 3], defaultW: 34, tags: ['季節', '冬', 'クリスマス'],
    svg: wreath(),
  },
  'motif.stocking': {
    name: '靴下', box: [62, 84], slots: 3, defaultC: [3, 5, 1], defaultW: 26, tags: ['季節', '冬', 'クリスマス'],
    svg: stocking(),
  },
  'motif.bell': {
    name: 'ベル', box: [74, 84], slots: 3, defaultC: [7, 5, 4], defaultW: 30, tags: ['季節', '冬', 'クリスマス'],
    svg: bell(),
  },

  /* --- ハロウィン --- */
  'motif.ghost': {
    name: 'おばけ', box: [58, 56], slots: 2, defaultC: [1, 5], defaultW: 24, tags: ['季節', '秋', 'ハロウィン'],
    svg: ghost(),
  },
  'motif.spiderweb': {
    name: 'くもの巣', box: [76, 76], slots: 2, defaultC: [1, 5], defaultW: 30, tags: ['季節', '秋', 'ハロウィン'],
    svg: spiderweb(),
  },

  /* --- お正月 --- */
  'motif.plum_blossom': {
    name: '梅', box: [68, 72], slots: 3, defaultC: [0, 5, 7], defaultW: 26, tags: ['季節', '冬', '正月'],
    svg: plumBlossom(),
  },
};
