/**
 * 爪の形と座標系。
 *
 * 座標系: 爪1本は viewBox="0 0 100 H" の中に描く。幅は常に100、H は長さで変わる。
 *   - y を「高さに対する割合」で持たない。長さを変えたときモチーフが縦に伸びるため
 *   - レイヤーは anchor（root / tip / center）を持ち、そこからの距離で y を表す
 *
 * 形は固定パス文字列にせず関数で生成する。固定パスを縦に拡縮すると
 * ラウンドの先端が楕円に潰れ、アーモンドの角度が変わる（Phase 0 で確認済み）。
 */

export const NAIL_W = 100;

export const LENGTHS = {
  short:  { h: 130, label: 'ショート' },
  middle: { h: 155, label: 'ミドル' },
  long:   { h: 185, label: 'ロング' },
};

/** 根元カーブの深さ */
const CUT = 14;

/**
 * 形の違いは「先端」だけ。len は先端形状が占める高さ（側壁はその上まで直線）。
 * Phase 0 の実測先端幅: ラウンド31 / スクエア95 / アーモンド15 / バレリーナ44
 */
export const SHAPES = {
  round:     { len: 46, label: 'ラウンド' },
  square:    { len: 14, label: 'スクエア' },
  almond:    { len: 62, label: 'アーモンド' },
  ballerina: { len: 58, label: 'バレリーナ' },
};

function tipPath(shape, h) {
  const y = h - SHAPES[shape].len;
  switch (shape) {
    case 'round':
      return `C 100 ${h - 12}, 80 ${h}, 50 ${h} C 20 ${h}, 0 ${h - 12}, 0 ${y}`;
    case 'square':
      return `L 100 ${h - 8} Q 100 ${h} 92 ${h} L 8 ${h} Q 0 ${h} 0 ${h - 8} L 0 ${y}`;
    case 'almond':
      return `C 100 ${h - 34}, 72 ${h}, 50 ${h} C 28 ${h}, 0 ${h - 34}, 0 ${y}`;
    case 'ballerina':
      return `L 74 ${h - 5} Q 73 ${h} 67 ${h} L 33 ${h} Q 27 ${h} 26 ${h - 5} L 0 ${y}`;
    default:
      return tipPath('round', h);
  }
}

/** 爪の輪郭パス。根元の曲線 + 直線の側壁 + 先端 */
export function nailPath(shape = 'round', h = 155) {
  const s = SHAPES[shape] ? shape : 'round';
  return `M 0 ${CUT} C 18 0, 82 0, 100 ${CUT} L 100 ${h - SHAPES[s].len} ${tipPath(s, h)} Z`;
}

export function nailHeight(length) {
  return (LENGTHS[length] || LENGTHS.middle).h;
}

/**
 * レイヤーの anchor と y から、爪の中での実際の Y 座標を出す。
 * 長さを変えてもフレンチは先端に貼りつき、モチーフは中央に残る。
 */
export function resolveY(anchor, y, h) {
  const v = Number(y) || 0;
  switch (anchor) {
    case 'root': return v;          // 根元からの距離
    case 'tip':  return h - v;      // 先端からの距離
    default:     return h / 2 + v;  // 中心からのオフセット
  }
}

/** resolveY の逆。ドラッグで動かした結果の実 Y を、anchor 基準の値に戻す */
export function unresolveY(anchor, actualY, h) {
  switch (anchor) {
    case 'root': return actualY;
    case 'tip':  return h - actualY;
    default:     return actualY - h / 2;
  }
}
