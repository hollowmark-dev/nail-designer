/**
 * エディタ。10本ストリップ + 拡大キャンバス + ツールタブ。
 *
 * ストリップ10本を毎回作り直さない。編集中の1本だけ描き直す
 * （10本ぶんの SVG を毎操作で再生成すると低スペック端末が引っかかる）。
 */

import * as store from '../store.js';
import {
  migrate, touch, addLayer, removeLayer, duplicateLayer, moveLayer,
  setLayerPos, createHistory, PALETTE_PRESETS,
  applyToAll, mirrorHands, applyBaseToAll, applyToAllExceptAccent, applyRecipe,
  addTextLayer, addInkLayer, FINGERS, ACCENT_INDEXES,
} from '../model.js';
import { FONTS, ensureFontsLoaded, MIN_SIZE } from '../text.js';
import { simplify, toPath, normalize, pathBBox, PEN_WIDTHS, DEFAULT_PEN } from '../ink.js';
import { nailInner, nailSvg, layerBox, partThumbSvg, recipeThumbSvg } from '../render.js';
import { getPart, listByCat, allTags } from '../parts/parts.js';
import { RECIPES, RECIPE_TAGS } from '../parts/recipes.js';
import { SHAPES, LENGTHS, nailHeight } from '../parts/shapes.js';
import { attachGestures, selectionMarkup } from '../gestures.js';

const TABS = [
  { key: 'recipe',  label: 'テンプレ' },
  { key: 'shape',   label: '形' },
  { key: 'base',    label: 'ベース' },
  { key: 'edge',    label: '縁' },
  { key: 'pattern', label: '柄' },
  { key: 'motif',   label: 'パーツ' },
  { key: 'text',    label: '文字' },
  { key: 'ink',     label: 'ペン' },
  { key: 'color',   label: '色' },
  { key: 'bulk',    label: '10本' },
];

const TEXT_SIZES = [{ label: '小', v: 18 }, { label: '中', v: 26 }, { label: '大', v: 36 }];

export async function open(root, id, api) {
  const raw = await store.getDesign(id);
  if (!raw) {
    root.innerHTML = '<div class="empty">作品が見つかりません</div>';
    setTimeout(() => api.go('#/'), 900);
    return () => {};
  }

  let design = migrate(raw);
  let nailIdx = 0;
  let selType = 'none';      // 'none' | 'base' | 'layer'
  let selIdx = -1;
  let tab = 'recipe';
  let slot = 0;              // 色タブで編集中の色スロット
  const tagFilter = {};      // カテゴリごとの絞り込みタグ（未指定なら全部）
  const textDraft = { s: 'A', font: 'script', size: 26, outline: true, colorSlot: 3 };
  const pen = { sw: DEFAULT_PEN.sw, colorSlot: DEFAULT_PEN.colorSlot };
  let penPreview = '';       // 描画中のストローク（確定前）
  const history = createHistory(design);

  ensureFontsLoaded(FONTS.map(f => f.id));   // 画面表示用。書き出しは render 側で埋め込む

  root.innerHTML = `
    <div class="bar">
      <button class="btn icon" data-act="back" aria-label="戻る">‹</button>
      <div class="grow"><input class="title-input" id="title" value=""></div>
      <button class="btn icon" data-act="undo" aria-label="元に戻す">↺</button>
      <button class="btn icon" data-act="redo" aria-label="やり直す">↻</button>
      <button class="btn icon" data-act="focus" aria-label="作業スペースを広げる" title="作業スペースを広げる">⤢</button>
      <button class="btn primary" data-act="export">書出</button>
    </div>
    <div class="strip" id="strip"></div>
    <div class="canvas-wrap">
      <svg id="canvas" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 155"></svg>
      <div class="zoom-level" id="zoomLevel" hidden></div>
      <div class="zoom-bar">
        <button data-act="zoomin" aria-label="拡大">＋</button>
        <button data-act="zoomout" aria-label="縮小">－</button>
        <button data-act="zoomreset" aria-label="等倍に戻す">⌂</button>
      </div>
    </div>
    <div class="layer-actions" id="actions"></div>
    <div class="tools">
      <div class="tabs" id="tabs"></div>
      <div class="tool-body" id="toolBody"></div>
    </div>
  `;

  const titleEl = root.querySelector('#title');
  const stripEl = root.querySelector('#strip');
  const canvas = root.querySelector('#canvas');
  const actionsEl = root.querySelector('#actions');
  const tabsEl = root.querySelector('#tabs');
  const bodyEl = root.querySelector('#toolBody');
  const zoomLevelEl = root.querySelector('#zoomLevel');

  titleEl.value = design.name;

  /* ---------------- 作業スペース（ズームと集中モード） ---------------- */

  // 爪は小さいので、指で文字を書いたり細かい線を引くには拡大が要る。
  // 拡大して大きく描いても、データは爪の座標系のままなので小さく載る。
  const ZOOM_MIN = 1, ZOOM_MAX = 5;
  const view = { z: 1, tx: 0, ty: 0 };

  function applyZoom() {
    canvas.style.transform = view.z === 1 ? '' : `translate(${view.tx}px, ${view.ty}px) scale(${view.z})`;
    zoomLevelEl.hidden = view.z === 1;
    zoomLevelEl.textContent = `${view.z.toFixed(1)}倍`;
    root.querySelector('[data-act="zoomin"]').disabled = view.z >= ZOOM_MAX - 0.01;
    root.querySelector('[data-act="zoomout"]').disabled = view.z <= ZOOM_MIN + 0.01;
    root.querySelector('[data-act="zoomreset"]').disabled = view.z === 1;
  }

  function setZoom(z, tx, ty) {
    view.z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    if (view.z === 1) { view.tx = 0; view.ty = 0; }
    else { view.tx = tx; view.ty = ty; }
    applyZoom();
  }

  function stepZoom(mul) {
    // ボタンでの拡大は中心を保つ（パンは指2本のときだけ）
    setZoom(view.z * mul, view.tx * mul, view.ty * mul);
  }

  /* ---------------- 保存（自動・debounce 500ms） ---------------- */
  let saveTimer = null;
  function save() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveTimer = null; store.putDesign(touch(design)); }, 500);
  }
  function saveNow() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    return store.putDesign(touch(design));
  }

  /** 変更を確定する（履歴に積んで保存し、ストリップの当該1本を描き直す） */
  function commit() {
    history.push(design);
    save();
    paintStripOne(nailIdx);
    paintHeader();
  }

  /* ---------------- 描画 ---------------- */

  let rafId = 0;
  function paintCanvasSoon() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => { rafId = 0; paintCanvas(); });
  }

  function paintCanvas() {
    const nail = design.nails[nailIdx];
    const h = nailHeight(nail.length || design.length);
    canvas.setAttribute('viewBox', `0 0 100 ${h}`);
    const { markup } = nailInner(design, nailIdx, { interactive: true, outline: true, uid: 'cv_' });
    const box = (selType === 'layer' && tab !== 'ink') ? layerBox(design, nailIdx, selIdx) : null;
    canvas.innerHTML = markup + penPreview + selectionMarkup(box);
  }

  function paintStrip() {
    stripEl.innerHTML = design.nails.map((n, i) =>
      `<button data-nail="${i}" class="${i === nailIdx ? 'on' : ''}">${cell(i)}</button>`).join('');
  }
  function paintStripOne(i) {
    const b = stripEl.querySelector(`button[data-nail="${i}"]`);
    if (b) b.innerHTML = cell(i);
  }
  /** 上段が左手、下段が右手。どちらも親指→小指。指名を出しておくと「薬指だけ別」が伝わる */
  function cell(i) {
    return thumb(i)
      + `<span class="fg"><span class="hand">${i < 5 ? '左' : '右'}</span>${FINGERS[i % 5]}</span>`;
  }
  function thumb(i) {
    return nailSvg(design, i, { scale: 1, outline: true });
  }
  function markStrip() {
    stripEl.querySelectorAll('button[data-nail]').forEach(b => {
      b.classList.toggle('on', +b.dataset.nail === nailIdx);
    });
  }

  function paintHeader() {
    root.querySelector('[data-act="undo"]').disabled = !history.canUndo();
    root.querySelector('[data-act="redo"]').disabled = !history.canRedo();
  }

  function paintActions() {
    if (selType !== 'layer') { actionsEl.innerHTML = ''; actionsEl.style.display = 'none'; return; }
    const layer = design.nails[nailIdx].layers[selIdx];
    actionsEl.style.display = '';
    actionsEl.innerHTML =
      `<span class="name">${esc(layerName(layer))}</span>` +
      `<button class="btn sm" data-act="back1">後ろへ</button>` +
      `<button class="btn sm" data-act="front1">前へ</button>` +
      `<button class="btn sm" data-act="dup">複製</button>` +
      `<button class="btn sm" data-act="del">削除</button>`;
  }

  function paintTabs() {
    tabsEl.innerHTML = TABS.map(t =>
      `<button data-tab="${t.key}" class="${t.key === tab ? 'on' : ''}">${t.label}</button>`).join('');
  }

  function paintTools() {
    if (tab === 'recipe') return paintRecipeTab();
    if (tab === 'shape') return paintShapeTab();
    if (tab === 'color') return paintColorTab();
    if (tab === 'bulk') return paintBulkTab();
    if (tab === 'text') return paintTextTab();
    if (tab === 'ink') return paintInkTab();
    paintPartsTab(tab);
  }

  function swatchRow(name, current) {
    return `<div class="swatches">` + design.palette.map((c, i) =>
      `<button class="swatch ${i === current ? 'on' : ''}" data-${name}="${i}" style="background:${c}"></button>`
    ).join('') + `</div>`;
  }

  function paintTextTab() {
    bodyEl.innerHTML =
      `<div class="section-label">入れる文字（イニシャルや短い単語）</div>` +
      `<div class="chip-row">` +
      `<input id="textInput" class="chip" style="min-width:120px;text-align:center" maxlength="12" value="${esc(textDraft.s)}">` +
      `<button class="btn primary sm" data-act="addtext">爪に置く</button></div>` +
      `<div class="section-label">書体</div><div class="chip-row">` +
      FONTS.map(f => `<button class="chip ${textDraft.font === f.id ? 'on' : ''}" data-font="${f.id}"` +
        ` style="font-family:'${f.family}',serif">${esc(f.name)}</button>`).join('') +
      `</div>` +
      `<div class="section-label">大きさ</div><div class="chip-row">` +
      TEXT_SIZES.map(s => `<button class="chip ${textDraft.size === s.v ? 'on' : ''}" data-tsize="${s.v}">${s.label}</button>`).join('') +
      `<button class="chip ${textDraft.outline ? 'on' : ''}" data-act="toutline">縁取り</button>` +
      `</div>` +
      `<div class="section-label">色</div>` + swatchRow('tcolor', textDraft.colorSlot) +
      `<p class="hint">日本語も入れられますが、書体は端末の標準フォントになります。</p>`;
  }

  function paintInkTab() {
    const inkCount = design.nails[nailIdx].layers.filter(l => l.type === 'ink').length;
    bodyEl.innerHTML =
      `<div class="section-label">爪の上を指でなぞると線が引けます</div>` +
      `<div class="chip-row">` +
      PEN_WIDTHS.map((w, i) => `<button class="chip ${pen.sw === w ? 'on' : ''}" data-pw="${w}">` +
        `<span style="display:inline-block;width:22px;height:${Math.round(w * 1.6)}px;` +
        `border-radius:9px;vertical-align:middle;background:${design.palette[pen.colorSlot] || '#000'}"></span>` +
        ` ${['細', '中', '太'][i]}</button>`).join('') +
      `<button class="chip" data-act="undoink"${inkCount ? '' : ' disabled'}>最後の線を消す</button>` +
      `</div>` +
      `<div class="section-label">色</div>` + swatchRow('pcolor', pen.colorSlot) +
      `<p class="hint">このタブを開いている間だけ描画モードです。ほかのタブに移ると通常の選択に戻ります。</p>`;
  }

  /** タグの絞り込みチップ。パーツが増えても探せるようにする */
  function tagChips(cat, tags) {
    if (!tags.length) return '';
    const cur = tagFilter[cat] || '';
    return `<div class="chip-row" style="margin-bottom:8px">` +
      `<button class="chip sm ${cur ? '' : 'on'}" data-tag="" data-tagcat="${cat}">すべて</button>` +
      tags.map(t => `<button class="chip sm ${cur === t ? 'on' : ''}" data-tag="${esc(t)}" data-tagcat="${cat}">${esc(t)}</button>`).join('') +
      `</div>`;
  }

  function paintRecipeTab() {
    const cur = tagFilter.recipe || '';
    const list = RECIPES.filter(r => !cur || (r.tags || []).includes(cur));
    bodyEl.innerHTML =
      tagChips('recipe', RECIPE_TAGS) +
      `<div class="section-label">タップで1本まるごと置きかえ（そのあと微調整できます）</div>` +
      `<div class="part-grid">` +
      list.map(r =>
        `<button data-recipe="${r.id}">${recipeThumbSvg(r, design.palette, { px: 40 })}` +
        `<div class="cap">${esc(r.name)}</div></button>`).join('') +
      `</div>`;
  }

  function paintBulkTab() {
    const accent = ACCENT_INDEXES.map(i => (i < 5 ? '上段' : '下段') + FINGERS[i % 5]).join('・');
    bodyEl.innerHTML =
      `<div class="section-label">いま選んでいる ${nailIdx < 5 ? '上段' : '下段'}${FINGERS[nailIdx % 5]} を使って</div>` +
      `<div class="chip-row">` +
      `<button class="chip" data-bulk="all">10本すべてに流し込む</button>` +
      `<button class="chip" data-bulk="accent">薬指以外に流し込む</button>` +
      `<button class="chip" data-bulk="base">地の色だけ全部に</button>` +
      `</div>` +
      `<div class="section-label">左右の手</div>` +
      `<div class="chip-row"><button class="chip" data-bulk="mirror">上段を反転して下段へ</button></div>` +
      `<p class="hint" style="margin-top:10px">薬指＝${accent}。上段が左手、下段が右手（どちらも親指→小指）。<br>` +
      `間違えたら左上の ↺ で戻せます。</p>`;
  }

  function paintShapeTab() {
    bodyEl.innerHTML =
      `<div class="section-label">爪の形（10本すべてに適用）</div>` +
      `<div class="chip-row">` +
      Object.keys(SHAPES).map(k =>
        `<button class="chip ${design.shape === k ? 'on' : ''}" data-shape="${k}">${SHAPES[k].label}</button>`).join('') +
      `</div>` +
      `<div class="section-label">長さ</div>` +
      `<div class="chip-row">` +
      Object.keys(LENGTHS).map(k =>
        `<button class="chip ${design.length === k ? 'on' : ''}" data-length="${k}">${LENGTHS[k].label}</button>`).join('') +
      `</div>`;
  }

  function paintPartsTab(cat) {
    const nail = design.nails[nailIdx];
    const current = cat === 'base' ? nail.base.part : null;
    const cur = tagFilter[cat] || '';
    const list = listByCat(cat, cur);
    bodyEl.innerHTML =
      tagChips(cat, allTags(cat)) +
      `<div class="part-grid">` +
      list.map(p =>
        `<button data-part="${p.id}" class="${p.id === current ? 'on' : ''}">` +
        partThumbSvg(p.id, design.palette, { px: 40 }) +
        `<div class="cap">${esc(p.name)}</div></button>`).join('') +
      `</div>` +
      (list.length ? '' : `<div class="empty" style="padding:16px">このタグのパーツはありません</div>`);
  }

  function paintColorTab() {
    const nail = design.nails[nailIdx];
    const holder = selType === 'layer' ? nail.layers[selIdx] : nail.base;
    const part = holder && getPart(holder.part);
    const slots = holder && holder.type === 'text' ? 2
                : holder && holder.type === 'ink' ? 1
                : (part ? (part.slots || 1) : 0);
    if (slot >= slots) slot = 0;

    let html = '';
    if (slots) {
      html += `<div class="section-label">${esc(layerName(holder))}の色${slots > 1 ? '（どこを塗るか選ぶ）' : ''}</div>`;
      html += `<div class="chip-row">` +
        Array.from({ length: slots }, (_, i) => {
          const c = design.palette[(holder.c || [])[i]] || '#ccc';
          return `<button class="chip ${i === slot ? 'on' : ''}" data-slot="${i}">` +
                 `<span style="display:inline-block;width:13px;height:13px;border-radius:4px;vertical-align:-2px;` +
                 `border:1px solid rgba(0,0,0,.15);background:${c}"></span> ${slotLabel(part, i)}</button>`;
        }).join('') + `</div>`;
    }
    html += `<div class="section-label">パレット（タップで塗る／長押しで色そのものを変える）</div>`;
    html += `<div class="swatches">` +
      design.palette.map((c, i) =>
        `<button class="swatch" data-color="${i}" style="background:${c}">` +
        `<input type="color" value="${c}" data-edit="${i}"></button>`).join('') +
      `</div>`;
    html += `<div class="section-label">配色セット</div><div class="chip-row">` +
      PALETTE_PRESETS.map((p, i) => `<button class="chip" data-preset="${i}">${esc(p.name)}</button>`).join('') +
      `</div>`;
    bodyEl.innerHTML = html;
  }

  /** 選択中のものの表示名。文字と手書きはパーツを持たない */
  function layerName(layer) {
    if (!layer) return '';
    if (layer.type === 'text') return `文字「${layer.s}」`;
    if (layer.type === 'ink') return '手書き';
    const p = getPart(layer.part);
    return p ? p.name : '';
  }

  function slotLabel(part, i) {
    if (!part) return ['文字', '縁取り'][i] || '色';
    const names = {
      'motif.ribbon': ['本体', '線'],
      'motif.cat': ['顔', '線', '鼻・ほお'],
      'motif.cat_tabby': ['顔', '線', '鼻・ほお', '縞'],
      'motif.flower': ['花びら', '中心'],
      'motif.stone': ['ハイライト', '中間', '影'],
      'edge.lace_scallop': ['レース', 'トリム'],
      'base.grad_v': ['上', '下'],
      'base.grad_h': ['左', '右'],
    };
    const n = names[part.id];
    return n && n[i] ? n[i] : (part.slots > 1 ? '色' + (i + 1) : '色');
  }

  /* ---------------- 選択 ---------------- */

  function select(type, idx) {
    selType = type; selIdx = idx;
    if (type === 'layer' || type === 'base') slot = 0;
    paintCanvas();
    paintActions();
    if (tab === 'color') paintColorTab();
  }

  /* ---------------- 操作 ---------------- */

  const detach = attachGestures(canvas, {
    getSelected: () => (selType === 'layer' ? selIdx : -1),
    getBox: (i) => layerBox(design, nailIdx, i),
    onSelect: (i) => { if (i < 0) select('base', -1); else select('layer', i); },
    onMove: (i, x, y) => { setLayerPos(design, nailIdx, i, x, y); paintCanvasSoon(); },
    onTransform: (i, w, rot) => {
      const l = design.nails[nailIdx].layers[i];
      if (!l) return;
      l.w = Math.round(w * 10) / 10;
      l.rot = Math.round(rot * 10) / 10;
      paintCanvasSoon();
    },
    onCommit: commit,
    onLongPress: (i, cx, cy) => openMenu(i, cx, cy),

    getMode: () => (tab === 'ink' ? 'pen' : 'select'),
    getZoom: () => ({ z: view.z, tx: view.tx, ty: view.ty }),
    setZoom,
    onPenMove: (points) => {
      const d = toPath(simplify(points));
      const color = design.palette[pen.colorSlot] || '#000';
      penPreview = `<path d="${d}" fill="none" stroke="${color}" stroke-width="${pen.sw}"`
                 + ` stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>`;
      paintCanvasSoon();
    },
    onPenCancel: () => { penPreview = ''; paintCanvasSoon(); },
    onPenEnd: (points) => {
      penPreview = '';
      if (!points || points.length < 2) { paintCanvas(); return; }
      const raw = toPath(simplify(points));
      const [minX, minY, maxX, maxY] = pathBBox(raw);
      const { d, box } = normalize(raw);
      const h = nailHeight(design.nails[nailIdx].length || design.length);
      const at = addInkLayer(design, nailIdx, { d, box }, {
        sw: pen.sw, c: [pen.colorSlot],
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2 - h / 2,   // anchor は center なので中心からのずれで持つ
      });
      selType = 'layer'; selIdx = at;
      commit();
      paintCanvas();
      paintInkTab();
    },
  });

  let menuEls = null;
  function closeMenu() {
    if (!menuEls) return;
    menuEls.forEach(e => e.remove());
    menuEls = null;
  }
  function openMenu(layerIdx, clientX, clientY) {
    closeMenu();
    select('layer', layerIdx);
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    const menu = document.createElement('div');
    menu.className = 'popmenu';
    menu.innerHTML = `<button data-m="dup">複製</button><button data-m="del">削除</button>`;
    document.body.append(scrim, menu);
    const r = menu.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(innerWidth - r.width - 8, clientX - r.width / 2)) + 'px';
    menu.style.top = Math.max(8, Math.min(innerHeight - r.height - 8, clientY - r.height - 12)) + 'px';
    scrim.addEventListener('pointerdown', closeMenu);
    menu.addEventListener('click', e => {
      const m = e.target.closest('button[data-m]');
      if (!m) return;
      if (m.dataset.m === 'dup') {
        const at = duplicateLayer(design, nailIdx, layerIdx);
        if (at >= 0) { select('layer', at); commit(); }
      } else {
        removeLayer(design, nailIdx, layerIdx);
        select('base', -1);
        commit();
      }
      closeMenu();
    });
    menuEls = [scrim, menu];
  }

  /* ---------------- イベント ---------------- */

  function onClick(e) {
    const nailBtn = e.target.closest('button[data-nail]');
    if (nailBtn) {
      nailIdx = +nailBtn.dataset.nail;
      select('base', -1);
      markStrip();
      paintTools();
      return;
    }

    const tabBtn = e.target.closest('button[data-tab]');
    if (tabBtn) { tab = tabBtn.dataset.tab; paintTabs(); paintTools(); paintCanvas(); return; }

    const tagBtn = e.target.closest('button[data-tag]');
    if (tagBtn) { tagFilter[tagBtn.dataset.tagcat] = tagBtn.dataset.tag; paintTools(); return; }

    const recipeBtn = e.target.closest('button[data-recipe]');
    if (recipeBtn) {
      const r = RECIPES.find(x => x.id === recipeBtn.dataset.recipe);
      if (r) { applyRecipe(design, nailIdx, r); select('base', -1); commit(); }
      return;
    }

    const bulkBtn = e.target.closest('button[data-bulk]');
    if (bulkBtn) {
      switch (bulkBtn.dataset.bulk) {
        case 'all':    applyToAll(design, nailIdx); break;
        case 'accent': applyToAllExceptAccent(design, nailIdx); break;
        case 'base':   applyBaseToAll(design, nailIdx); break;
        case 'mirror': mirrorHands(design); break;
      }
      select('base', -1);
      afterGlobalChange();
      api.toast('10本に反映しました（↺ で戻せます）');
      return;
    }

    const partBtn = e.target.closest('button[data-part]');
    if (partBtn) {
      const pid = partBtn.dataset.part;
      const at = addLayer(design, nailIdx, pid);
      if (at >= 0) select('layer', at); else select('base', -1);
      commit();
      paintTools();
      return;
    }

    const shapeBtn = e.target.closest('button[data-shape]');
    if (shapeBtn) { design.shape = shapeBtn.dataset.shape; afterGlobalChange(); return; }

    const lenBtn = e.target.closest('button[data-length]');
    if (lenBtn) { design.length = lenBtn.dataset.length; afterGlobalChange(); return; }

    const slotBtn = e.target.closest('button[data-slot]');
    if (slotBtn) { slot = +slotBtn.dataset.slot; paintColorTab(); return; }

    const colorBtn = e.target.closest('button[data-color]');
    if (colorBtn) {
      const ci = +colorBtn.dataset.color;
      const nail = design.nails[nailIdx];
      const holder = selType === 'layer' ? nail.layers[selIdx] : nail.base;
      if (holder) {
        if (!Array.isArray(holder.c)) holder.c = [];
        holder.c[slot] = ci;
        paintCanvas(); commit(); paintColorTab();
      }
      return;
    }

    const fontBtn = e.target.closest('button[data-font]');
    if (fontBtn) { textDraft.font = fontBtn.dataset.font; paintTextTab(); return; }

    const tsizeBtn = e.target.closest('button[data-tsize]');
    if (tsizeBtn) { textDraft.size = Math.max(MIN_SIZE, +tsizeBtn.dataset.tsize); paintTextTab(); return; }

    const tcolorBtn = e.target.closest('button[data-tcolor]');
    if (tcolorBtn) { textDraft.colorSlot = +tcolorBtn.dataset.tcolor; paintTextTab(); return; }

    const pwBtn = e.target.closest('button[data-pw]');
    if (pwBtn) { pen.sw = +pwBtn.dataset.pw; paintInkTab(); return; }

    const pcolorBtn = e.target.closest('button[data-pcolor]');
    if (pcolorBtn) { pen.colorSlot = +pcolorBtn.dataset.pcolor; paintInkTab(); return; }

    const presetBtn = e.target.closest('button[data-preset]');
    if (presetBtn) {
      design.palette = PALETTE_PRESETS[+presetBtn.dataset.preset].colors.slice();
      afterGlobalChange();
      return;
    }

    const act = e.target.closest('button[data-act]');
    if (!act) return;
    switch (act.dataset.act) {
      case 'zoomin': stepZoom(1.4); break;
      case 'zoomout': stepZoom(1 / 1.4); break;
      case 'zoomreset': setZoom(1, 0, 0); break;
      case 'focus': {
        const on = root.classList.toggle('focus');
        act.classList.toggle('primary', on);
        api.toast(on ? '作業スペースを広げました（もう一度押すと戻ります）' : '通常の表示に戻しました');
        break;
      }
      case 'back': saveNow().then(() => api.go('#/')); break;
      case 'export': saveNow().then(() => api.go('#/export/' + design.id)); break;
      case 'undo': applyHistory(history.undo()); break;
      case 'redo': applyHistory(history.redo()); break;
      case 'del':
        removeLayer(design, nailIdx, selIdx); select('base', -1); commit(); break;
      case 'dup': {
        const at = duplicateLayer(design, nailIdx, selIdx);
        if (at >= 0) select('layer', at);
        commit(); break;
      }
      case 'front1': selIdx = moveLayer(design, nailIdx, selIdx, 1); select('layer', selIdx); commit(); break;
      case 'back1': selIdx = moveLayer(design, nailIdx, selIdx, -1); select('layer', selIdx); commit(); break;

      case 'toutline': textDraft.outline = !textDraft.outline; paintTextTab(); break;
      case 'addtext': {
        const input = root.querySelector('#textInput');
        const s = (input && input.value || '').trim();
        if (!s) { api.toast('入れる文字を書いてください'); break; }
        textDraft.s = s;
        const at = addTextLayer(design, nailIdx, s, {
          font: textDraft.font, size: textDraft.size, outline: textDraft.outline,
          c: [textDraft.colorSlot, 1],
        });
        select('layer', at);
        commit();
        break;
      }
      case 'undoink': {
        const layers = design.nails[nailIdx].layers;
        for (let i = layers.length - 1; i >= 0; i--) {
          if (layers[i].type === 'ink') { layers.splice(i, 1); break; }
        }
        select('base', -1);
        commit();
        paintInkTab();
        break;
      }
    }
  }

  /** 形・長さ・パレットのように10本すべてに効く変更 */
  function afterGlobalChange() {
    save();
    history.push(design);
    paintStrip();
    paintCanvas();
    paintTools();
    paintHeader();
  }

  function applyHistory(state) {
    if (!state) return;
    design = state;
    if (selIdx >= (design.nails[nailIdx].layers || []).length) select('base', -1);
    titleEl.value = design.name;
    paintStrip(); paintCanvas(); paintActions(); paintTools(); paintHeader();
    save();
  }

  // パレットの色そのものを変える（swatch に重ねた input[type=color]）
  function onColorInput(e) {
    const inp = e.target.closest('input[data-edit]');
    if (!inp) return;
    design.palette[+inp.dataset.edit] = inp.value;
    save();
    paintStrip(); paintCanvas();
    inp.closest('.swatch').style.background = inp.value;
  }
  function onColorCommit(e) {
    if (!e.target.closest('input[data-edit]')) return;
    history.push(design);
    paintTools(); paintHeader();
  }

  function onTitle() {
    design.name = titleEl.value || '無題';
    save();
  }

  root.addEventListener('click', onClick);
  bodyEl.addEventListener('input', onColorInput);
  bodyEl.addEventListener('change', onColorCommit);
  titleEl.addEventListener('input', onTitle);

  paintStrip(); paintTabs(); paintTools(); paintActions(); paintCanvas(); paintHeader();
  applyZoom();
  select('base', -1);

  return () => {
    detach();
    closeMenu();
    if (rafId) cancelAnimationFrame(rafId);
    root.removeEventListener('click', onClick);
    bodyEl.removeEventListener('input', onColorInput);
    bodyEl.removeEventListener('change', onColorCommit);
    titleEl.removeEventListener('input', onTitle);
    saveNow();
  };
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
