// ============================================================
// game.js — 状態・時間・歩行・建造・会話・スケジュールロジック
// ============================================================
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let G = null;

// ---------- 時間設計(v0.4追補: 1日=288秒、1時間=12秒) ----------
const DAY_SECONDS = 288;
const HOURS_PER_MS = 24 / (DAY_SECONDS * 1000);
const SCHEDULE = { wake: 6, workStart: 8, workEnd: 18, leisureEnd: 23 };

function phaseAt(hour) {
  if (hour >= SCHEDULE.wake && hour < SCHEDULE.workStart) return 'prepare';
  if (hour >= SCHEDULE.workStart && hour < SCHEDULE.workEnd) return 'work';
  if (hour >= SCHEDULE.workEnd && hour < SCHEDULE.leisureEnd) return 'leisure_window';
  return 'sleep';
}
function fmtClock() {
  const h = Math.floor(G.clockHours);
  const m = Math.floor((G.clockHours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// フロア定義
function makeFloor(name, width, initialFacilities) {
  const slots = [];
  let x = 20;
  initialFacilities.forEach(f => {
    const w = f ? 120 : 90;
    slots.push({ x, w, facility: f ? { type: f, occupants: [], customers: [], residents: [] } : null });
    x += w + 14;
  });
  while (x < width - 100) {
    slots.push({ x, w: 90, facility: null });
    x += 104;
  }
  return { name, width: Math.max(width, x + 20), slots };
}

function newGame() {
  G = {
    day: 1,
    clockHours: SCHEDULE.workStart + 1, // 開始は朝9時ごろから
    resources: { stone: 40, wood: 24, rp: 120, gold: 800 },
    floors: [
      makeFloor('鍛造の階', 760, ['smithy', null, 'tavern']),
      makeFloor('生活の階', 700, ['dorm', 'restaurant', null]),
    ],
    npcs: [],
    player: { floor: 0, x: 90 },
    log: [],
    activeDialogue: null,
    buildMenuSlot: null,
    assignMenuSlot: null,
  };
  for (let i = 0; i < 8; i++) addNpc();
  assignInitialPositions();
  assignHomesIfPossible();
  tickChat();
}

function addNpc() {
  const attr = pick(ATTR_KEYS);
  const sp = pick(SPECIES[attr]);
  const npc = {
    id: G.npcs.length,
    name: pick(NAME_HEAD) + pick(NAME_TAIL),
    species: sp[1], speciesKey: sp[0], attr,
    axis: { open: randAxis(), dream: randAxis(), logic: randAxis(), rule: randAxis() },
    floor: 0, x: 0,
    job: null,          // 職場スロット(persistent。プレイヤーが配置/解除する)
    home: null,         // 自宅(宿舎)スロット(persistent。宿舎があれば自動割当)
    activity: 'idle',   // 'idle' | 'prepare' | 'work' | 'leisure' | 'sleep'
    atSlot: null,       // 現在物理的にいるスロット(表示・会話プール用)
    leisureSlot: null,  // 今夜の娯楽先(1日1回決める。nullなら真っ直ぐ帰宅)
    leisureDay: -1,     // leisureSlotを決めた日(重複決定を防ぐ)
    visitUntil: 0,      // 根無し草(無職)の一時来訪が終わる時刻
    visitCounts: {},    // 施設スロットごとの来訪回数(常連度)
  };
  G.npcs.push(npc);
  return npc;
}

// 常連判定
const REGULAR_THRESHOLD = 3;
let _slotIdSeq = 0;
function slotId(slot) { if (!slot._id) slot._id = ++_slotIdSeq; return slot._id; }
function visitCount(npc, slot) { return npc.visitCounts[slotId(slot)] || 0; }
function isRegular(npc, slot) { return visitCount(npc, slot) >= REGULAR_THRESHOLD; }

function affinity(a, b) {
  const near = (x, y, w) => w * (1 - Math.abs(x - y) / 200);
  const far = (x, y, w) => w * (Math.abs(x - y) / 200) * (1 - Math.abs(x + y) / 400);
  let s = 0;
  s += near(a.axis.open, b.axis.open, 25);
  s += far(a.axis.dream, b.axis.dream, 20);
  s += near(a.axis.logic, b.axis.logic, 30);
  s += far(a.axis.rule, b.axis.rule, 15);
  return clamp(s, -30, 100);
}

function findSlotsByType(type) {
  const out = [];
  G.floors.forEach((floor, fi) => floor.slots.forEach(s => { if (s.facility && s.facility.type === type) out.push({ slot: s, floor: fi }); }));
  return out;
}

function assignInitialPositions() {
  G.floors.forEach((floor, fi) => {
    floor.slots.forEach(slot => {
      if (!slot.facility || slot.facility.type === 'dorm') return;
      const n = 1 + rnd(2);
      for (let i = 0; i < n; i++) {
        const free = G.npcs.find(x => x.job === null && !x._placed);
        if (!free) break;
        free._placed = true;
        free.floor = fi; free.x = slot.x + 16 + i * 26;
        free.job = slot; free.atSlot = slot; free.activity = 'work';
        slot.facility.occupants.push(free.id);
      }
    });
  });
  G.npcs.filter(n => n.job === null).forEach(n => {
    n.floor = rnd(G.floors.length);
    n.x = 40 + rnd(G.floors[n.floor].width - 80);
  });
  G.npcs.forEach(n => delete n._placed);
}

// 宿舎ができたら、まだ自宅を持たない魔物に割り当てる
function assignHomesIfPossible() {
  const dorms = findSlotsByType('dorm');
  if (!dorms.length) return;
  G.npcs.filter(n => n.home === null).forEach(n => {
    const d = dorms.find(({ slot }) => slot.facility.residents.length < 4);
    if (!d) return;
    n.home = d.slot;
    d.slot.facility.residents.push(n.id);
  });
}

// ---------- 会話生成(吹き出し) ----------
const REGULAR_AFFINITY_MIN = 25;
function pairKind(a, b, slot, af) {
  const staffA = a.activity === 'work', staffB = b.activity === 'work';
  if (staffA === staffB) return 'peer';
  const customer = staffA ? b : a;
  return (isRegular(customer, slot) && af >= REGULAR_AFFINITY_MIN) ? 'peer' : 'service';
}

function tickChat() {
  G.floors.forEach((floor) => {
    floor.slots.forEach(slot => {
      if (!slot.facility) return;
      slot.facility.chat = null;
      const ids = [
        ...slot.facility.occupants.filter(id => G.npcs[id] && G.npcs[id].activity === 'work'),
        ...(slot.facility.customers || []),
      ];
      const occ = ids.map(id => G.npcs[id]).filter(Boolean);
      if (occ.length < 2) return;
      if (Math.random() > 0.7) return;
      let best = null, bestScore = -999, bestKind = 'peer';
      for (let i = 0; i < occ.length; i++) for (let j = i + 1; j < occ.length; j++) {
        const rawAf = affinity(occ[i], occ[j]);
        const kind = pairKind(occ[i], occ[j], slot, rawAf);
        const score = rawAf - (kind === 'service' ? 40 : 0);
        if (score > bestScore) { bestScore = score; best = [occ[i], occ[j]]; bestKind = kind; }
      }
      if (!best) return;
      const [a, b] = best;
      let lines;
      if (bestKind === 'service') lines = SERVICE_LINES[slot.facility.type] || SERVICE_LINES.default;
      else lines = bestScore < 8 ? GRUMBLE_LINES : (CHAT_LINES[slot.facility.type] || CHAT_LINES.default);
      const [staffN, otherN] = a.activity === 'work' ? [a, b] : [b, a];
      slot.facility.chat = pick(lines)(staffN.name, otherN.name);
    });
  });
}
setInterval(() => { if (G) tickChat(); }, 9000);

// ---------- スケジュール(職を持つ魔物の1日) ----------
function leaveCurrentSlot(n) {
  if (!n.atSlot) return;
  const fac = n.atSlot.facility;
  if (fac) fac.customers = (fac.customers || []).filter(id => id !== n.id);
  n.atSlot = null;
}

function moveNpcTo(n, slot, floorIdx) {
  leaveCurrentSlot(n);
  n.floor = floorIdx;
  n.x = slot.x + 12 + rnd(Math.max(8, slot.w - 24));
  n.walkTargetX = n.x;
  n.atSlot = slot;
}

function slotFloorIndex(slot) {
  for (let fi = 0; fi < G.floors.length; fi++) if (G.floors[fi].slots.includes(slot)) return fi;
  return 0;
}

function opennessLeisureChance(n) {
  const t = clamp((n.axis.open + 100) / 200, 0, 1);
  return 0.25 + t * 0.5; // 開放的なほど娯楽に出かけやすい(25%〜75%)
}

function allSlotsFlat() {
  const out = [];
  G.floors.forEach((floor, fi) => floor.slots.forEach(s => out.push({ slot: s, floor: fi })));
  return out;
}

function phaseTargetSlot(n, phase) {
  if (phase === 'work') return n.job;
  if (phase === 'leisure_window') return n.leisureSlot || n.home;
  if (phase === 'sleep' || phase === 'prepare') return n.home;
  return null;
}

function tickSchedule() {
  const phase = phaseAt(G.clockHours);
  G.npcs.filter(n => n.job !== null).forEach(n => {
    if (n.leisureDay !== G.day && phase === 'leisure_window') {
      n.leisureDay = G.day;
      const goOut = Math.random() < opennessLeisureChance(n);
      if (goOut) {
        const candidates = allSlotsFlat().filter(({ slot }) => slot.facility && FACILITY_TYPES[slot.facility.type].customers
          && slot !== n.job && (slot.facility.customers || []).length < 3);
        n.leisureSlot = candidates.length ? pick(candidates).slot : null;
      } else {
        n.leisureSlot = null;
      }
    }
    let targetPhase = phase;
    if (phase === 'prepare' && !n.home) targetPhase = 'work'; // 自宅が無いなら早めに出勤扱い
    const targetSlot = phaseTargetSlot(n, targetPhase);
    if (n.activity === targetPhase && targetSlot === n.atSlot) return; // 変化なし

    if (targetPhase === 'work') {
      n.activity = 'work';
      moveNpcTo(n, n.job, slotFloorIndex(n.job));
    } else if (targetPhase === 'leisure_window') {
      if (n.leisureSlot) {
        n.activity = 'leisure';
        moveNpcTo(n, n.leisureSlot, slotFloorIndex(n.leisureSlot));
        n.leisureSlot.facility.customers = n.leisureSlot.facility.customers || [];
        n.leisureSlot.facility.customers.push(n.id);
        const sid = slotId(n.leisureSlot);
        n.visitCounts[sid] = (n.visitCounts[sid] || 0) + 1;
      } else if (n.home) {
        n.activity = 'sleep';
        moveNpcTo(n, n.home, slotFloorIndex(n.home));
      } else {
        n.activity = 'idle'; leaveCurrentSlot(n); n.walkTargetX = n.x;
      }
    } else if (targetPhase === 'sleep' || targetPhase === 'prepare') {
      if (n.home) { n.activity = targetPhase; moveNpcTo(n, n.home, slotFloorIndex(n.home)); }
      else { n.activity = 'idle'; leaveCurrentSlot(n); n.walkTargetX = n.x; }
    }
  });
}
setInterval(() => { if (G) tickSchedule(); }, 1000);

// ---------- 無職(根無し草)の自由な来訪 ----------
function tickFreeVisit() {
  const now = Date.now();
  G.npcs.forEach(n => {
    if (n.job === null && n.activity === 'leisure' && now > n.visitUntil) {
      if (n.atSlot) n.atSlot.facility.customers = (n.atSlot.facility.customers || []).filter(id => id !== n.id);
      n.activity = 'idle'; n.atSlot = null;
    }
  });
  G.npcs.filter(n => n.job === null && n.activity === 'idle').forEach(n => {
    if (Math.random() > 0.12) return;
    const floor = G.floors[n.floor];
    const candidates = floor.slots.filter(s => s.facility && FACILITY_TYPES[s.facility.type].customers &&
      (s.facility.customers || []).length < 3);
    if (!candidates.length) return;
    const slot = pick(candidates);
    n.activity = 'leisure'; n.atSlot = slot;
    slot.facility.customers = slot.facility.customers || [];
    n.x = slot.x + 12 + slot.facility.customers.length * 20;
    n.walkTargetX = n.x;
    n.visitUntil = now + 15000 + rnd(20000);
    slot.facility.customers.push(n.id);
    const sid = slotId(slot);
    n.visitCounts[sid] = (n.visitCounts[sid] || 0) + 1;
  });
}
setInterval(() => { if (G) tickFreeVisit(); }, 3000);

// ---------- ゲームクロック進行 ----------
function tickClock(dtMs) {
  if (!G) return;
  G.clockHours += dtMs * HOURS_PER_MS;
  if (G.clockHours >= 24) { G.clockHours -= 24; G.day++; }
}
setInterval(() => tickClock(200), 200);

// ---------- プレイヤー移動 ----------
const MOVE_SPEED = 9;
function movePlayer(dir) {
  if (!G || G.activeDialogue || G.buildMenuSlot || G.assignMenuSlot) return;
  const floor = G.floors[G.player.floor];
  G.player.x = clamp(G.player.x + dir * MOVE_SPEED, 20, floor.width - 20);
}
function changeFloor(delta) {
  if (!G || G.activeDialogue || G.buildMenuSlot || G.assignMenuSlot) return;
  G.player.floor = clamp(G.player.floor + delta, 0, G.floors.length - 1);
}

function nearestSlot() {
  const floor = G.floors[G.player.floor];
  let best = null, bestD = 60;
  floor.slots.forEach(s => {
    const center = s.x + s.w / 2;
    const d = Math.abs(center - G.player.x);
    if (d < bestD) { bestD = d; best = s; }
  });
  return best;
}

function interact() {
  if (!G) return;
  if (G.activeDialogue) { G.activeDialogue = null; return; }
  if (G.buildMenuSlot) { G.buildMenuSlot = null; return; }
  if (G.assignMenuSlot) { G.assignMenuSlot = null; return; }
  const slot = nearestSlot();
  if (!slot) return;
  if (!slot.facility) { G.buildMenuSlot = slot; return; }
  G.assignMenuSlot = slot;
}

function idleNpcs() {
  // 配置操作で選べるのは「まだ職を持たない魔物」
  return G.npcs.filter(n => n.job === null);
}

function assignNpc(npcId, slot) {
  const n = G.npcs.find(x => x.id === npcId);
  if (!n || n.job !== null) return;
  if (slot.facility.occupants.length >= 4) return;
  n.job = slot;
  slot.facility.occupants.push(n.id);
  if (phaseAt(G.clockHours) === 'work') { n.activity = 'work'; moveNpcTo(n, slot, slotFloorIndex(slot)); }
}

function unassignNpc(npcId, slot) {
  const n = G.npcs.find(x => x.id === npcId);
  if (!n) return;
  slot.facility.occupants = slot.facility.occupants.filter(id => id !== npcId);
  n.job = null; n.activity = 'idle'; leaveCurrentSlot(n); n.walkTargetX = n.x;
}

// ---------- NPCの徘徊(無職・待機時間帯のみ) ----------
function tickWander() {
  G.npcs.forEach(n => {
    if (n.activity === 'work' || n.activity === 'leisure') {
      if (n.atSlot && Math.random() < 0.15) {
        n.walkTargetX = n.atSlot.x + 10 + Math.random() * Math.max(10, n.atSlot.w - 20);
      }
    } else if (n.activity === 'idle') {
      if (n.walkTargetX === undefined || Math.abs(n.x - n.walkTargetX) < 4) {
        if (Math.random() < 0.5) {
          const floor = G.floors[n.floor];
          n.walkTargetX = 20 + Math.random() * (floor.width - 40);
        } else n.walkTargetX = n.x;
      }
    }
    // sleep / prepare 中は動かない(自宅で静止)
  });
}
setInterval(() => { if (G) tickWander(); }, 4000);

function tickWalkStep() {
  if (!G) return;
  G.npcs.forEach(n => {
    if (n.walkTargetX === undefined) return;
    const d = n.walkTargetX - n.x;
    if (Math.abs(d) < 1.5) return;
    n.x += Math.sign(d) * Math.min(Math.abs(d), 2.2);
  });
}
setInterval(tickWalkStep, 100);

function build(type) {
  const slot = G.buildMenuSlot;
  if (!slot) return false;
  const cost = FACILITY_TYPES[type].cost;
  for (const [k, v] of Object.entries(cost)) if ((G.resources[k] || 0) < v) return false;
  for (const [k, v] of Object.entries(cost)) G.resources[k] -= v;
  slot.facility = { type, occupants: [], customers: [], residents: [] };
  if (type !== 'dorm') {
    const jobless = G.npcs.filter(n => n.job === null).slice(0, 2);
    jobless.forEach((n) => { assignNpc(n.id, slot); });
  } else {
    assignHomesIfPossible();
  }
  G.buildMenuSlot = null;
  G.log.unshift(`${FACILITY_TYPES[type].name}を建造した`);
  return true;
}
