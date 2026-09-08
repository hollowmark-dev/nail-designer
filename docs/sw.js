/**
 * Service Worker — アプリシェルのオフラインキャッシュ。
 *
 * - このオリジン（GitHub Pages）には他のアプリも同居しうるので、
 *   キャッシュ名は必ず "nail-" 接頭辞を付け、削除もその接頭辞のものだけに限定する。
 * - 更新時はここの VERSION だけを書き換えれば、install で新しいキャッシュが作られ、
 *   activate で古い "nail-*" キャッシュだけが掃除される（他アプリのキャッシュには触れない）。
 * - すべてのURLは sw.js 自身からの相対パス（サブパス配信 = 相対パス解決に対応するため）。
 */

const VERSION = 'v2';
const CACHE_PREFIX = 'nail-';
const CACHE_NAME = CACHE_PREFIX + VERSION;

// アプリシェル一式。docs/js 以下を実走査して漏れがないことを確認済み（開発用の
// spike-export.html / preview-*.html は意図的に含めない）。
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/export.js',
  './js/fonts.js',
  './js/ink.js',
  './js/gestures.js',
  './js/model.js',
  './js/render.js',
  './js/store.js',
  './js/text.js',
  './js/update.js',
  './js/first-run.js',
  './js/parts/parts-extra-1.js',
  './js/parts/parts-extra-2.js',
  './js/parts/parts.js',
  './js/parts/recipes.js',
  './js/parts/sample.js',
  './js/parts/shapes.js',
  './js/views/view-editor.js',
  './js/views/view-export.js',
  './js/views/view-gallery.js',
  './icons/icon-192.png',
  './icons/apple-touch-icon.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // ここでは skipWaiting() を呼ばない。既存タブが動いている間は新しい SW を
  // waiting のまま留め、js/update.js 経由でユーザーが「更新」を押したときだけ
  // SKIP_WAITING メッセージで進める（強制切り替えで作業中の編集を壊さないため）。
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // 書き込み系はそのまま素通し

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 他オリジンは素通し（フォントCDN等を将来使っても壊さない）

  if (req.mode === 'navigate') {
    event.respondWith(handleNavigate(req));
    return;
  }

  event.respondWith(handleAsset(req));
});

// ページ遷移（画面の再読み込み・直リンク）は network-first。
// オフライン時だけキャッシュ済み index.html を返す（アプリはハッシュルータで
// 画面を切り替えるので、どのURLで開いても index.html を返せばよい）。
async function handleNavigate(req) {
  try {
    return await fetch(req);
  } catch (e) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match('./index.html');
    if (cached) return cached;
    return new Response('オフラインのため表示できません', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

// CSS/JS/アイコン等は cache-first。裏で最新版を取りに行ってキャッシュを更新しておく
// （次回起動時に反映される。表示中のタブを即差し替えたりはしない）。
async function handleAsset(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);

  const revalidate = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  if (cached) return cached;

  const fresh = await revalidate;
  if (fresh) return fresh;

  return new Response('', { status: 504, statusText: 'オフラインでキャッシュもありません' });
}
