// ============================================================
// ui.js — 描画
// ============================================================
const $ = (s) => document.querySelector(s);

function img(key, cls) {
  const f = ART[key];
  if (!f) return `<span class="art ${cls || ''}"></span>`;
  return `<span class="art ${cls || ''}">${f()}</span>`;
}

const ACTIVITY_LABEL = { work: '就業中', leisure: '外出中', sleep: '就寝中', prepare: '身支度中', idle: '' };
const PHASE_LABEL = { prepare: '身支度の時間', work: '就業時間', leisure_window: '自由時間', sleep: '深夜(就寝)' };

const UI = {
  render() {
    this.renderTop();
    this.renderFloors();
    this.renderOverlay();
  },

  renderTop() {
    const phase = phaseAt(G.clockHours);
    $('#top').innerHTML = `
      <div class="brand">魔王城 — 建造・散策</div>
      <div class="clock">
        <span class="clock-time">🕒 ${fmtClock()}</span>
        <span class="clock-phase">${PHASE_LABEL[phase]}</span>
        <span class="clock-day">${G.day}日目</span>
      </div>
      <div class="res">
        <span>🪨 ${G.resources.stone}</span>
        <span>🪵 ${G.resources.wood}</span>
        <span>📖 ${G.resources.rp}</span>
        <span>💰 ${G.resources.gold}G</span>
      </div>`;
  },

  renderFloors() {
    const el = $('#floors');
    el.innerHTML = G.floors.map((floor, fi) => {
      const isCurrent = fi === G.player.floor;
      const npcsHere = G.npcs.filter(n => n.floor === fi);
      const slotsHtml = floor.slots.map(slot => this.renderSlot(slot, fi)).join('');
      const npcsHtml = npcsHere.map(n => this.renderNpc(n)).join('');
      const playerHtml = isCurrent ? this.renderPlayer() : '';
      return `<div class="floor ${isCurrent ? 'current' : 'dim'}" data-floor="${fi}">
        <div class="floor-label">${floor.name}</div>
        <div class="floor-track" style="width:${floor.width}px">
          ${slotsHtml}${npcsHtml}${playerHtml}
        </div>
      </div>`;
    }).join('');

    const cur = el.querySelector('.floor.current');
    if (cur) {
      const target = G.player.x - cur.clientWidth / 2;
      cur.scrollLeft = Math.max(0, target);
    }
  },

  renderSlot(slot) {
    if (!slot.facility) {
      return `<div class="slot empty" style="left:${slot.x}px;width:${slot.w}px">
        <div class="empty-mark">＋</div>
        <div class="empty-label">空き地</div>
      </div>`;
    }
    const info = FACILITY_TYPES[slot.facility.type];
    const chatBubble = slot.facility.chat
      ? `<div class="bubble" title="インタラクトで会話を聞く">💬</div>` : '';
    const extra = slot.facility.type === 'dorm'
      ? `<div class="fac-sub">${slot.facility.residents.length}体入居</div>` : '';
    return `<div class="slot filled" style="left:${slot.x}px;width:${slot.w}px">
      ${chatBubble}
      <div class="fac-icon">${img('btl.sp_' + info.icon, 'sprite-sm')}</div>
      <div class="fac-label">${info.name}</div>
      ${extra}
    </div>`;
  },

  renderNpc(n) {
    const artKey = 'btl.sp_' + n.speciesKey;
    const tagMap = { work: ['role-tag staff', '員'], leisure: ['role-tag customer', '外'], sleep: ['role-tag sleep', '💤'], prepare: ['role-tag prepare', '身'] };
    const t = tagMap[n.activity];
    const tag = t ? `<span class="${t[0]}">${t[1]}</span>` : '';
    const dim = (n.activity === 'sleep' || n.activity === 'prepare') ? 'dimmed' : '';
    return `<div class="npc ${dim}" style="left:${n.x}px">
      ${tag}${img(artKey, 'sprite-npc')}
      <div class="npc-name">${n.name}</div>
    </div>`;
  },

  renderPlayer() {
    return `<div class="player" style="left:${G.player.x}px">
      <div class="player-body">🐐</div>
      <div class="player-name">二代目魔王</div>
    </div>`;
  },

  renderOverlay() {
    const root = $('#overlay');
    if (G.activeDialogue) {
      root.innerHTML = `<div class="panel dialogue">
        <div class="panel-head">${G.activeDialogue.name}</div>
        <div class="panel-body">${G.activeDialogue.text}</div>
        <div class="panel-hint">スペースキーで閉じる</div>
      </div>`;
      root.classList.add('show');
      return;
    }
    if (G.assignMenuSlot) {
      const slot = G.assignMenuSlot;
      const info = FACILITY_TYPES[slot.facility.type];
      const isDorm = slot.facility.type === 'dorm';
      const staff = slot.facility.occupants.map(id => G.npcs[id]).filter(Boolean);
      const residents = (slot.facility.residents || []).map(id => G.npcs[id]).filter(Boolean);
      const customers = (slot.facility.customers || []).map(id => G.npcs[id]).filter(Boolean);
      const idle = idleNpcs();
      const row = (n, actionHtml) => `<div class="roster-row">
          ${img('btl.sp_' + n.speciesKey, 'sprite-sm')}
          <span>${n.name} <small>${n.species} ・ ${ACTIVITY_LABEL[n.activity] || '待機'}</small></span>
          ${actionHtml}
        </div>`;

      let body;
      if (isDorm) {
        const residentHtml = residents.map(n => row(n, '')).join('') || `<div class="roster-empty">まだ誰も住んでいない</div>`;
        body = `<div class="roster-col-label">入居者(${residents.length}/4・自動割当)</div>
          <div class="roster-list">${residentHtml}</div>
          <div class="panel-hint-note">宿舎は職を持つ魔物に自動で割り当てられます。就業時間外はここへ帰り、夜は眠ります。</div>`;
      } else {
        const staffHtml = staff.map(n => row(n, `<button class="mini-btn" onclick="doUnassign(${n.id})">外す</button>`)).join('')
          || `<div class="roster-empty">誰もいない</div>`;
        const customerHtml = customers.map(n => {
          const vc = visitCount(n, slot);
          const tag = isRegular(n, slot) ? `<span class="mini-tag regular">顔なじみ(${vc}回)</span>` : `<span class="mini-tag">滞在中(${vc}回目)</span>`;
          return row(n, tag);
        }).join('') || `<div class="roster-empty">今は誰も来ていない</div>`;
        const idleHtml = idle.map(n => row(n, `<button class="mini-btn primary" onclick="doAssign(${n.id})" ${staff.length >= 4 ? 'disabled' : ''}>配置</button>`)).join('')
          || `<div class="roster-empty">待機中の魔物がいない</div>`;
        const customerSection = info.customers ? `
          <div class="roster-col-label">客(${customers.length}/3・ふらっと立ち寄り中)</div>
          <div class="roster-list">${customerHtml}</div>` : '';
        body = `
          <div class="roster-col-label">スタッフ(${staff.length}/4)</div>
          <div class="roster-list">${staffHtml}</div>
          ${customerSection}
          <div class="roster-col-label">待機中(タップで配置)</div>
          <div class="roster-list">${idleHtml}</div>`;
      }
      const chatHtml = slot.facility.chat ? `<div class="panel-body chat-preview">💬 ${slot.facility.chat}</div>` : '';
      root.innerHTML = `<div class="panel assign">
        <div class="panel-head">${info.name} — 配置管理</div>
        ${chatHtml}
        ${body}
        <div class="panel-hint">スペースキーで閉じる</div>
      </div>`;
      root.classList.add('show');
      return;
    }
    if (G.buildMenuSlot) {
      const items = Object.entries(FACILITY_TYPES).map(([key, f]) => {
        const affordable = Object.entries(f.cost).every(([k, v]) => (G.resources[k] || 0) >= v);
        return `<button class="build-item ${affordable ? '' : 'disabled'}" onclick="doBuild('${key}')" ${affordable ? '' : 'disabled'}>
          ${img('btl.sp_' + f.icon, 'sprite-sm')}
          <div>${f.name}</div>
          <small>${f.floorHint}</small>
        </button>`;
      }).join('');
      root.innerHTML = `<div class="panel build">
        <div class="panel-head">何を建てますか</div>
        <div class="build-grid">${items}</div>
        <div class="panel-hint">スペースキーで閉じる</div>
      </div>`;
      root.classList.add('show');
      return;
    }
    root.classList.remove('show');
    root.innerHTML = '';
  },
};

function doBuild(type) {
  const ok = build(type);
  if (!ok) { flashToast('資材が足りません'); return; }
  UI.render();
}
function doAssign(npcId) {
  assignNpc(npcId, G.assignMenuSlot);
  UI.render();
}
function doUnassign(npcId) {
  unassignNpc(npcId, G.assignMenuSlot);
  UI.render();
}

function flashToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => t.classList.remove('show'), 1500);
}

// ---------- 入力 ----------
window.addEventListener('keydown', (e) => {
  if (!G) return;
  if (e.key === 'ArrowLeft') movePlayer(-1);
  else if (e.key === 'ArrowRight') movePlayer(1);
  else if (e.key === 'ArrowUp') changeFloor(-1);
  else if (e.key === 'ArrowDown') changeFloor(1);
  else if (e.key === ' ') { e.preventDefault(); interact(); }
  else return;
  UI.render();
});

// モバイル用オンスクリーンボタン
function btnMove(dir) { movePlayer(dir); UI.render(); }
function btnFloor(delta) { changeFloor(delta); UI.render(); }
function btnInteract() { interact(); UI.render(); }

// デバッグ用: 時間を早送り(動作確認をしやすくするため)
function btnSkipHours(h) {
  if (!G) return;
  const iterations = Math.round(h * 60); // 200ms刻みでh時間分進める(1時間=12000ms→60回)
  for (let i = 0; i < iterations; i++) tickClock(200);
  tickSchedule(); tickChat();
  UI.render();
}

window.addEventListener('DOMContentLoaded', () => {
  newGame();
  UI.render();
  setInterval(() => UI.render(), 1000);
  setInterval(() => UI.renderFloors(), 150);
});
