/**
 * 初回起動の案内。
 *
 * 実機検証（README.md 参照）で分かった制約を、使い始める前にひとこと伝える:
 *   - iOS は Safari で開いた場合とホーム画面追加後とでデータが別扱いになる
 *   - LINE 等のアプリ内ブラウザはデータが消えやすく、ホーム画面にも追加できない
 *   - データは端末内だけに保存され、サーバーには送られない
 *
 * localStorage に既読フラグを持ち、2回目以降は出さない。
 * localStorage が例外を投げる環境（Safari プライベートモード等）では、
 * フラグの読み書きは諦めて表示だけは行う（try/catch で包む）。
 */

const FLAG_KEY = 'nail_designer:first_run_notice_seen';

function hasSeenNotice() {
  try {
    return localStorage.getItem(FLAG_KEY) === '1';
  } catch (e) {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(FLAG_KEY, '1');
  } catch (e) {
    // 保存できない環境。次回また出るだけなので無視してよい。
  }
}

function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /Line\//.test(ua) || /FBAN/.test(ua) || /FBAV/.test(ua) || /Instagram/.test(ua);
}

export function showFirstRunNoticeIfNeeded() {
  if (hasSeenNotice()) return;

  const inApp = isInAppBrowser();
  const overlay = buildOverlay(inApp);
  document.body.appendChild(overlay);
}

function buildOverlay(inApp) {
  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(42, 34, 38, 0.45)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: '1000',
    padding: '0',
  });

  const sheet = document.createElement('div');
  Object.assign(sheet.style, {
    width: '100%',
    maxWidth: '480px',
    background: 'var(--card, #ffffff)',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    padding: '18px 18px calc(18px + env(safe-area-inset-bottom, 0px))',
    boxSizing: 'border-box',
    boxShadow: '0 -4px 24px rgba(42, 34, 38, 0.18)',
    color: 'var(--ink, #2a2226)',
    fontSize: '14px',
    lineHeight: '1.6',
  });

  const heading = document.createElement('div');
  heading.textContent = 'はじめに';
  Object.assign(heading.style, {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '10px',
  });
  sheet.appendChild(heading);

  const items = [];

  if (inApp) {
    items.push({
      text: 'このアプリ内ブラウザ（LINEなど）で開いていると、データが消えやすく、ホーム画面にも追加できません。右上のメニューなどから Safari か Chrome で開き直してください。',
      warn: true,
    });
  }

  items.push({
    text: 'iOS では、Safari で開いたときとホーム画面に追加したアプリとで保存データが別扱いになります。先にホーム画面に追加してから使ってください。',
    warn: false,
  });

  if (!inApp) {
    items.push({
      text: 'LINE などのアプリ内ブラウザで開くとデータが消えやすく、ホーム画面にも追加できません。Safari か Chrome で開いてください。',
      warn: false,
    });
  }

  items.push({
    text: '作ったデザインはこの端末の中だけに保存されます。サーバーには送られません。',
    warn: false,
  });

  const list = document.createElement('div');
  Object.assign(list.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px',
  });

  items.forEach(({ text, warn }) => {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-start',
      padding: warn ? '10px' : '0',
      background: warn ? 'var(--accent-soft, #fdeef2)' : 'transparent',
      borderRadius: warn ? '10px' : '0',
      color: warn ? 'var(--accent, #e8607f)' : 'inherit',
      fontWeight: warn ? '600' : 'normal',
    });

    const mark = document.createElement('span');
    mark.textContent = warn ? '!' : '・';
    Object.assign(mark.style, { flex: 'none' });
    row.appendChild(mark);

    const body = document.createElement('span');
    body.textContent = text;
    row.appendChild(body);

    list.appendChild(row);
  });

  sheet.appendChild(list);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = 'わかった';
  Object.assign(closeBtn.style, {
    width: '100%',
    border: 'none',
    background: 'var(--accent, #e8607f)',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    borderRadius: '9px',
    padding: '11px 12px',
    cursor: 'pointer',
  });
  closeBtn.addEventListener('click', () => {
    markSeen();
    overlay.remove();
  });
  sheet.appendChild(closeBtn);

  overlay.appendChild(sheet);
  return overlay;
}
