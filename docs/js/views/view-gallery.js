/** 作品一覧。 */

import * as store from '../store.js';
import { newDesign, migrate, exportJson, importJson } from '../model.js';
import { sheetSvg } from '../render.js';
import { sampleDesign } from '../parts/sample.js';
import { downloadText, safeFileName } from '../export.js';

export async function open(root, api) {
  let designs = await store.listDesigns();

  // 初回起動は空の画面から始めさせない。作例をサンプルとして1つ入れる
  if (!designs.length) {
    const s = sampleDesign();
    if (await store.putDesign(s)) designs = [s];
  }

  root.innerHTML = `
    <div class="bar">
      <div class="grow"><span style="font-size:16px;font-weight:600">ネイルデザイン</span></div>
      <button class="btn sm" data-act="import">読込</button>
      <button class="btn sm" data-act="backup">保存</button>
      <button class="btn primary" data-act="new">新規</button>
    </div>
    <div class="gallery"><div class="gallery-grid" id="grid"></div></div>
    <input type="file" id="file" accept="application/json,.json" hidden>
  `;

  const grid = root.querySelector('#grid');
  const fileInput = root.querySelector('#file');

  function paintList() {
    if (!designs.length) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1">まだ作品がありません</div>';
      return;
    }
    grid.innerHTML = designs.map(d => `
      <div class="design-card" data-id="${d.id}">
        <div class="thumb">${sheetSvg(d, { scale: 1, bgColor: '#ffffff', outline: true })}</div>
        <div class="nm">${esc(d.name)}</div>
        <div class="dt">${fmt(d.updatedAt)}</div>
        <div class="row">
          <button class="btn sm" data-act="open" style="flex:1">開く</button>
          <button class="btn sm" data-act="dup">複製</button>
          <button class="btn sm" data-act="del">削除</button>
        </div>
      </div>`).join('');
  }
  paintList();

  async function onClick(e) {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const card = btn.closest('.design-card');
    const id = card && card.dataset.id;

    if (act === 'new') {
      const d = newDesign('無題 ' + (designs.length + 1));
      if (await store.putDesign(d)) api.go('#/edit/' + d.id);
      return;
    }
    if (act === 'backup') {
      if (!designs.length) return api.toast('保存する作品がありません');
      downloadText(exportJson(designs), 'nail-backup-' + stamp() + '.json');
      api.toast('バックアップを書き出しました');
      return;
    }
    if (act === 'import') { fileInput.click(); return; }

    if (!id) return;
    if (act === 'open') { api.go('#/edit/' + id); return; }
    if (act === 'dup') {
      const src = designs.find(x => x.id === id);
      const copy = migrate(JSON.parse(JSON.stringify(src)));
      copy.id = 'd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
      copy.name = src.name + ' のコピー';
      copy.updatedAt = Date.now();
      if (await store.putDesign(copy)) { designs.unshift(copy); paintList(); api.toast('複製しました'); }
      return;
    }
    if (act === 'del') {
      const src = designs.find(x => x.id === id);
      if (!confirm(`「${src ? src.name : ''}」を削除します。元に戻せません。`)) return;
      if (await store.deleteDesign(id)) {
        designs = designs.filter(x => x.id !== id);
        paintList();
        api.toast('削除しました');
      }
      return;
    }
  }

  async function onFile() {
    const f = fileInput.files && fileInput.files[0];
    if (!f) return;
    try {
      const list = importJson(await f.text());
      let n = 0;
      for (const d of list) if (await store.putDesign(d)) n++;
      designs = await store.listDesigns();
      paintList();
      api.toast(n + '件を読み込みました');
    } catch (e) {
      api.toast('読み込めませんでした: ' + (e.message || e), true);
    }
    fileInput.value = '';
  }

  root.addEventListener('click', onClick);
  fileInput.addEventListener('change', onFile);

  return () => {
    root.removeEventListener('click', onClick);
    fileInput.removeEventListener('change', onFile);
  };
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function fmt(t) {
  if (!t) return '';
  const d = new Date(t);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function stamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}
