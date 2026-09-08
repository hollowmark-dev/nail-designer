/**
 * 端末内保存（IndexedDB）。
 *
 * - localStorage は 5MB 制限で足りないので使わない
 * - idb などのラッパーを CDN から import しない（オフラインで動かなくなる）ので素で書く
 * - Safari のプライベートモードや容量不足で書き込みが例外を投げる。
 *   黙って握りつぶさず onError で画面に出す
 */

const DB_NAME = 'nail_designer';
const DB_VERSION = 1;
const STORE_DESIGNS = 'designs';
const STORE_MYPARTS = 'myparts';   // Phase 3 の手書きマイパーツ用。先に器だけ作る

let dbPromise = null;

/** 保存に失敗したことを画面へ知らせるためのフック（app.js が差し替える） */
export let onError = (msg) => console.error('[store]', msg);
export function setErrorHandler(fn) { onError = fn; }

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    let req;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      return reject(e);
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_DESIGNS)) {
        db.createObjectStore(STORE_DESIGNS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_MYPARTS)) {
        db.createObjectStore(STORE_MYPARTS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB を開けません'));
    req.onblocked = () => reject(new Error('別のタブが古いバージョンを開いています'));
  });
  dbPromise.catch(() => { dbPromise = null; });
  return dbPromise;
}

function tx(storeName, mode, fn) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    let req;
    try {
      req = fn(store);
    } catch (e) {
      return reject(e);
    }
    // IDBRequest なら必ず .result を返す。
    // 「見つからなかった」ときの result は undefined なので、
    // `result !== undefined ? … : req` のように書くとリクエスト自体を返してしまい、
    // 呼び出し側では「見つかった」ように見える（存在しない id で空のエディタが開く）
    t.oncomplete = () => resolve(req && typeof req === 'object' && 'result' in req ? req.result : req);
    t.onerror = () => reject(t.error || new Error('保存に失敗しました'));
    t.onabort = () => reject(t.error || new Error('保存が中断されました'));
  }));
}

/* ------------------------------------------------------------------ */
/* デザイン                                                            */
/* ------------------------------------------------------------------ */

export async function putDesign(design) {
  try {
    await tx(STORE_DESIGNS, 'readwrite', s => s.put(design));
    return true;
  } catch (e) {
    onError('保存できません: ' + (e && e.message ? e.message : e));
    return false;
  }
}

export async function getDesign(id) {
  try {
    return await tx(STORE_DESIGNS, 'readonly', s => s.get(id));
  } catch (e) {
    onError('読み込めません: ' + (e && e.message ? e.message : e));
    return null;
  }
}

export async function listDesigns() {
  try {
    const all = await tx(STORE_DESIGNS, 'readonly', s => s.getAll());
    const list = all || [];
    list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return list;
  } catch (e) {
    onError('一覧を読み込めません: ' + (e && e.message ? e.message : e));
    return [];
  }
}

export async function deleteDesign(id) {
  try {
    await tx(STORE_DESIGNS, 'readwrite', s => s.delete(id));
    return true;
  } catch (e) {
    onError('削除できません: ' + (e && e.message ? e.message : e));
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* マイパーツ（Phase 3 で使う。器だけ用意）                              */
/* ------------------------------------------------------------------ */

export async function listMyParts() {
  try { return (await tx(STORE_MYPARTS, 'readonly', s => s.getAll())) || []; }
  catch (e) { onError('マイパーツを読み込めません: ' + e.message); return []; }
}

export async function putMyPart(part) {
  try { await tx(STORE_MYPARTS, 'readwrite', s => s.put(part)); return true; }
  catch (e) { onError('マイパーツを保存できません: ' + e.message); return false; }
}

/* ------------------------------------------------------------------ */
/* 永続化の要求                                                        */
/* ------------------------------------------------------------------ */

/**
 * ブラウザにデータを消さないよう頼む。
 * セキュアコンテキスト（HTTPS / localhost）でしか呼べず、iOS Safari は非対応。
 * 通らなくても動作に影響はないが、通らない端末ではバックアップ書き出しが唯一の保険になる。
 */
export async function requestPersistentStorage() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return { supported: false, granted: false };
    const granted = await navigator.storage.persist();
    return { supported: true, granted };
  } catch (e) {
    return { supported: false, granted: false, error: String(e) };
  }
}
