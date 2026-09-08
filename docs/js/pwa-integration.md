# PWA化: 既存ファイルへの変更手順

このファイル自体はドキュメントで、コードには影響しません。
`docs/index.html` と `docs/js/app.js` は今回一切編集していません。以下をそのまま貼り付けてください。

新規に追加したファイル（貼り付け対象ではなく、既にリポジトリにあります）:
`docs/manifest.json` / `docs/sw.js` / `docs/js/update.js` / `docs/js/first-run.js`

---

## 1. `docs/index.html` の `<head>` に追記

`<title>ネイルデザイン</title>` の直後、`<link rel="stylesheet" href="css/style.css">` の前後どちらでも構いませんが、
わかりやすいよう `</head>` の直前に以下をまとめて追加してください（`theme-color` は既に1行目にあるので追加不要です）。

```html
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="mobile-web-app-capable" content="yes">
```

補足:

- `manifest.json` の `href` は相対パスなので、サブパス配信（`/nail_designer/`）でもそのまま動きます。絶対パス（`/manifest.json`）にしないでください。
- `apple-touch-icon` は本来 180x180 が推奨サイズですが、専用ファイルを増やさないため既存の `icons/icon-192.png`（私が別途生成するもの）を流用しています。気になる場合は後日 `icon-180.png` を足して差し替えてください。
- `apple-mobile-web-app-status-bar-style` は `default`（背景が薄いピンク `#fbf7f8` なので、黒文字の標準スタイルが見た目に合います）。

変更後の `<head>` は最終的にこうなります（差分のみ抜粋、既存行は変更なし）:

```html
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#fbf7f8">
<title>ネイルデザイン</title>
<link rel="stylesheet" href="css/style.css">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="mobile-web-app-capable" content="yes">
</head>
```

---

## 2. `docs/js/app.js` への追記

### 2-1. import を追加

既存の import 群（ファイル先頭）に2行足します。

```js
import * as store from './store.js';
import * as gallery from './views/view-gallery.js';
import * as editor from './views/view-editor.js';
import * as exporter from './views/view-export.js';
import { registerServiceWorker, applyUpdate } from './update.js';
import { showFirstRunNoticeIfNeeded } from './first-run.js';
```

### 2-2. 起動処理を追加

既存の末尾付近、`store.requestPersistentStorage();` の直後・`route();` の直前に、
以下をそのまま追加してください（`showUpdateBanner` 関数もこの位置にまとめて追加します）。

```js
// 端末にデータを消されにくくする。iOS Safari は非対応なので通らなくても続行する
store.requestPersistentStorage();

// 初回起動の注意書き（iOS のホーム画面追加、LINE等アプリ内ブラウザの制約、データ非送信）
showFirstRunNoticeIfNeeded();

// Service Worker 登録。GitHub Pages（*.github.io）以外では update.js 内部の判定により
// 何もしない（ローカル開発を cache-first で壊さないため）。
registerServiceWorker({ onUpdateReady: showUpdateBanner });

function showUpdateBanner() {
  if (document.getElementById('update-banner')) return; // 二重表示を防ぐ
  const bar = document.createElement('div');
  bar.id = 'update-banner';
  bar.className = 'toast'; // 既存の .toast の見た目（背景・角丸・fixed位置）を流用
  Object.assign(bar.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    // .toast は auto-hide 前提のクラスだが、この要素には toastTimer を使わないので消えない
  });
  bar.hidden = false;

  const label = document.createElement('span');
  label.textContent = '新しいバージョンがあります';
  bar.appendChild(label);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn primary sm'; // 既存の .btn.primary.sm をそのまま使う
  btn.textContent = '更新';
  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = '更新中…';
    applyUpdate();
    // 実際のリロードは update.js 側の controllerchange リスナーが行う
  });
  bar.appendChild(btn);

  document.body.appendChild(bar);
}

route();
```

`route();` は既存の最終行なので、上のコードブロックの最後の `route();` は「そのまま残す」という意味です
（重複して2回書かないでください）。

---

## 3. 動作確認のポイント（GitHub Pages 公開後）

- サブパス（`https://hollowmark-dev.github.io/nail_designer/`）で開いて、DevTools の Application タブで
  Service Worker が `nail_designer/sw.js` スコープで登録されていること、`manifest.json` の `start_url` /
  `icons` が解決できていることを確認してください。
- Android Chrome でしばらく使うと「ホーム画面に追加」の提案バナーが自動で出ます（manifest + SW + アイコンが揃って初めて出る仕様）。
- `sw.js` の `VERSION` を上げて再デプロイし、既にホーム画面に追加済みの端末で開き直すと
  「新しいバージョンがあります［更新］」のバナーが出ることを確認してください。
- README.md の「未確認（HTTPS でしか試せないもの）」に挙がっている `navigator.share` /
  `navigator.storage.persist()` / Service Worker の更新通知は、今回の変更で確認可能になります。
