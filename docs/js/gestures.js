/**
 * 拡大キャンバス上のタッチ操作。
 *
 * ピンチでの拡大回転は使わない。375px 幅の画面で小さなモチーフを2本指で覆うと
 * 何も見えなくなるため、選択枠 + 角ハンドル1個の「1本指で完結する」方式にする。
 *
 * iOS Safari 対策:
 *  - touch-action: none（CSS）と touchmove の preventDefault が無いとページズームになる
 *  - user-scalable=no は無視されるので JS 側で止める
 *  - pointercancel（ブラウザにジェスチャを奪われた時）を必ず処理する
 */

const ROT_SNAP = 15;      // 回転のスナップ角
const ROT_TOLERANCE = 6;  // この範囲ならスナップさせる
const X_SNAP_CENTER = 4;  // 中心線への吸着範囲
const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 4; // これ以上動いたら長押しではなくドラッグ

/** クライアント座標を爪の内部座標（幅100系）へ */
export function toNail(svgEl, clientX, clientY) {
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

/** 点の下にあるレイヤー index を上から順に集める */
function layersAt(svgEl, clientX, clientY) {
  const els = document.elementsFromPoint(clientX, clientY);
  const out = [];
  for (const el of els) {
    if (!svgEl.contains(el)) continue;
    const g = el.closest ? el.closest('[data-layer]') : null;
    if (!g) continue;
    const i = +g.getAttribute('data-layer');
    if (!out.includes(i)) out.push(i);
  }
  return out;
}

/**
 * @param {SVGElement} svgEl 拡大キャンバスの <svg>
 * @param {object} ctx
 *   getSelected()          現在選択中のレイヤー index（無ければ -1）
 *   getBox(layerIdx)       { kind, cx, cy, w, h, rot } を返す（render.layerBox）
 *   onSelect(idx)          選択が変わった
 *   onMove(idx, x, y)      移動中（爪座標）
 *   onTransform(idx, w, rot) 変形中
 *   onCommit()             ドラッグ終了（履歴に積んで保存する）
 *   onLongPress(idx, clientX, clientY)
 */
export function attachGestures(svgEl, ctx) {
  let mode = null;          // 'move' | 'transform'
  let activeId = null;
  let target = -1;
  let start = null;         // { nx, ny, cx, cy, w, rot, aspect, offX, offY }
  let moved = false;
  let pressTimer = null;

  const clearPress = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } };

  let penPoints = null;

  // 2本指はキャンバスのズームとパンに使う。
  // 1本指は描画・移動のままなので、拡大して大きく描けば細かい線が引きやすくなる。
  const pointers = new Map();
  let pinch = null;

  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function startPinch() {
    const [a, b] = [...pointers.values()];
    const view = ctx.getZoom();
    pinch = { d0: dist(a, b) || 1, m0: mid(a, b), z0: view.z, tx0: view.tx, ty0: view.ty };
    // 進行中の1本指操作は打ち切る（描きかけの線を残さない）
    if (mode === 'pen') ctx.onPenCancel();
    clearPress();
    mode = null; start = null; moved = false; activeId = null; penPoints = null;
  }

  function updatePinch() {
    if (!pinch || pointers.size < 2) return;
    const [a, b] = [...pointers.values()];
    const m = mid(a, b);
    const z = pinch.z0 * (dist(a, b) / pinch.d0);
    ctx.setZoom(z, pinch.tx0 + (m.x - pinch.m0.x), pinch.ty0 + (m.y - pinch.m0.y));
  }

  function down(e) {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size >= 2) { startPinch(); e.preventDefault(); return; }
    if (activeId !== null) return;
    const p = toNail(svgEl, e.clientX, e.clientY);

    // ペンモードのときだけドラッグが描画になる。暗黙に切り替えると誤操作になるので、
    // モードの切り替えは必ずツールタブ側の明示操作で行う
    if (ctx.getMode && ctx.getMode() === 'pen') {
      mode = 'pen';
      penPoints = [p];
      activeId = e.pointerId;
      moved = false;
      if (svgEl.setPointerCapture) { try { svgEl.setPointerCapture(e.pointerId); } catch (err) { /* noop */ } }
      e.preventDefault();
      return;
    }

    const handle = e.target.closest && e.target.closest('[data-handle]');

    if (handle) {
      target = ctx.getSelected();
      const box = ctx.getBox(target);
      if (!box || box.kind !== 'motif') return;
      mode = 'transform';
      start = { cx: box.cx, cy: box.cy, w: box.w, rot: box.rot, aspect: box.h / box.w };
    } else {
      const hits = layersAt(svgEl, e.clientX, e.clientY);
      if (!hits.length) {
        ctx.onSelect(-1);
        return;
      }
      const sel = ctx.getSelected();
      // 同じ場所を再タップしたら下のレイヤーへ巡回する。
      // 小さな爪の上で、柄の上のリボン、その上の文字を選び分けるのに必要
      const at = hits.indexOf(sel);
      const next = at >= 0 ? hits[(at + 1) % hits.length] : hits[0];
      if (next !== sel) ctx.onSelect(next);
      target = next;

      const box = ctx.getBox(target);
      if (!box) return;
      mode = 'move';
      start = { cx: box.cx, cy: box.cy, offX: box.cx - p.x, offY: box.cy - p.y, kind: box.kind };

      clearPress();
      pressTimer = setTimeout(() => {
        pressTimer = null;
        if (!moved) { mode = null; ctx.onLongPress(target, e.clientX, e.clientY); }
      }, LONG_PRESS_MS);
    }

    activeId = e.pointerId;
    moved = false;
    if (svgEl.setPointerCapture) { try { svgEl.setPointerCapture(e.pointerId); } catch (err) { /* noop */ } }
    e.preventDefault();
  }

  function move(e) {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch) { updatePinch(); e.preventDefault(); return; }
    if (e.pointerId !== activeId || !mode) return;
    const p = toNail(svgEl, e.clientX, e.clientY);

    if (mode === 'pen') {
      const last = penPoints[penPoints.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) >= 0.6) {   // 近すぎる点は捨てる
        penPoints.push(p);
        moved = true;
        ctx.onPenMove(penPoints);
      }
      e.preventDefault();
      return;
    }

    if (!moved) {
      const box = ctx.getBox(target);
      const d = box ? Math.hypot(p.x - start.cx, p.y - start.cy) : 99;
      if (mode === 'move') {
        const dx = p.x + start.offX - start.cx, dy = p.y + start.offY - start.cy;
        if (Math.abs(dx) < MOVE_THRESHOLD && Math.abs(dy) < MOVE_THRESHOLD) return;
      }
      moved = true;
      clearPress();
    }

    if (mode === 'move') {
      let x = p.x + start.offX;
      let y = p.y + start.offY;
      if (Math.abs(x - 50) < X_SNAP_CENTER) x = 50;   // 中心線に吸着
      ctx.onMove(target, x, y);
    } else if (mode === 'transform') {
      const vx = p.x - start.cx, vy = p.y - start.cy;
      const d = Math.hypot(vx, vy);
      const aspect = start.aspect || 1;
      const cornerAngle = Math.atan2(aspect, 1) * 180 / Math.PI;
      let rot = Math.atan2(vy, vx) * 180 / Math.PI - cornerAngle;
      const snapped = Math.round(rot / ROT_SNAP) * ROT_SNAP;
      if (Math.abs(rot - snapped) < ROT_TOLERANCE) rot = snapped;
      rot = ((rot + 180) % 360 + 360) % 360 - 180;
      const w = Math.max(8, Math.min(150, 2 * d / Math.sqrt(1 + aspect * aspect)));
      ctx.onTransform(target, w, rot);
    }
    e.preventDefault();
  }

  function up(e) {
    pointers.delete(e.pointerId);
    if (pinch) { if (pointers.size < 2) pinch = null; return; }
    if (e.pointerId !== activeId) return;
    clearPress();
    if (svgEl.releasePointerCapture) { try { svgEl.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ } }
    if (mode === 'pen') ctx.onPenEnd(penPoints || []);
    else if (moved) ctx.onCommit();
    penPoints = null;
    activeId = null; mode = null; start = null; moved = false;
  }

  function cancel(e) {
    pointers.delete(e.pointerId);
    if (pinch) { if (pointers.size < 2) pinch = null; return; }
    if (e.pointerId !== activeId) return;
    clearPress();
    if (mode === 'pen') ctx.onPenCancel();
    penPoints = null;
    activeId = null; mode = null; start = null; moved = false;
  }

  svgEl.addEventListener('pointerdown', down);
  svgEl.addEventListener('pointermove', move);
  svgEl.addEventListener('pointerup', up);
  svgEl.addEventListener('pointercancel', cancel);
  svgEl.addEventListener('contextmenu', e => e.preventDefault());
  // iOS Safari は user-scalable=no を無視する。キャンバス上のピンチを止める
  svgEl.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  svgEl.addEventListener('gesturestart', e => e.preventDefault());

  return function detach() {
    clearPress();
    svgEl.removeEventListener('pointerdown', down);
    svgEl.removeEventListener('pointermove', move);
    svgEl.removeEventListener('pointerup', up);
    svgEl.removeEventListener('pointercancel', cancel);
  };
}

/** 選択枠と角ハンドルの markup（キャンバスの最前面に重ねる） */
export function selectionMarkup(box) {
  if (!box) return '';
  if (box.kind === 'motif') {
    const hw = box.w / 2, hh = box.h / 2;
    return `<g transform="translate(${r(box.cx)} ${r(box.cy)}) rotate(${r(box.rot)})" pointer-events="none">`
         + `<rect x="${r(-hw)}" y="${r(-hh)}" width="${r(box.w)}" height="${r(box.h)}"`
         + ` fill="none" stroke="#E8607F" stroke-width="1.4" stroke-dasharray="4 3"/>`
         + `<circle data-handle="1" cx="${r(hw)}" cy="${r(hh)}" r="7.5" fill="#E8607F"`
         + ` stroke="#fff" stroke-width="2" pointer-events="auto" style="cursor:grab"/>`
         + `</g>`;
  }
  if (box.kind === 'edge') {
    return `<g pointer-events="none"><rect x="0" y="${r(box.cy - 5)}" width="100" height="10"`
         + ` fill="none" stroke="#E8607F" stroke-width="1.4" stroke-dasharray="4 3"/></g>`;
  }
  return `<g pointer-events="none"><rect x="1" y="1" width="98" height="${r(box.h - 2)}"`
       + ` fill="none" stroke="#E8607F" stroke-width="1.4" stroke-dasharray="4 3"/></g>`;
}

function r(v) { return Math.round((Number(v) || 0) * 100) / 100; }
