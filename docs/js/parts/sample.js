/**
 * 作例（手書きで作っていた10本）を、このアプリのデータ構造で表したもの。
 *
 * Phase 1 の完了条件「作例10本を再現できること」の実体であり、
 * 初回起動時のサンプル作品でもある。空の画面から始めさせないため。
 */

import { newDesign } from '../model.js';

// パレット: 0ピンク 1白 2水色 3赤 4クリーム 5チャコール 6グレージュ 7オレンジ
const P = { PINK: 0, WHITE: 1, BLUE: 2, RED: 3, CREAM: 4, INK: 5, GREY: 6, ORANGE: 7 };

const lace = (y, c0, c1) => ({ part: 'edge.lace_french', anchor: 'tip', y, c: [c0, c1] });
const ribbon = (y, body, w) => ({ part: 'motif.ribbon', anchor: 'center', x: 50, y, w: w || 42, rot: 0, c: [body, P.INK] });
const motif = (id, x, y, w, c) => ({ part: id, anchor: 'center', x, y, w, rot: 0, c });

export function sampleDesign() {
  const d = newDesign('作例（サンプル）');
  d.shape = 'round';
  d.length = 'middle';

  const nails = [
    // 1: ピンク地 + 根元レース + 水色リボン2つ
    { base: P.PINK, layers: [lace(30, P.WHITE, P.PINK), ribbon(-22, P.BLUE), ribbon(18, P.BLUE)] },

    // 2: ピンク地 + 根元レース + 白猫 + 頭のピンクリボン
    { base: P.PINK, layers: [
      lace(46, P.WHITE, P.PINK),
      motif('motif.cat', 50, 10, 54, [P.WHITE, P.INK, P.PINK]),
      motif('motif.ribbon', 50, -30, 28, [P.PINK, P.INK]),
    ] },

    // 3: クリーム地 + 音符とト音記号
    { base: P.CREAM, layers: [
      motif('motif.note8', 36, -26, 28, [P.INK]),
      motif('motif.clef', 64, 10, 22, [P.RED]),
      motif('motif.heart', 34, 34, 15, [P.RED]),
    ] },

    // 4: 白地 + 根元レース + 赤リボン2つ
    { base: P.WHITE, layers: [lace(30, P.PINK, P.RED), ribbon(-22, P.RED), ribbon(18, P.RED)] },

    // 5: 白地 + 小ドット + 先端フレンチ（ピンク）+ 中央ライン
    { base: P.WHITE, layers: [
      { part: 'pattern.dot_s', c: [P.INK] },
      { part: 'edge.halfmoon', anchor: 'root', y: 48, c: [P.PINK] },
      { part: 'edge.line', anchor: 'center', y: 6, c: [P.WHITE] },
    ] },

    // 6: クリーム地 + ト音記号と音符（3と対）
    { base: P.CREAM, layers: [
      motif('motif.clef', 36, -8, 24, [P.RED]),
      motif('motif.note8', 66, 20, 24, [P.INK]),
      motif('motif.heart', 30, 34, 15, [P.RED]),
    ] },

    // 7: ピンク地 + 根元レース + グレー猫 + 赤リボン
    { base: P.PINK, layers: [
      lace(46, P.WHITE, P.PINK),
      motif('motif.cat', 50, 10, 54, [P.GREY, P.INK, P.PINK]),
      motif('motif.ribbon', 50, -30, 28, [P.RED, P.INK]),
    ] },

    // 8: ピンク地 + 小ドット + 中央に白い2本ライン
    { base: P.PINK, layers: [
      { part: 'pattern.dot_s', c: [P.INK] },
      { part: 'edge.line_double', anchor: 'center', y: 0, c: [P.WHITE] },
    ] },

    // 9: ピンク地 + 根元レース + ピンクリボン2つ
    { base: P.PINK, layers: [lace(30, P.WHITE, P.PINK), ribbon(-22, P.PINK), ribbon(18, P.PINK)] },

    // 10: ピンク地 + 根元レース + トラ猫 + 水色リボン
    { base: P.PINK, layers: [
      lace(46, P.WHITE, P.PINK),
      motif('motif.cat_tabby', 50, 10, 54, [P.ORANGE, P.INK, P.PINK, P.CREAM]),
      motif('motif.ribbon', 50, -30, 28, [P.BLUE, P.INK]),
    ] },
  ];

  nails.forEach((spec, i) => {
    d.nails[i].base = { part: 'base.solid', c: [spec.base] };
    d.nails[i].layers = spec.layers.map(l => JSON.parse(JSON.stringify(l)));
  });

  return d;
}
