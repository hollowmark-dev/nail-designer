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

/** 先端の形。左端 (0, len) から右端 (100, len) へ、上を通って描く */
function tipPath(shape) {
  const len = SHAPES[shape].len;
  switch (shape) {
    case 'round':
      return `C 0 12, 20 0, 50 0 C 80 0, 100 12, 100 ${len}`;
    case 'square':
      return `L 0 8 Q 0 0 8 0 L 92 0 Q 100 0 100 8 L 100 ${len}`;
    case 'almond':
      return `C 0 34, 28 0, 50 0 C 72 0, 100 34, 100 ${len}`;
    case 'ballerina':
      return `L 26 5 Q 27 0 33 0 L 67 0 Q 73 0 74 5 L 100 ${len}`;
    default:
      return tipPath('round');
  }
}

/**
 * 爪の輪郭パス。**先端が上、根元（甘皮側）が下。**
 * 指を見たときの向きに合わせてある（先端が奥＝上に見える）。
 * 先端の形 + 直線の側壁 + 根元の曲線。
 */
export function nailPath(shape = 'round', h = 155) {
  const s = SHAPES[shape] ? shape : 'round';
  return `M 0 ${SHAPES[s].len} ${tipPath(s)}`
       + ` L 100 ${h - CUT} C 82 ${h}, 18 ${h}, 0 ${h - CUT} Z`;
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
    case 'tip':  return v;          // 先端（上）からの距離
    case 'root': return h - v;      // 根元（下）からの距離
    default:     return h / 2 + v;  // 中心からのオフセット
  }
}

/** resolveY の逆。ドラッグで動かした結果の実 Y を、anchor 基準の値に戻す */
export function unresolveY(anchor, actualY, h) {
  switch (anchor) {
    case 'tip':  return actualY;
    case 'root': return h - actualY;
    default:     return actualY - h / 2;
  }
}
