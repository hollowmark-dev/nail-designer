/**
 * 手書きレイヤー。指でなぞった点列を、なめらかな SVG パスに変換する。
 *
 * 筆圧対応の可変幅は作らない（固定幅の stroke で始めると決めてある）。
 *
 * 手順は必ず「間引き → Catmull-Rom補間 → ベジェ変換」の順で踏む。
 * 生の点列をそのまま繋ぐと指のブレがそのまま出てガタつくため。
 *
 * レイヤーのデータ形（model.js 側で作る）:
 *   { type: 'ink', d: 'M20,30C...', box: [w, h], anchor: 'center', x: 50, y: 0,
 *     w: 60, rot: 0, sw: 2.8, c: [5] }
 *   d は原点中心に正規化した（normalize 済みの）パス。box の中に収まる。
 *   配置時に w / box[0] で拡大される（render.js 側で motif と同じ要領で組む）。
 *
 * d の書式: "M{x},{y}" と "C{x1},{y1},{x2},{y2},{x},{y}" のみを、コンマ区切り・
 * スペース無しで生成する（保存サイズ対策。pathBBox/normalize もこの書式だけを読む）。
 */

const NUM_RE = /-?\d+(?:\.\d+)?/g;

function round(v, p = 2) {
  const f = Math.pow(10, p);
  return Math.round((Number(v) || 0) * f) / f;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * 距離しきい値で間引く。前回残した点から tol 未満の点は捨てる。
 * 始点・終点は必ず残す（始点を落とすとストロークの起点がずれ、
 * 終点を落とすと指を離した位置が反映されなくなるため）。
 */
export function simplify(points, tol = 1.2) {
  if (!Array.isArray(points) || points.length === 0) return [];
  if (points.length <= 2) return points.slice();

  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    if (dist(out[out.length - 1], points[i]) >= tol) out.push(points[i]);
  }
  const last = points[points.length - 1];
  if (dist(out[out.length - 1], last) > 0) out.push(last);
  return out;
}

/**
 * 点が1つだけのときに打つ「小さな点」。stroke-linecap="round" の効きが
 * 環境によって怪しい零長パスは避け、ごく短い L セグメントにする
 * （pathBBox が扱えるのは M/C/L だけなので、ここでも M/L に留める）。
 */
function dotPath(p) {
  const x = round(p.x), y = round(p.y);
  return `M${x},${y}L${round(p.x + 0.01)},${y}`;
}

/**
 * 間引き済みの点列（simplify を通した後の points）を、
 * Catmull-Rom 補間 → 3次ベジェ変換した SVG パス文字列にする。
 *
 * 点が1つなら小さな点、2つなら直線（曲線を作るのに必要な近傍点が無いため）、
 * 3つ以上で初めて Catmull-Rom によるベジェ曲線にする。
 * 例外は投げない（点が空/1/2でも妥当な d を返す）。
 */
export function toPath(points) {
  if (!Array.isArray(points) || points.length === 0) return '';
  if (points.length === 1) return dotPath(points[0]);

  if (points.length === 2) {
    const [a, b] = points;
    return `M${round(a.x)},${round(a.y)}L${round(b.x)},${round(b.y)}`;
  }

  const p = points;
  const n = p.length;
  let d = `M${round(p[0].x)},${round(p[0].y)}`;

  for (let i = 0; i < n - 1; i++) {
    const p0 = p[Math.max(i - 1, 0)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(i + 2, n - 1)];

    // 一様 Catmull-Rom → 3次ベジェの標準変換（tension 1/6）
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += `C${round(c1x)},${round(c1y)},${round(c2x)},${round(c2y)},${round(p2.x)},${round(p2.y)}`;
  }

  return d;
}

/** d 文字列から M/L/C の座標ペアを [[x,y], ...] の列として抜き出す */
function extractCoords(d) {
  const coords = [];
  const cmdRe = /([MLC])([^MLC]*)/g;
  let m;
  while ((m = cmdRe.exec(d))) {
    const nums = (m[2].match(NUM_RE) || []).map(Number);
    for (let i = 0; i + 1 < nums.length; i += 2) coords.push([nums[i], nums[i + 1]]);
  }
  return coords;
}

/**
 * 自分が生成した M/C/L だけを含むパスの外接箱 [minX, minY, maxX, maxY]。
 * C のベジェ制御点も含めて計算する（曲線が実際に通る範囲より少し大きめになるが、
 * 制御点はカーブの終点付近にあることが多く実用上のズレは小さいため許容する）。
 */
export function pathBBox(d) {
  const coords = extractCoords(d);
  if (coords.length === 0) return [0, 0, 0, 0];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

/** d 文字列の全座標を dx, dy だけ平行移動する */
function translateD(d, dx, dy) {
  let i = 0;
  const coords = extractCoords(d);
  return d.replace(/([MLC])([^MLC]*)/g, (whole, cmd, rest) => {
    const nums = (rest.match(NUM_RE) || []).map(Number);
    let out = cmd;
    for (let k = 0; k + 1 < nums.length; k += 2) {
      const [x, y] = coords[i++];
      out += `${round(x + dx)},${round(y + dy)}`;
      if (k + 3 < nums.length) out += ',';
    }
    return out;
  });
}

/**
 * 外接箱の中心が原点に来るよう平行移動した { d, box:[w,h] } を返す。
 * 空パス（simplify/toPath が空文字を返した場合）は box [0,0] のまま素通しする。
 */
export function normalize(d) {
  if (!d) return { d: d || '', box: [0, 0] };
  const [minX, minY, maxX, maxY] = pathBBox(d);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const w = round(maxX - minX);
  const h = round(maxY - minY);
  return { d: translateD(d, -cx, -cy), box: [w, h] };
}

/**
 * layer の markup。{c0} を使う。fill="none" とストロークの角丸は必ず付ける
 * （固定幅・角丸のペン、という Phase 0 以降の設計判断そのままの見た目にするため）。
 * x/y/anchor/rot/w（拡大率）による配置は、motif と同じく呼び出し側の
 * 外側 <g transform="..."> に委ねる（このモジュールは中身の <path> だけを返す）。
 */
export function inkMarkup(layer) {
  const sw = Number(layer.sw) || DEFAULT_PEN.sw;
  return `<path d="${layer.d || ''}" fill="none" stroke="{c0}" stroke-width="${round(sw, 2)}" ` +
    `stroke-linecap="round" stroke-linejoin="round"/>`;
}

export const DEFAULT_PEN = { sw: 2.8, colorSlot: 5 };
export const PEN_WIDTHS = [1.8, 2.8, 4.5];
