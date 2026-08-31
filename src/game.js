// ============================================================
// game.js — 状態・時間・横断面(サイドビュー)の歩行・建造・会話・スケジュール
// ============================================================
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let G = null;
const TILE = 56; // 1マスのピクセルサイズ(横方向)

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

// ---------- フロア(横方向タイルの帯)定義 ----------
let _buildingIdSeq = 0;
function makeFloor(name, gridW, initialBuildings, opts) {
  const floor = { name, gridW, width: gridW * TILE, buildings: [], stairsGx: gridW - 2 };
  (initialBuildings || []).forEach(({ type, gx }) => placeBuilding(floor, type, gx));
  opts = opts || {};
  floor.locked = !!opts.locked;
  floor.unlockRp = opts.unlockRp || 0;
  return floor;
}

function placeBuilding(floor, type, gx) {
  const info = FACILITY_TYPES[type];
  const b = { id: ++_buildingIdSeq, type, gx, w: info.tileW, occupants: [], customers: [], residents: [], chat: null };
  floor.buildings.push(b);
  return b;
}

function rectFree(floor, gx, w) {
  if (gx < 0 || gx + w > floor.gridW) return false;
  if (gx < floor.stairsGx + 1 && gx + w > floor.stairsGx) return false; // 階段の上には建てられない
  return !floor.buildings.some(b => gx < b.gx + b.w && gx + w > b.gx);
}

function newGame() {
  G = {
    day: 1,
    clockHours: SCHEDULE.workStart + 1,
    resources: { stone: 40, wood: 24, rp: 120, gold: 800 },
    floors: [
      makeFloor('1階', 16, [{ type: 'mine', gx: 1 }, { type: 'smithy', gx: 4 }, { type: 'tavern', gx: 7 }]),
      makeFloor('2階', 16, [{ type: 'sawmill', gx: 1 }, { type: 'dorm', gx: 4 }, { type: 'restaurant', gx: 8 }]),
      makeFloor('3階', 12, [], { locked: true, unlockRp: 300 }),
      makeFloor('4階', 12, [], { locked: true, unlockRp: 800 }),
    ],
    npcs: [],
    player: { floor: 0, x: 3 * TILE },
    log: [],
    activeDialogue: null,
    buildMenuTile: null,
    assignMenuBuilding: null,
  };
  for (let i = 0; i < 12; i++) addNpc();
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
    job: null, home: null,
    activity: 'idle',
    atBuilding: null,
    leisureBuilding: null,
    leisureDay: -1,
    visitUntil: 0,
    visitCounts: {},
    money: 10 + rnd(30),
    lastSpend: null,
  };
  G.npcs.push(npc);
  return npc;
}

const REGULAR_THRESHOLD = 3;
function visitCount(npc, b) { return npc.visitCounts[b.id] || 0; }
function isRegular(npc, b) { return visitCount(npc, b) >= REGULAR_THRESHOLD; }

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

// ---------- 絆(bond) — その場のaffinityとは別に、一緒に過ごした時間で育つ関係の記憶 ----------
// 個体ごとに { 相手のid: 絆値(0〜100) } を持つ。affinityが高いペアほど早く育ち、低いペアはほぼ育たない
const BOND_FRIEND = 20;   // この値を超えると「仲がいい」認定
const BOND_CLOSE = 50;    // この値を超えると「親しい」認定
function bondKey(a, b) { return a.id < b.id ? `${a.id}_${b.id}` : `${b.id}_${a.id}`; }
function getBond(a, b) { return (G.bonds && G.bonds[bondKey(a, b)]) || 0; }
function growBond(a, b) {
  if (!G.bonds) G.bonds = {};
  const af = affinity(a, b);
  if (af <= 0) return; // 相性が悪い相手とは絆が育たない(自然に疎遠のまま)
  const key = bondKey(a, b);
  const gain = (af / 100) * 3; // 相性が良いほど、1回の交流で育つ量が大きい
  G.bonds[key] = clamp((G.bonds[key] || 0) + gain, 0, 100);
}
function bondLabel(v) {
  if (v >= BOND_CLOSE) return '親しい仲';
  if (v >= BOND_FRIEND) return '仲がいい';
  if (v > 0) return '顔見知り';
  return null;
}
// ある個体から見た「一番仲のいい相手」を返す(履歴・UI表示用)
function bestFriendOf(npc) {
  let best = null, bestV = 0;
  G.npcs.forEach(other => {
    if (other.id === npc.id) return;
    const v = getBond(npc, other);
    if (v > bestV) { bestV = v; best = other; }
  });
  return best ? { npc: best, bond: bestV } : null;
}

function allBuildingsFlat() {
  const out = [];
  G.floors.forEach((floor, fi) => { if (!floor.locked) floor.buildings.forEach(b => out.push({ building: b, floor: fi })); });
  return out;
}
function findBuildingsByType(type) { return allBuildingsFlat().filter(({ building }) => building.type === type); }
function buildingFloorIndex(b) {
  for (let fi = 0; fi < G.floors.length; fi++) if (G.floors[fi].buildings.includes(b)) return fi;
  return 0;
}
function buildingCenterX(b) { return b.gx * TILE + b.w * TILE / 2; }
function stairsX(floor) { return floor.stairsGx * TILE + TILE / 2; }

function assignInitialPositions() {
  G.floors.forEach((floor, fi) => {
    floor.buildings.forEach(b => {
      if (b.type === 'dorm') return;
      const n = 1 + rnd(2);
      for (let i = 0; i < n; i++) {
        const free = G.npcs.find(x => x.job === null && !x._placed);
        if (!free) break;
        free._placed = true;
        free.floor = fi; free.job = b; free.atBuilding = b; free.activity = 'work';
        free.x = buildingCenterX(b) + (i - 0.5) * 18;
      }
    });
  });
  G.floors.forEach(floor => floor.buildings.forEach(b => { b.occupants = G.npcs.filter(n => n.job === b).map(n => n.id); }));
  const openFloors = G.floors.map((f, i) => i).filter(i => !G.floors[i].locked);
  G.npcs.filter(n => n.job === null).forEach(n => {
    n.floor = pick(openFloors);
    n.x = 24 + rnd(G.floors[n.floor].width - 48);
  });
  G.npcs.forEach(n => delete n._placed);
}

function assignHomesIfPossible() {
  const dorms = findBuildingsByType('dorm');
  if (!dorms.length) return;
  G.npcs.filter(n => n.home === null).forEach(n => {
    const d = dorms.find(({ building }) => building.residents.length < 4);
    if (!d) return;
    n.home = d.building;
    d.building.residents.push(n.id);
  });
}

// ---------- 会話生成(吹き出し) ----------
const REGULAR_AFFINITY_MIN = 25;
function pairKind(a, b, building, af) {
  const staffA = a.activity === 'work', staffB = b.activity === 'work';
  if (staffA === staffB) return 'peer';
  const customer = staffA ? b : a;
  return (isRegular(customer, building) && af >= REGULAR_AFFINITY_MIN) ? 'peer' : 'service';
}

function tickChat() {
  G.floors.forEach(floor => floor.buildings.forEach(b => {
    b.chat = null;
    const ids = [
      ...b.occupants.filter(id => G.npcs[id] && G.npcs[id].activity === 'work'),
      ...(b.customers || []),
    ];
    const occ = ids.map(id => G.npcs[id]).filter(Boolean);
    if (!occ.length) return;
    const spenders = occ.filter(n => n.lastSpend);
    if (spenders.length && Math.random() < 0.3) { b.chat = pick(spenders).lastSpend.text; return; }
    if (occ.length < 2) return;
    if (Math.random() > 0.7) return;
    let best = null, bestScore = -999, bestKind = 'peer';
    for (let i = 0; i < occ.length; i++) for (let j = i + 1; j < occ.length; j++) {
      const rawAf = affinity(occ[i], occ[j]);
      const kind = pairKind(occ[i], occ[j], b, rawAf);
      const score = rawAf - (kind === 'service' ? 40 : 0);
      if (score > bestScore) { bestScore = score; best = [occ[i], occ[j]]; bestKind = kind; }
    }
    if (!best) return;
    const [a, c] = best;
    let lines;
    if (bestKind === 'service') lines = SERVICE_LINES[b.type] || SERVICE_LINES.default;
    else { lines = bestScore < 8 ? GRUMBLE_LINES : (CHAT_LINES[b.type] || CHAT_LINES.default); growBond(a, c); }
    const [staffN, otherN] = a.activity === 'work' ? [a, c] : [c, a];
    b.chat = pick(lines)(staffN.name, otherN.name);
  }));
}
setInterval(() => { if (G) tickChat(); }, 9000);

// ---------- スケジュール(職を持つ魔物の1日) ----------
function leaveCurrentBuilding(n) {
  if (!n.atBuilding) return;
  n.atBuilding.customers = (n.atBuilding.customers || []).filter(id => id !== n.id);
  n.atBuilding = null;
}

// 階段を経由して移動: 別フロアなら、まず現在フロアの階段位置へワープ→新フロアの階段位置に現れる→目的地へ歩く
function moveNpcTo(n, building, floorIdx) {
  leaveCurrentBuilding(n);
  if (floorIdx !== n.floor) {
    n.floor = floorIdx;
    n.x = stairsX(G.floors[floorIdx]); // 階段を上り下りして現れる
  }
  n.walkTargetX = buildingCenterX(building) + (rnd(building.w * TILE - 16) - (building.w * TILE - 16) / 2);
  n.atBuilding = building;
}

function opennessLeisureChance(n) {
  const t = clamp((n.axis.open + 100) / 200, 0, 1);
  return 0.25 + t * 0.5;
}

function buildingTargetFor(n, phase) {
  if (phase === 'work') return n.job;
  if (phase === 'leisure_window') return n.leisureBuilding || n.home;
  if (phase === 'sleep' || phase === 'prepare') return n.home;
  return null;
}

// ---------- 資産の消費 ----------
function trySpend(n, building) {
  const info = FACILITY_TYPES[building.type];
  if (!info.spend) return;
  const { min, max, items } = info.spend;
  const amount = min + rnd(max - min + 1);
  if (n.money < amount) { n.lastSpend = { broke: true, text: SPEND_BROKE_LINE(n.name) }; return; }
  n.money -= amount;
  const item = pick(items);
  n.lastSpend = { broke: false, text: SPEND_LINE(n.name, item, amount), amount, item };
}

function tickSchedule() {
  const phase = phaseAt(G.clockHours);
  G.npcs.filter(n => n.job !== null).forEach(n => {
    if (n.leisureDay !== G.day && phase === 'leisure_window') {
      n.leisureDay = G.day;
      const goOut = Math.random() < opennessLeisureChance(n);
      if (goOut) {
        const candidates = allBuildingsFlat().filter(({ building }) => FACILITY_TYPES[building.type].customers
          && building !== n.job && (building.customers || []).length < 3);
        n.leisureBuilding = candidates.length ? pick(candidates).building : null;
      } else {
        n.leisureBuilding = null;
      }
    }
    let targetPhase = phase;
    if (phase === 'prepare' && !n.home) targetPhase = 'work';
    const targetBuilding = buildingTargetFor(n, targetPhase);
    if (n.activity === targetPhase && targetBuilding === n.atBuilding) return;

    if (targetPhase === 'work') {
      n.activity = 'work';
      moveNpcTo(n, n.job, buildingFloorIndex(n.job));
    } else if (targetPhase === 'leisure_window') {
      if (n.leisureBuilding) {
        n.activity = 'leisure';
        moveNpcTo(n, n.leisureBuilding, buildingFloorIndex(n.leisureBuilding));
        n.leisureBuilding.customers.push(n.id);
        n.visitCounts[n.leisureBuilding.id] = (n.visitCounts[n.leisureBuilding.id] || 0) + 1;
        trySpend(n, n.leisureBuilding);
      } else if (n.home) {
        n.activity = 'sleep';
        moveNpcTo(n, n.home, buildingFloorIndex(n.home));
      } else {
        n.activity = 'idle'; leaveCurrentBuilding(n); n.walkTargetX = n.x;
      }
    } else if (targetPhase === 'sleep' || targetPhase === 'prepare') {
      if (n.home) { n.activity = targetPhase; moveNpcTo(n, n.home, buildingFloorIndex(n.home)); }
      else { n.activity = 'idle'; leaveCurrentBuilding(n); n.walkTargetX = n.x; }
    }
  });
}
setInterval(() => { if (G) tickSchedule(); }, 1000);

// ---------- 資源の産出(採掘所・伐採場) ----------
function tickProduce() {
  G.floors.forEach(floor => floor.buildings.forEach(b => {
    const info = FACILITY_TYPES[b.type];
    if (!info.produce) return;
    const workers = b.occupants.filter(id => G.npcs[id] && G.npcs[id].activity === 'work').length;
    if (!workers) return;
    G.resources[info.produce.key] = (G.resources[info.produce.key] || 0) + info.produce.amount * workers;
  }));
}
setInterval(() => { if (G) tickProduce(); }, 4000);

// ---------- 無職(根無し草)の自由な来訪 ----------
function tickFreeVisit() {
  const now = Date.now();
  G.npcs.forEach(n => {
    if (n.job === null && n.activity === 'leisure' && now > n.visitUntil) {
      leaveCurrentBuilding(n); n.activity = 'idle';
    }
  });
  G.npcs.filter(n => n.job === null && n.activity === 'idle').forEach(n => {
    if (Math.random() > 0.12) return;
    const floor = G.floors[n.floor];
    const candidates = floor.buildings.filter(b => FACILITY_TYPES[b.type].customers && (b.customers || []).length < 3);
    if (!candidates.length) return;
    const b = pick(candidates);
    n.activity = 'leisure'; n.atBuilding = b;
    n.x = buildingCenterX(b); n.walkTargetX = n.x;
    n.visitUntil = now + 15000 + rnd(20000);
    b.customers.push(n.id);
    n.visitCounts[b.id] = (n.visitCounts[b.id] || 0) + 1;
    trySpend(n, b);
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

// ---------- プレイヤー移動(横方向のみ・サイドビュー) ----------
const MOVE_SPEED = 9;
function movePlayer(dir) {
  if (!G || G.activeDialogue || G.buildMenuTile || G.assignMenuBuilding) return;
  const floor = G.floors[G.player.floor];
  G.player.x = clamp(G.player.x + dir * MOVE_SPEED, 16, floor.width - 16);
}
function onStairs() {
  const floor = G.floors[G.player.floor];
  const gx = Math.floor(G.player.x / TILE);
  return gx === floor.stairsGx;
}
function changeFloor(delta) {
  if (!G || G.activeDialogue || G.buildMenuTile || G.assignMenuBuilding) return true;
  if (!onStairs()) return 'nostairs';
  const target = clamp(G.player.floor + delta, 0, G.floors.length - 1);
  if (target === G.player.floor) return true;
  if (G.floors[target].locked) return false;
  G.player.floor = target;
  G.player.x = stairsX(G.floors[target]);
  return true;
}

// ---------- フロアのアンロック(研究点で階層が解放される) ----------
function tickUnlock() {
  G.floors.forEach(floor => {
    if (floor.locked && G.resources.rp >= floor.unlockRp) {
      floor.locked = false;
      G.log.unshift(`${floor.name}が解放された(研究点${floor.unlockRp}到達)`);
    }
  });
}
setInterval(() => { if (G) tickUnlock(); }, 2000);

function playerGx() { return Math.floor(G.player.x / TILE); }
function buildingAtTile(floor, gx) { return floor.buildings.find(b => gx >= b.gx && gx < b.gx + b.w); }

function interact() {
  if (!G) return;
  if (G.activeDialogue) { G.activeDialogue = null; return; }
  if (G.buildMenuTile) { G.buildMenuTile = null; G.buildPreviewType = null; return; }
  if (G.assignMenuBuilding) { G.assignMenuBuilding = null; return; }
  const floor = G.floors[G.player.floor];
  const gx = playerGx();
  const b = buildingAtTile(floor, gx);
  if (b) { G.assignMenuBuilding = b; return; }
  if (gx === floor.stairsGx) return; // 階段の上では建造も配置管理もできない
  G.buildMenuTile = { floor: G.player.floor, gx };
}

function idleNpcs() { return G.npcs.filter(n => n.job === null); }

function assignNpc(npcId, building) {
  const n = G.npcs.find(x => x.id === npcId);
  if (!n || n.job !== null) return;
  if (building.occupants.length >= 4) return;
  n.job = building;
  building.occupants.push(n.id);
  if (phaseAt(G.clockHours) === 'work') { n.activity = 'work'; moveNpcTo(n, building, buildingFloorIndex(building)); }
}

function unassignNpc(npcId, building) {
  const n = G.npcs.find(x => x.id === npcId);
  if (!n) return;
  building.occupants = building.occupants.filter(id => id !== npcId);
  n.job = null; n.activity = 'idle'; leaveCurrentBuilding(n); n.walkTargetX = n.x;
}

// ---------- NPCの徘徊(無職・待機時間帯のみ) ----------
function tickWander() {
  G.npcs.forEach(n => {
    if (n.activity === 'work' || n.activity === 'leisure') {
      if (n.atBuilding && Math.random() < 0.15) {
        n.walkTargetX = buildingCenterX(n.atBuilding) + (Math.random() - 0.5) * (n.atBuilding.w * TILE - 16);
      }
    } else if (n.activity === 'idle') {
      if (n.walkTargetX === undefined || Math.abs(n.x - n.walkTargetX) < 4) {
        if (Math.random() < 0.5) {
          const floor = G.floors[n.floor];
          n.walkTargetX = 20 + Math.random() * (floor.width - 40);
        } else n.walkTargetX = n.x;
      }
    }
  });
}
setInterval(() => { if (G) tickWander(); }, 4000);

function tickWalkStep() {
  if (!G) return;
  G.npcs.forEach(n => {
    if (n.walkTargetX === undefined) return;
    const d = n.walkTargetX - n.x;
    if (Math.abs(d) < 1.5) return;
    n.x += Math.sign(d) * Math.min(Math.abs(d), 2.4);
  });
}
setInterval(tickWalkStep, 100);

function build(type) {
  const tile = G.buildMenuTile;
  if (!tile) return false;
  const floor = G.floors[tile.floor];
  const info = FACILITY_TYPES[type];
  if (!rectFree(floor, tile.gx, info.tileW)) return 'nospace';
  const cost = info.cost;
  for (const [k, v] of Object.entries(cost)) if ((G.resources[k] || 0) < v) return false;
  for (const [k, v] of Object.entries(cost)) G.resources[k] -= v;
  const b = placeBuilding(floor, type, tile.gx);
  if (type !== 'dorm') {
    const jobless = G.npcs.filter(n => n.job === null).slice(0, 2);
    jobless.forEach((n) => { assignNpc(n.id, b); });
  } else {
    assignHomesIfPossible();
  }
  G.buildMenuTile = null; G.buildPreviewType = null;
  G.log.unshift(`${info.name}を建造した`);
  return true;
}