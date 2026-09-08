/**
 * 書き出し。
 *
 * Blob は画面に入った時点で先に作っておく。
 * navigator.share はタップ直後でないと iOS で NotAllowedError になるため、
 * ボタン押下後に SVG 生成 → <img> 読み込み → toBlob と始めてはいけない。
 */

import * as store from '../store.js';
import { migrate } from '../model.js';
import { sheetPng, singlePng, downloadBlob, sharePng, canShareFiles, safeFileName } from '../export.js';

export async function open(root, id, api) {
  const raw = await store.getDesign(id);
  if (!raw) {
    root.innerHTML = '<div class="empty">作品が見つかりません</div>';
    setTimeout(() => api.go('#/'), 900);
    return () => {};
  }
  const design = migrate(raw);

  let mode = 'sheet';        // 'sheet' | 'single'
  let nailIdx = 0;
  let transparent = false;
  let outline = true;
  let blob = null;
  let objUrl = null;

  root.innerHTML = `
    <div class="bar">
      <button class="btn icon" data-act="back" aria-label="戻る">‹</button>
      <div class="grow"><span style="font-size:16px;font-weight:600">書き出し</span></div>
    </div>
    <div class="export-body">
      <div class="export-preview"><img id="prev" alt="プレビュー"></div>

      <div class="section-label">なにを出すか</div>
      <div class="chip-row">
        <button class="chip on" data-mode="sheet">10本シート</button>
        <button class="chip" data-mode="single">1本だけ</button>
        <select id="which" class="chip" hidden></select>
      </div>

      <div class="section-label">背景</div>
      <div class="chip-row">
        <button class="chip on" data-bg="white">白</button>
        <button class="chip" data-bg="none">透過</button>
        <button class="chip on" data-outline="1">輪郭線あり</button>
      </div>

      <div class="section-label">保存する</div>
      <div class="chip-row">
        <button class="btn primary" data-act="share" hidden>他のアプリへ送る</button>
        <button class="btn" data-act="save">画像を保存</button>
      </div>
      <p class="hint" id="hint">
        保存できないときは、上のプレビュー画像を長押しして保存してください。
      </p>
    </div>
  `;

  const img = root.querySelector('#prev');
  const which = root.querySelector('#which');
  const shareBtn = root.querySelector('[data-act="share"]');
  const hint = root.querySelector('#hint');

  which.innerHTML = design.nails.map((n, i) => `<option value="${i}">${i + 1}本目</option>`).join('');

  function fileName() {
    return safeFileName(design.name) + (mode === 'single' ? `-${nailIdx + 1}` : '') + '.png';
  }

  async function build() {
    hint.textContent = '画像を作っています…';
    try {
      blob = mode === 'sheet'
        ? await sheetPng(design, { transparent, outline })
        : await singlePng(design, nailIdx, { transparent, outline });
      if (objUrl) URL.revokeObjectURL(objUrl);
      objUrl = URL.createObjectURL(blob);
      img.src = objUrl;
      const kb = (blob.size / 1024).toFixed(0);
      const share = canShareFiles(blob, fileName());
      shareBtn.hidden = !share;
      hint.textContent = share
        ? `PNG ${kb}KB。保存できないときはプレビュー画像を長押ししてください。`
        : `PNG ${kb}KB。保存できないときはプレビュー画像を長押ししてください。`;
    } catch (e) {
      hint.textContent = '画像を作れませんでした: ' + (e.message || e);
      api.toast('書き出しに失敗しました', true);
    }
  }

  function onClick(e) {
    const m = e.target.closest('button[data-mode]');
    if (m) {
      mode = m.dataset.mode;
      root.querySelectorAll('button[data-mode]').forEach(b => b.classList.toggle('on', b === m));
      which.hidden = mode !== 'single';
      build();
      return;
    }
    const bg = e.target.closest('button[data-bg]');
    if (bg) {
      transparent = bg.dataset.bg === 'none';
      root.querySelectorAll('button[data-bg]').forEach(b => b.classList.toggle('on', b === bg));
      build();
      return;
    }
    const ol = e.target.closest('button[data-outline]');
    if (ol) {
      outline = !outline;
      ol.classList.toggle('on', outline);
      ol.textContent = outline ? '輪郭線あり' : '輪郭線なし';
      build();
      return;
    }
    const act = e.target.closest('button[data-act]');
    if (!act) return;
    if (act.dataset.act === 'back') { api.go('#/edit/' + design.id); return; }
    if (act.dataset.act === 'save') {
      if (!blob) return api.toast('まだ画像ができていません');
      downloadBlob(blob, fileName());
      return;
    }
    if (act.dataset.act === 'share') {
      if (!blob) return api.toast('まだ画像ができていません');
      // ここで新たに画像を作らない。作ってあるものをそのまま渡す
      sharePng(blob, fileName(), design.name).catch(err => {
        if (err && err.name === 'AbortError') return;
        api.toast('送れませんでした: ' + (err.message || err), true);
      });
    }
  }

  function onWhich() { nailIdx = +which.value; build(); }

  root.addEventListener('click', onClick);
  which.addEventListener('change', onWhich);

  await build();

  return () => {
    root.removeEventListener('click', onClick);
    which.removeEventListener('change', onWhich);
    if (objUrl) URL.revokeObjectURL(objUrl);
  };
}
