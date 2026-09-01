// ============================================================
// ui.js — 描画(サイドビュー・多層構造版)
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
    const transferring = G.transferNpcId !== null && G.npcs.find(x => x.id === G.transferNpcId);
    const transferBanner = transferring
      ? `<div class="transfer-banner">異動先を選択中: <b>${transferring.name}</b> を移動させる施設で「ここに異動させる」を押してください
          <button class="mini-btn" onclick="doCancelTransfer()">取りやめる</button></div>` : '';
    $('#top').innerHTML = `
      <div class="brand">魔王城 — 建造・散策</div>
      <div class="clock">
        <span class="clock-time">🕒 ${fmtClock()}</span>
        <span class="clock-phase">${PHASE_LABEL[phase]}</span>
        <span class="clock-day">${G.day}日目</span>
      </div>
      <div class="res">
        <span>🪨 ${Math.floor(G.resources.stone)}</span>
        <span>🪵 ${Math.floor(G.resources.wood)}</span>
        <span>📖 ${Math.floor(G.resources.rp)}</span>
        <span>💰 ${G.resources.gold}G</span>
      </div>`;
    $('#transferBanner').innerHTML = transferBanner;
  },

  renderFloors() {
    const el = $('#floors');
    const order = G.floors.map((_, i) => i).reverse();
    el.innerHTML = order.map(fi => this.renderFloor(fi)).join('');

    const cur = el.querySelector(`.floor[data-floor="${G.player.floor}"] .floor-track`);
    if (cur) {
      const target = G.player.x - cur.parentElement.clientWidth / 2;
      cur.parentElement.scrollLeft = Math.max(0, target);
    }
  },

  renderFloor(fi) {
    const floor = G.floors[fi];
    const isCurrent = fi === G.player.floor;
    if (floor.locked) return this.renderLockedFloor(floor, isCurrent);
    const npcsHere = G.npcs.filter(n => n.floor === fi);
    const buildingsHtml = floor.buildings.map(b => this.renderBuilding(b)).join('');
    const stairsHtml = `<div class="stairs" style="left:${floor.stairsGx * TILE}px;width:${TILE}px">🪜</div>`;
    const npcsHtml = npcsHere.map(n => this.renderNpc(n)).join('');
    const playerHtml = isCurrent ? this.renderPlayer() : '';
    const showGrid = isCurrent && G.buildMenuTile && G.buildMenuTile.floor === fi;
    const gridHtml = showGrid ? this.renderGrid(floor) : '';
    const previewHtml = showGrid ? this.renderPlacementPreview(floor) : '';
    return `<div class="floor ${isCurrent ? 'current' : 'dim'} ${showGrid ? 'building-mode' : ''}" data-floor="${fi}">
      <div class="floor-label">${floor.name}</div>
      <div class="floor-scroll">
        <div class="floor-track" style="width:${floor.width}px">
          ${gridHtml}${buildingsHtml}${stairsHtml}${previewHtml}${npcsHtml}${playerHtml}
        </div>
      </div>
    </div>`;
  },

  renderGrid(floor) {
    let lines = '';
    for (let i = 0; i <= floor.gridW; i++) lines += `<div class="grid-line" style="left:${i * TILE}px"></div>`;
    return `<div class="grid-overlay">${lines}</div>`;
  },

  renderPlacementPreview(floor) {
    const tile = G.buildMenuTile;
    const type = G.buildPreviewType;
    if (!type) return '';
    const info = FACILITY_TYPES[type];
    const ok = rectFree(floor, tile.gx, info.tileW);
    return `<div class="placement-preview ${ok ? 'ok' : 'bad'}" style="left:${tile.gx * TILE}px;width:${info.tileW * TILE}px">
      <span>${ok ? '設置可能' : '空きマス不足'}</span>
    </div>`;
  },

  renderLockedFloor(floor) {
    const pct = clamp(G.resources.rp / floor.unlockRp * 100, 0, 100);
    return `<div class="floor locked">
      <div class="floor-label">${floor.name}</div>
      <div class="locked-body">
        <div class="locked-icon">🔒</div>
        <div class="locked-text">研究点 ${Math.floor(G.resources.rp)} / ${floor.unlockRp} で解放</div>
        <div class="locked-bar"><i style="width:${pct}%"></i></div>
      </div>
    </div>`;
  },

  renderBuilding(b) {
    const info = FACILITY_TYPES[b.type];
    const chatBubble = b.chat ? `<div class="bubble" title="インタラクトで会話を聞く">💬</div>` : '';
    const extra = b.type === 'dorm' ? `<div class="fac-sub">${b.residents.length}体入居</div>` : '';
    return `<div class="building" style="left:${b.gx * TILE}px;width:${b.w * TILE}px">
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
    if (G.assignMenuBuilding) {
      const b = G.assignMenuBuilding;
      const info = FACILITY_TYPES[b.type];
      const isDorm = b.type === 'dorm';
      const staff = b.occupants.map(id => G.npcs[id]).filter(Boolean);
      const residents = (b.residents || []).map(id => G.npcs[id]).filter(Boolean);
      const customers = (b.customers || []).map(id => G.npcs[id]).filter(Boolean);
      const idle = idleNpcs();
      const row = (n, actionHtml) => {
        const bf = bestFriendOf(n);
        const bfLabel = bf ? bondLabel(bf.bond) : null;
        const bfHtml = bfLabel ? `<br><span class="bond-tag">${bfLabel}: ${bf.npc.name}(${Math.round(bf.bond)})</span>` : '';
        return `<div class="roster-row">
          ${img('btl.sp_' + n.speciesKey, 'sprite-sm')}
          <span>${n.name} <small>${n.species} ・ ${ACTIVITY_LABEL[n.activity] || '待機'} ・ 💰${n.money}G</small>${bfHtml}</span>
          ${actionHtml}
        </div>`;
      };

      let body;
      if (isDorm) {
        const residentHtml = residents.map(n => row(n, '')).join('') || `<div class="roster-empty">まだ誰も住んでいない</div>`;
        body = `<div class="roster-col-label">入居者(${residents.length}/4・自動割当)</div>
          <div class="roster-list">${residentHtml}</div>
          <div class="panel-hint-note">宿舎は職を持つ魔物に自動で割り当てられます。就業時間外はここへ帰り、夜は眠ります。</div>`;
      } else {
        const staffHtml = staff.map(n => row(n, `<button class="mini-btn" onclick="doUnassign(${n.id})">外す</button>
          <button class="mini-btn" onclick="startTransfer(${n.id})">異動</button>`)).join('')
          || `<div class="roster-empty">誰もいない</div>`;
        const customerHtml = customers.map(n => {
          const vc = visitCount(n, b);
          const tag = isRegular(n, b) ? `<span class="mini-tag regular">顔なじみ(${vc}回)</span>` : `<span class="mini-tag">滞在中(${vc}回目)</span>`;
          return row(n, tag);
        }).join('') || `<div class="roster-empty">今は誰も来ていない</div>`;
        const idleHtml = idle.map(n => row(n, `<button class="mini-btn primary" onclick="doAssign(${n.id})" ${staff.length >= 4 ? 'disabled' : ''}>配置</button>`)).join('')
          || `<div class="roster-empty">待機中の魔物がいない</div>`;
        const customerSection = info.customers ? `
          <div class="roster-col-label">客(${customers.length}/3・ふらっと立ち寄り中)</div>
          <div class="roster-list">${customerHtml}</div>` : '';
        const produceNote = info.produce
          ? `<div class="panel-hint-note">就業中のスタッフ1体につき ${info.produce.amount} ${info.produce.key === 'stone' ? '石材' : '木材'}/4秒 を産出中(現在 ${staff.filter(n => n.activity === 'work').length}体稼働)</div>`
          : '';
        body = `
          <div class="roster-col-label">スタッフ(${staff.length}/4)</div>
          <div class="roster-list">${staffHtml}</div>
          ${produceNote}
          ${customerSection}
          <div class="roster-col-label">待機中(タップで配置)</div>
          <div class="roster-list">${idleHtml}</div>`;
      }
      const chatHtml = b.chat ? `<div class="panel-body chat-preview">💬 ${b.chat}</div>` : '';
      const refund = Object.entries(info.cost).map(([k, v]) => `${Math.floor(v / 2)}${k === 'stone' ? '石材' : k === 'wood' ? '木材' : k === 'rp' ? '研究点' : k}`).join('・');
      const transferring = G.transferNpcId !== null && G.npcs.find(x => x.id === G.transferNpcId);
      const transferHtml = (transferring && !isDorm && transferring.job !== b)
        ? `<button class="mini-btn primary transfer-here" onclick="doTransferHere()" ${b.occupants.length >= 4 ? 'disabled' : ''}>ここに${transferring.name}を異動させる</button>`
        : '';
      root.innerHTML = `<div class="panel assign">
        <div class="panel-head-row">
          <div class="panel-head">${info.name}(横${info.tileW}マス) — 配置管理</div>
          <button class="mini-btn danger" onclick="doDemolish()">解体する</button>
        </div>
        ${transferHtml}
        ${chatHtml}
        ${body}
        <div class="panel-hint-note">解体すると資材の半分(${refund})が返却され、スタッフ・入居者は待機に戻ります。</div>
        <div class="panel-hint">スペースキーで閉じる</div>
      </div>`;
      root.classList.add('show');
      return;
    }
    if (G.buildMenuTile) {
      const items = Object.entries(FACILITY_TYPES).map(([key, f]) => {
        const affordable = Object.entries(f.cost).every(([k, v]) => (G.resources[k] || 0) >= v);
        return `<button class="build-item ${affordable ? '' : 'disabled'}" onclick="doBuild('${key}')"
          onmouseenter="setPreview('${key}')" ontouchstart="setPreview('${key}')" ${affordable ? '' : 'disabled'}>
          ${img('btl.sp_' + f.icon, 'sprite-sm')}
          <div>${f.name}</div>
          <small>横${f.tileW}マス・${f.floorHint}</small>
        </button>`;
      }).join('');
      root.innerHTML = `<div class="panel build">
        <div class="panel-head">何を建てますか <small class="mini">(項目にカーソルを合わせると設置範囲を確認できます)</small></div>
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

function setPreview(type) { G.buildPreviewType = type; UI.renderFloors(); }

function doBuild(type) {
  const result = build(type);
  if (result === 'nospace') { flashToast('その場所には大きすぎます(空きマス不足)'); return; }
  if (!result) { flashToast('資材が足りません'); return; }
  UI.render();
}
function doAssign(npcId) { assignNpc(npcId, G.assignMenuBuilding); UI.render(); }
function doUnassign(npcId) { unassignNpc(npcId, G.assignMenuBuilding); UI.render(); }
function doTransferHere() {
  transferNpc(G.transferNpcId, G.assignMenuBuilding);
  G.assignMenuBuilding = null;
  UI.render();
}
function doCancelTransfer() { cancelTransfer(); UI.render(); }
function doDemolish() {
  const b = G.assignMenuBuilding;
  if (!b) return;
  const info = FACILITY_TYPES[b.type];
  if (!confirm(`${info.name}を解体しますか?(資材の半分が返却され、スタッフ・入居者は待機に戻ります)`)) return;
  demolishBuilding(b);
  UI.render();
}

function flashToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => t.classList.remove('show'), 1500);
}

function floorChangeResultToast(result) {
  if (result === 'nostairs') flashToast('階段の上でないと昇り降りできません');
  else if (result === false) flashToast('この階はまだ解放されていません');
}

// ---------- 入力 ----------
window.addEventListener('keydown', (e) => {
  if (!G) return;
  if (e.key === 'ArrowLeft') movePlayer(-1);
  else if (e.key === 'ArrowRight') movePlayer(1);
  else if (e.key === 'ArrowUp') floorChangeResultToast(changeFloor(1));
  else if (e.key === 'ArrowDown') floorChangeResultToast(changeFloor(-1));
  else if (e.key === ' ') { e.preventDefault(); interact(); }
  else return;
  UI.render();
});

function btnMove(dir) { movePlayer(dir); UI.render(); }
function btnInteract() { interact(); UI.render(); }
function btnFloor(delta) { floorChangeResultToast(changeFloor(delta)); UI.render(); }

function btnSkipHours(h) {
  if (!G) return;
  const iterations = Math.round(h * 60);
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