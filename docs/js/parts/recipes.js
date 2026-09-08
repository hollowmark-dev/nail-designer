/**
 * レシピ = 1本まるごとの完成テンプレ。
 *
 * タップで爪1本が即完成し、そこから微調整する。ゼロから積み上げるより速い、
 * というのがこのアプリの時短の柱のひとつ。
 *
 * 色はパレットのインデックスで持つので、レシピを置いたあとに配色セットを
 * 差し替えれば雰囲気ごと変わる。
 * 0 ピンク / 1 白 / 2 水色 / 3 赤 / 4 クリーム / 5 チャコール / 6 グレージュ / 7 オレンジ
 */

const base = (part, ...c) => ({ part, c });
const edge = (part, anchor, y, ...c) => ({ part, anchor, y, c });
const pat = (part, ...c) => ({ part, c });
const mo = (part, x, y, w, ...c) => ({ part, anchor: 'center', x, y, w, rot: 0, c });

export const RECIPE_TAGS = ['トレンド', 'シンプル', 'ガーリー', '韓国風', 'オフィス', '季節'];

export const RECIPES = [
  {
    id: 'r.french', name: 'フレンチ', tags: ['シンプル', 'オフィス'],
    base: base('base.solid', 1),
    layers: [edge('edge.french', 'tip', 34, 0)],
  },
  {
    id: 'r.french_line', name: 'フレンチ＋ライン', tags: ['オフィス'],
    base: base('base.solid', 1),
    layers: [edge('edge.french', 'tip', 34, 0), edge('edge.line', 'tip', 36, 6)],
  },
  {
    id: 'r.halfmoon', name: '逆フレンチ', tags: ['シンプル', '韓国風'],
    base: base('base.solid', 1),
    layers: [edge('edge.halfmoon', 'root', 32, 0)],
  },
  {
    id: 'r.one_stone', name: 'ワンカラー＋ストーン', tags: ['シンプル', 'オフィス'],
    base: base('base.solid', 0),
    layers: [mo('motif.stone', 50, -40, 15, 1, 1, 6)],
  },
  {
    id: 'r.grad_pearl', name: 'グラデ＋ストーン3粒', tags: ['韓国風'],
    base: base('base.grad_v', 1, 0),
    layers: [
      mo('motif.stone', 36, -34, 13, 1, 1, 6),
      mo('motif.stone', 50, -42, 16, 1, 1, 6),
      mo('motif.stone', 64, -34, 13, 1, 1, 6),
    ],
  },
  {
    id: 'r.lace_ribbon', name: 'レース×リボン', tags: ['ガーリー'],
    base: base('base.solid', 0),
    layers: [
      edge('edge.lace_french', 'tip', 34, 1, 0),
      mo('motif.ribbon', 50, -14, 44, 2, 5),
      mo('motif.ribbon', 50, 22, 44, 2, 5),
    ],
  },
  {
    id: 'r.cat', name: '猫', tags: ['ガーリー'],
    base: base('base.solid', 0),
    layers: [
      edge('edge.lace_french', 'tip', 40, 1, 0),
      mo('motif.cat', 50, 10, 54, 1, 5, 0),
      mo('motif.ribbon', 50, -30, 28, 0, 5),
    ],
  },
  {
    id: 'r.cat_tabby', name: 'トラ猫', tags: ['ガーリー'],
    base: base('base.solid', 0),
    layers: [
      edge('edge.lace_french', 'tip', 40, 1, 0),
      mo('motif.cat_tabby', 50, 10, 54, 7, 5, 0, 4),
      mo('motif.ribbon', 50, -30, 28, 2, 5),
    ],
  },
  {
    id: 'r.dot_french', name: 'ドット＋フレンチ', tags: ['ガーリー', 'シンプル'],
    base: base('base.solid', 1),
    layers: [pat('pattern.dot_s', 5), edge('edge.french', 'tip', 48, 0)],
  },
  {
    id: 'r.dot_line', name: 'ドット＋ダブルライン', tags: ['ガーリー'],
    base: base('base.solid', 0),
    layers: [pat('pattern.dot_s', 5), edge('edge.line_double', 'center', 0, 1)],
  },
  {
    id: 'r.dot_big', name: '大ドット', tags: ['ガーリー'],
    base: base('base.solid', 0),
    layers: [pat('pattern.dot_m', 1)],
  },
  {
    id: 'r.stripe_ribbon', name: 'ストライプ＋リボン', tags: ['ガーリー'],
    base: base('base.solid', 1),
    layers: [pat('pattern.stripe', 0), mo('motif.ribbon', 50, 6, 46, 3, 5)],
  },
  {
    id: 'r.music', name: '音符', tags: ['ガーリー'],
    base: base('base.solid', 4),
    layers: [
      mo('motif.note8', 36, -26, 28, 5),
      mo('motif.clef', 64, 10, 22, 3),
      mo('motif.heart', 34, 34, 15, 3),
    ],
  },
  {
    id: 'r.heart', name: 'ハート', tags: ['ガーリー', 'シンプル'],
    base: base('base.solid', 1),
    layers: [edge('edge.french', 'tip', 30, 0), mo('motif.heart', 50, -14, 30, 3)],
  },
  {
    id: 'r.flower', name: '小花', tags: ['ガーリー', '季節'],
    base: base('base.solid', 1),
    layers: [
      pat('pattern.dot_s', 0),
      mo('motif.flower', 38, -18, 32, 0, 4),
      mo('motif.flower', 62, 14, 26, 3, 4),
    ],
  },
  {
    id: 'r.star_night', name: '星空', tags: ['季節'],
    base: base('base.grad_v', 5, 6),
    layers: [
      mo('motif.star', 36, -30, 22, 4),
      mo('motif.star', 60, -8, 15, 1),
      mo('motif.star', 44, 22, 18, 4),
    ],
  },
  /* --- トレンド（2025秋〜2026冬の人気デザインを調べて足したもの） --- */
  {
    id: 'r.magnet', name: 'マグネット', tags: ['トレンド', '韓国風'],
    base: base('base.magnet'), layers: [],
  },
  {
    id: 'r.mirror_french', name: 'ミラーフレンチ', tags: ['トレンド'],
    base: base('base.solid', 1), layers: [edge('edge.mirror_tip', 'tip', 34)],
  },
  {
    id: 'r.bekko', name: 'べっ甲', tags: ['トレンド', '季節'],
    base: base('base.bekko'), layers: [],
  },
  {
    id: 'r.gemstone', name: '天然石', tags: ['トレンド', '韓国風'],
    base: base('base.gemstone'), layers: [],
  },
  {
    id: 'r.nuance_foil', name: 'ニュアンス＋金箔', tags: ['トレンド', '韓国風'],
    base: base('base.nuance'), layers: [pat('pattern.foil')],
  },
  {
    id: 'r.tiedye', name: 'タイダイ', tags: ['トレンド'],
    base: base('base.tiedye'), layers: [],
  },
  {
    id: 'r.skinny', name: 'スキニーフレンチ', tags: ['トレンド', 'オフィス'],
    base: base('base.solid', 1), layers: [edge('edge.skinny_french', 'tip', 30)],
  },
  {
    id: 'r.glitter_tip', name: 'ラメグラデ', tags: ['トレンド', 'シンプル'],
    base: base('base.solid', 0), layers: [pat('pattern.glitter_tip')],
  },
  {
    id: 'r.leopard', name: 'ヒョウ柄', tags: ['トレンド', '季節'],
    base: base('base.solid', 4), layers: [pat('pattern.leopard')],
  },
  {
    id: 'r.quilting', name: 'キルティング', tags: ['トレンド', '季節'],
    base: base('base.solid', 1), layers: [pat('pattern.quilting')],
  },
];

export function getRecipe(id) {
  return RECIPES.find(r => r.id === id) || null;
}

/** レシピが参照しているパーツがすべて存在するか（パーツを整理したときの取りこぼし検出用） */
export function validateRecipes(getPart) {
  const bad = [];
  for (const r of RECIPES) {
    const ids = [r.base.part].concat((r.layers || []).map(l => l.part));
    for (const id of ids) if (!getPart(id)) bad.push({ recipe: r.id, missing: id });
  }
  return bad;
}
