/**
 * 画面の切り替えと起動。画面は3つだけ（作品一覧 / エディタ / 書き出し）。
 */

import * as store from './store.js';
import * as gallery from './views/view-gallery.js';
import * as editor from './views/view-editor.js';
import * as exporter from './views/view-export.js';
import { registerServiceWorker, applyUpdate } from './update.js';
import { showFirstRunNoticeIfNeeded } from './first-run.js';

const viewEl = document.getElementById('view');
const toastEl = document.getElementById('toast');

let toastTimer = null;
function toast(msg, isError) {
  toastEl.textContent = msg;
  toastEl.className = 'toast' + (isError ? ' error' : '');
  toastEl.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, isError ? 5000 : 2200);
}

// 保存に失敗したら黙らずに出す（Safari のプライベートモードや容量不足で起きる）
store.setErrorHandler(msg => toast(msg, true));

const api = {
  toast,
  go(hash) { location.hash = hash; },
};

let cleanup = null;

async function route() {
  if (cleanup) { try { cleanup(); } catch (e) { /* noop */ } cleanup = null; }
  viewEl.innerHTML = '';

  const hash = location.hash || '#/';
  try {
    if (hash.startsWith('#/edit/')) {
      cleanup = await editor.open(viewEl, hash.slice('#/edit/'.length), api);
    } else if (hash.startsWith('#/export/')) {
      cleanup = await exporter.open(viewEl, hash.slice('#/export/'.length), api);
    } else {
      cleanup = await gallery.open(viewEl, api);
    }
  } catch (e) {
    console.error(e);
    viewEl.innerHTML = '<div class="empty">画面を開けませんでした<br>' + escapeHtml(String(e.message || e)) + '</div>';
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

window.addEventListener('hashchange', route);

// 端末にデータを消されにくくする。iOS Safari は非対応なので通らなくても続行する
store.requestPersistentStorage();

// 初回だけ出す注意書き（iOSのホーム画面追加、LINE等アプリ内ブラウザの制約、データは端末内だけ）
showFirstRunNoticeIfNeeded();

// Service Worker は GitHub Pages でのみ登録する（ローカル開発を cache-first で壊さないため）
registerServiceWorker({ onUpdateReady: showUpdateBanner });

/** 新しい版が来たことを知らせる。押すまで消さない（相手の端末が古いまま固まるのを防ぐ） */
function showUpdateBanner() {
  if (document.getElementById('update-banner')) return;
  const bar = document.createElement('div');
  bar.id = 'update-banner';
  bar.className = 'toast';
  bar.style.display = 'flex';
  bar.style.alignItems = 'center';
  bar.style.gap = '10px';
  bar.hidden = false;

  const label = document.createElement('span');
  label.textContent = '新しいバージョンがあります';
  bar.appendChild(label);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn primary sm';
  btn.textContent = '更新';
  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = '更新中…';
    applyUpdate();   // 実際のリロードは update.js の controllerchange 側で行う
  });
  bar.appendChild(btn);

  document.body.appendChild(bar);
}

route();
