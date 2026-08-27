// ============================================================
// art_species.js — 種族20体のスプライトをコード生成
// 5つの体型アーキタイプ(四足/人型/蛇体/有翼/巨躯)をパレットと
// 付属パーツ(角・翼・鰭・武器など)で組み替えて種族差を出す。
// ============================================================
const GROUND = (w = 22, o = .35) => `<ellipse cx="32" cy="61" rx="${w}" ry="3" fill="#000" opacity="${o}"/>`;
const AURA = (id, c) => `<defs>${rgrad(id, [[0, c, .62], [1, c, 0]])}</defs><ellipse cx="32" cy="34" rx="31" ry="29" fill="url(#${id})"/>`;
let _uid = 0;
const uid = () => 'u' + (++_uid);

// ---------- 付属パーツ ----------
const hornPair = (x, y, len, c, spread = 6) =>
  `<path d="M${x - spread} ${y} C${x - spread - 3} ${y - len * .6} ${x - spread - 1} ${y - len} ${x - spread + 2} ${y - len} C${x - spread + 1} ${y - len * .5} ${x - spread + 3} ${y - 2} ${x - spread + 4} ${y}Z" fill="${c}"/>
   <path d="M${x + spread} ${y} C${x + spread + 3} ${y - len * .6} ${x + spread + 1} ${y - len} ${x + spread - 2} ${y - len} C${x + spread - 1} ${y - len * .5} ${x + spread - 3} ${y - 2} ${x + spread - 4} ${y}Z" fill="${c}"/>`;
const batWing = (x, y, s, c, dark) =>
  `<path d="M${x} ${y} C${x - 14 * s} ${y - 20 * s} ${x - 28 * s} ${y - 20 * s} ${x - 30 * s} ${y - 8 * s}
     C${x - 22 * s} ${y - 8 * s} ${x - 20 * s} ${y - 1 * s} ${x - 17 * s} ${y + 7 * s}
     L${x - 25 * s} ${y + 4 * s} C${x - 19 * s} ${y + 12 * s} ${x - 10 * s} ${y + 12 * s} ${x} ${y + 8 * s}Z" fill="${c}"/>
   <path d="M${x} ${y} C${x - 12 * s} ${y - 14 * s} ${x - 24 * s} ${y - 16 * s} ${x - 28 * s} ${y - 9 * s}" stroke="${dark}" stroke-width="1.1" fill="none"/>`;
const featherWing = (x, y, s, c, dark) =>
  `<path d="M${x} ${y} C${x - 12 * s} ${y - 22 * s} ${x - 26 * s} ${y - 26 * s} ${x - 30 * s} ${y - 16 * s}
     C${x - 22 * s} ${y - 14 * s} ${x - 16 * s} ${y - 4 * s} ${x - 10 * s} ${y + 8 * s}Z" fill="${c}"/>
   ${[0, 1, 2].map(i => `<path d="M${x - 4 - i * 7 * s} ${y - 2 + i * 2} C${x - 14 - i * 6 * s} ${y - 12 * s - i * 3} ${x - 22 - i * 5 * s} ${y - 14 * s} ${x - 26 - i * 4 * s} ${y - 9 * s}" stroke="${dark}" stroke-width="1" fill="none"/>`).join('')}`;
const legs = (pairs, c) => pairs.map(([x, top]) => `<path d="M${x} ${top} L${x - 1} 60 L${x + 5} 60 L${x + 5} ${top}Z" fill="${c}"/>`).join('');
const flameTuft = (x, y, h, c1, c2) =>
  `<path d="M${x} ${y} C${x + h * .4} ${y - h * .5} ${x + h * .2} ${y - h * .8} ${x} ${y - h} C${x - h * .2} ${y - h * .8} ${x - h * .4} ${y - h * .5} ${x} ${y}Z" fill="${c1}"/>
   <path d="M${x} ${y - h * .15} C${x + h * .22} ${y - h * .45} ${x + h * .1} ${y - h * .6} ${x} ${y - h * .72} C${x - h * .1} ${y - h * .6} ${x - h * .22} ${y - h * .45} ${x} ${y - h * .15}Z" fill="${c2}"/>`;

// ---------- アーキタイプ ----------
// 四足獣
function A_quad(p, o = {}) {
  const g = uid();
  return S('0 0 64 64', `${AURA(g, p.acc)}
    ${o.tail || `<path d="M18 42 C8 40 6 30 10 24 C12 32 16 36 20 40Z" fill="${p.mid}"/>`}
    ${o.back || ''}
    <!-- 後脚 -->
    <path d="M20 46 L18 60 L24 60 L25 46Z" fill="${p.dark}"/>
    <path d="M38 46 L37 60 L43 60 L43 46Z" fill="${p.dark}"/>
    <!-- 胴 -->
    <ellipse cx="30" cy="41" rx="15" ry="10" fill="${p.dark}"/>
    <path d="M18 40 C20 34 40 34 42 40 C40 45 20 45 18 40Z" fill="${p.mid}"/>
    <!-- 前脚 -->
    <path d="M25 46 L23 60 L29 60 L30 46Z" fill="${p.mid}"/>
    <path d="M42 45 L42 60 L48 60 L47 45Z" fill="${p.mid}"/>
    <!-- 首 -->
    <path d="M40 40 C42 32 46 28 52 27 L54 34 C49 35 46 38 45 43Z" fill="${p.dark}"/>
    ${o.mane || ''}
    <!-- 頭 -->
    <ellipse cx="52" cy="25" rx="9" ry="8" fill="${p.head || p.mid}"/>
    ${o.snout || `<path d="M56 24 C61 22 64 25 63 29 L55 30Z" fill="${p.head || p.mid}"/>`}
    ${o.horns || ''}
    ${eyes(52, 24, 3.6, p.eye || '#ffd23c', 2)}
    ${o.front || ''}${GROUND(20)}`);
}
// 人型
function A_biped(p, o = {}) {
  const g = uid();
  return S('0 0 64 64', `${AURA(g, p.acc)}
    ${o.back || ''}
    <path d="M${26 - (o.bulk || 0)} 44 L${25 - (o.bulk || 0)} 60 L33 60 L33 44Z" fill="${p.dark}"/>
    <path d="M${34} 44 L${34} 60 L${42 + (o.bulk || 0)} 60 L${41 + (o.bulk || 0)} 44Z" fill="${p.dark}"/>
    <path d="M${22 - (o.bulk || 0)} 28 L${44 + (o.bulk || 0)} 28 L${46 + (o.bulk || 0)} 47 L${20 - (o.bulk || 0)} 47Z" fill="${p.mid}"/>
    <path d="M${27 - (o.bulk || 0) * .5} 30 L${39 + (o.bulk || 0) * .5} 30 L${40} 44 L${26} 44Z" fill="${p.light}"/>
    ${o.arms || `<path d="M${44 + (o.bulk || 0)} 30 L${52 + (o.bulk || 0)} 40 L${47 + (o.bulk || 0)} 44 L${40 + (o.bulk || 0)} 34Z" fill="${p.dark}"/>
      <path d="M${20 - (o.bulk || 0)} 30 L${13 - (o.bulk || 0)} 40 L${18 - (o.bulk || 0)} 44 L${24 - (o.bulk || 0)} 34Z" fill="${p.dark}"/>`}
    <path d="M29 22 L35 22 L35 30 L29 30Z" fill="${p.head || p.mid}"/>
    <circle cx="32" cy="18" r="9" fill="${p.head || p.light}"/>
    ${o.hair || ''}${o.horns || ''}
    ${eyes(32, 18, 3.6, p.eye || '#2a1a2e', 1.9)}
    ${o.front || ''}${GROUND(16)}`);
}
// 蛇体
function A_serpent(p, o = {}) {
  const g = uid();
  return S('0 0 64 64', `${AURA(g, p.acc)}
    ${o.back || ''}
    <path d="M8 58 C2 50 10 43 19 45 C28 47 22 54 29 54 C38 54 35 38 44 36" stroke="${p.dark}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M8 58 C2 50 10 43 19 45 C28 47 22 54 29 54 C38 54 35 38 44 36" stroke="${p.mid}" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    ${o.crest || ''}
    <path d="M40 33 C40 26 47 23 54 26 C61 29 62 37 56 40 C50 43 41 40 40 33Z" fill="${p.head || p.dark}"/>
    <path d="M44 29 C48 26 54 26 58 29 C54 30 48 30 44 29Z" fill="${p.light}"/>
    ${o.horns || ''}
    ${eyes(52, 32, 3.4, p.eye || '#c9f7ff', 2)}
    <path d="M58 37 L63 38 L58 40Z" fill="#1a2a36"/>
    ${o.front || ''}${GROUND(20, .3)}`);
}
// 有翼
function A_wing(p, o = {}) {
  const g = uid();
  return S('0 0 64 64', `${AURA(g, p.acc)}
    ${o.wingBack || batWing(30, 30, 1, p.dark, p.dark)}
    <path d="M22 40 C22 30 30 26 38 28 C46 30 48 38 44 44 C40 50 26 50 22 40Z" fill="${p.mid}"/>
    <path d="M26 40 C26 34 32 31 38 33 C43 35 44 40 41 44Z" fill="${p.light}"/>
    ${o.wingFront || batWing(34, 28, 1, p.mid, p.dark)}
    ${o.tail || `<path d="M22 42 L8 50 L14 43 L7 41Z" fill="${p.mid}"/>`}
    <circle cx="47" cy="28" r="8" fill="${p.head || p.mid}"/>
    ${o.beak || `<path d="M53 27 L62 25 L61 31 L53 31Z" fill="${p.acc}"/>`}
    ${o.horns || ''}
    ${eyes(47, 26, 3.2, p.eye || '#fffbe0', 2)}
    <path d="M34 48 L33 58 M42 48 L43 58" stroke="${p.acc}" stroke-width="2.4" stroke-linecap="round"/>
    ${o.front || ''}${GROUND(19, .3)}`);
}
// 巨躯・鈍重
function A_mass(p, o = {}) {
  const g = uid();
  return S('0 0 64 64', `${AURA(g, p.acc)}
    ${o.back || ''}
    <path d="M10 58 C8 40 18 26 32 26 C46 26 56 40 54 58Z" fill="${p.dark}"/>
    <path d="M17 56 C16 42 23 32 32 32 C41 32 48 42 47 56Z" fill="${p.mid}"/>
    <path d="M24 52 C24 43 27 38 32 38 C37 38 40 43 40 52Z" fill="${p.light}"/>
    ${o.plates || ''}
    <path d="M6 40 L14 34 L18 44 L10 50Z M58 40 L50 34 L46 44 L54 50Z" fill="${p.dark}"/>
    <ellipse cx="32" cy="22" rx="11" ry="9" fill="${p.head || p.dark}"/>
    ${o.horns || ''}
    ${eyes(32, 21, 4.6, p.eye || '#ffd98a', 2.1)}
    ${o.mouth || `<path d="M27 27 L37 27" stroke="#241810" stroke-width="2.2"/>`}
    ${o.front || ''}${GROUND(24, .4)}`);
}

// ---------- パレット ----------
const PAL = {
  ember: { dark: '#5e2418', mid: '#8c3620', light: '#c05a2c', acc: '#e0623c', eye: '#ffd23c' },
  ash: { dark: '#4e3028', mid: '#7d4732', light: '#b56a42', acc: '#ff8a3c', eye: '#ff6b3c' },
  blaze: { dark: '#7a2c10', mid: '#c05a18', light: '#f0983c', acc: '#ffca4a', eye: '#fff0a0' },
  magma: { dark: '#542c1e', mid: '#8a4c2c', light: '#c07038', acc: '#ff7a2c', eye: '#ffb04a' },
  deepsea: { dark: '#1c4a70', mid: '#2f7aab', light: '#63b0d8', acc: '#7fd4e8', eye: '#d8f7ff' },
  abyss: { dark: '#1a3350', mid: '#2b5a80', light: '#4a86ac', acc: '#63d0c0', eye: '#b8f7e8' },
  pale: { dark: '#2c5f7a', mid: '#4e93b5', light: '#a5dced', acc: '#d8f2ff', eye: '#ffffff' },
  river: { dark: '#1f4a4a', mid: '#2f7a72', light: '#5fb0a0', acc: '#8fe0c8', eye: '#e0fff5' },
  sky: { dark: '#4c7a52', mid: '#6f9c6b', light: '#a8cfa0', acc: '#d9c46b', eye: '#fffbe0' },
  storm: { dark: '#4a6b80', mid: '#7099ae', light: '#a8c9d6', acc: '#e0f0f7', eye: '#ffffff' },
  breeze: { dark: '#5a7a5c', mid: '#8fbf8a', light: '#cfe8c0', acc: '#f0e4a0', eye: '#ffffff' },
  royal: { dark: '#6b5a2a', mid: '#a58a3c', light: '#dcc06a', acc: '#f0e0a0', eye: '#fff0b8' },
  loam: { dark: '#4c3826', mid: '#6d5136', light: '#a6845a', acc: '#c9a05a', eye: '#ffd98a' },
  moss: { dark: '#3a4a2a', mid: '#5c6f3c', light: '#8a9c5c', acc: '#b8c47a', eye: '#f0ffb8' },
  stone: { dark: '#4a4a4a', mid: '#6e6e6e', light: '#9a9a9a', acc: '#c0c0c0', eye: '#8fe0ff' },
  sand: { dark: '#5a4630', mid: '#8a6b42', light: '#c0a068', acc: '#e0c48a', eye: '#ffdf9a' },
  wyrm: { dark: '#4b3a6e', mid: '#6a51a0', light: '#a68fd6', acc: '#c9b0f0', eye: '#ffe066' },
  behe: { dark: '#4c3d68', mid: '#6f5a92', light: '#9c88bd', acc: '#c0aade', eye: '#ffcf6b' },
  titan: { dark: '#42425e', mid: '#65658a', light: '#9a9ab8', acc: '#c8c8e0', eye: '#e0f0ff' },
  hydra: { dark: '#3b6050', mid: '#548468', light: '#82b28c', acc: '#9ad0a0', eye: '#c8ff9a' },
};

// ---------- 種族20体 ----------
const SPECIES_ART = {
  // 火
  salamander: () => A_quad(PAL.ember, {
    tail: `<path d="M18 42 C6 40 2 28 8 20 C8 30 14 36 20 40Z" fill="${PAL.ember.mid}"/>${flameTuft(7, 22, 13, '#e0623c', '#ffd23c')}`,
    mane: `<path d="M41 38 L42 28 L46 34 L48 24 L52 32 L54 26 L55 34Z" fill="#e0623c"/>`,
    horns: `<path d="M56 19 L62 11 L61 22Z" fill="#ffb04a"/>`,
    front: `<path d="M24 36 L28 30 L31 36Z" fill="#ff9a4a" opacity=".7"/>`,
  }),
  hellhound: () => A_quad(PAL.ash, {
    mane: `<path d="M39 40 L40 28 L44 34 L47 22 L51 31 L55 25 L56 35Z" fill="#2a1814"/>`,
    horns: hornPair(52, 19, 9, '#d8c8b8', 5),
    front: `${flameTuft(24, 32, 9, '#ff8a3c', '#ffd23c')}${flameTuft(16, 38, 7, '#ff8a3c', '#ffd23c')}`,
    snout: `<path d="M56 23 C62 21 64 25 63 30 L55 31Z" fill="${PAL.ash.dark}"/><path d="M57 27 L58 31 M61 26 L62 30" stroke="#f0e0c0" stroke-width="1"/>`,
  }),
  ifrit: () => A_biped(PAL.blaze, {
    bulk: 3,
    hair: `${flameTuft(32, 12, 16, '#ff8a3c', '#ffe066')}${flameTuft(24, 15, 9, '#ff8a3c', '#ffd23c')}${flameTuft(40, 15, 9, '#ff8a3c', '#ffd23c')}`,
    horns: hornPair(32, 14, 10, '#f0e0b0', 8),
    arms: `<path d="M47 30 L58 38 L53 43 L43 35Z" fill="${PAL.blaze.dark}"/><path d="M17 30 L6 38 L11 43 L21 35Z" fill="${PAL.blaze.dark}"/>`,
    front: `<circle cx="8" cy="36" r="5" fill="#ff8a3c" opacity=".8"/><circle cx="56" cy="36" r="5" fill="#ff8a3c" opacity=".8"/>
      <path d="M26 34 L38 34 L36 42 L28 42Z" fill="#ffca4a" opacity=".85"/>`,
  }),
  magma_golem: () => A_mass(PAL.magma, {
    plates: `<path d="M18 44 L28 40 L26 52 L17 54Z M38 40 L48 46 L46 56 L36 52Z" fill="#8c4a2a"/>
      <path d="M22 34 C26 30 38 30 42 34 L40 40 L24 40Z" fill="#ff7a2c" opacity=".55"/>`,
    horns: `<path d="M22 16 L18 6 L27 13Z M42 16 L46 6 L37 13Z" fill="#5e3424"/>`,
    front: `<path d="M14 50 C18 46 22 48 20 54Z M50 46 C46 44 42 47 45 52Z" fill="#ff7a2c" opacity=".7"/>
      ${flameTuft(32, 12, 8, '#ff7a2c', '#ffd23c')}`,
    mouth: `<path d="M26 27 L38 27 L36 30 L28 30Z" fill="#ff7a2c"/>`,
  }),
  // 水
  siren: () => A_biped(PAL.pale, {
    hair: `<path d="M23 18 C21 6 43 6 41 18 L41 10 C38 4 26 4 23 10Z" fill="#2c5f7a"/>
      <path d="M23 16 C18 24 18 36 22 44 L26 42 C23 34 23 24 26 18Z" fill="#2c5f7a"/>
      <path d="M41 16 C46 24 46 36 42 44 L38 42 C41 34 41 24 38 18Z" fill="#2c5f7a"/>`,
    horns: `<path d="M24 14 L16 6 L26 12Z M40 14 L48 6 L38 12Z" fill="#a5dced"/>`,
    front: `<path d="M26 44 C28 52 26 58 22 61 L42 61 C38 58 36 52 38 44Z" fill="#4e93b5"/>
      <path d="M22 61 C16 56 14 50 16 46 C20 50 22 55 24 60Z M42 61 C48 56 50 50 48 46 C44 50 42 55 40 60Z" fill="#a5dced"/>
      <ellipse cx="32" cy="61" rx="16" ry="2.5" fill="#000" opacity=".3"/>`,
  }),
  kraken: () => A_mass(PAL.deepsea, {
    back: `<path d="M22 44 C12 46 4 40 1 30 C6 42 14 46 24 47Z" fill="${PAL.deepsea.dark}"/>
      <path d="M42 44 C52 46 60 40 63 30 C58 42 50 46 40 47Z" fill="${PAL.deepsea.dark}"/>`,
    plates: `${[0, 1, 2].map(i => `<circle cx="${24 + i * 8}" cy="${44 + (i % 2) * 6}" r="2.6" fill="${PAL.deepsea.light}" opacity=".6"/>`).join('')}`,
    horns: `<path d="M32 11 C22 11 18 18 21 25 L43 25 C46 18 42 11 32 11Z" fill="${PAL.deepsea.dark}"/>
      <ellipse cx="32" cy="16" rx="9" ry="4" fill="${PAL.deepsea.light}" opacity=".5"/>`,
    front: `${[[18, 3], [26, 5], [38, 5], [46, 3]].map(([x, w], i) => `<path d="M${x} 50 C${x - 14 + i * 9} 56 ${x - 18 + i * 12} 60 ${x - 16 + i * 11} 62" stroke="${PAL.deepsea.mid}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`).join('')}
      <path d="M14 46 C6 50 3 58 4 62" stroke="${PAL.deepsea.light}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M50 46 C58 50 61 58 60 62" stroke="${PAL.deepsea.light}" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${[[8, 56], [56, 56], [20, 60], [44, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${PAL.deepsea.acc}" opacity=".8"/>`).join('')}`,
    mouth: `<path d="M27 28 L37 28 L34 33 L30 33Z" fill="#0e2436"/>`,
  }),
  undine: () => A_biped(PAL.abyss, {
    hair: `<path d="M22 18 C20 4 44 4 42 18 L42 9 C38 2 26 2 22 9Z" fill="#63d0c0"/>
      <path d="M22 18 C14 28 14 44 20 52 L25 48 C21 40 20 28 25 20Z" fill="#63d0c0" opacity=".85"/>`,
    front: `<path d="M20 44 C22 52 20 58 17 61 L47 61 C44 58 42 52 44 44Z" fill="#2b5a80" opacity=".9"/>
      <circle cx="14" cy="30" r="3" fill="#b8f7e8" opacity=".7"/><circle cx="50" cy="24" r="2.2" fill="#b8f7e8" opacity=".6"/>
      <ellipse cx="32" cy="61" rx="18" ry="2.5" fill="#000" opacity=".25"/>`,
  }),
  mizuchi: () => A_serpent(PAL.river, {
    crest: `<path d="M20 42 L17 32 L26 40Z M31 44 L32 34 L38 42Z" fill="${PAL.river.acc}"/>`,
    horns: `<path d="M47 24 L44 12 L52 22Z M56 25 L62 15 L61 27Z" fill="${PAL.river.acc}"/>`,
    front: `<path d="M46 38 C48 42 44 44 42 41Z" fill="${PAL.river.light}"/>
      <path d="M50 43 C56 46 60 44 62 40" stroke="${PAL.river.light}" stroke-width="1.6" fill="none"/>`,
  }),
  // 風
  harpy: () => A_wing(PAL.breeze, {
    wingBack: featherWing(28, 30, 1, PAL.breeze.dark, '#3f5a3c'),
    wingFront: featherWing(34, 27, 1.05, PAL.breeze.light, PAL.breeze.dark),
    beak: `<path d="M53 26 L61 25 L60 30 L53 30Z" fill="#e0b84a"/>`,
    horns: `<path d="M42 22 C40 12 52 12 51 21" fill="#5a7a5c"/>`,
    tail: `<path d="M22 42 L6 48 L14 42 L5 40Z M22 44 L8 54 L16 46Z" fill="${PAL.breeze.light}"/>`,
  }),
  wyvern: () => A_wing(PAL.storm, {
    wingBack: batWing(28, 28, 1.15, PAL.storm.dark, '#28394a'),
    wingFront: batWing(34, 26, 1.2, PAL.storm.mid, PAL.storm.dark),
    beak: `<path d="M52 26 C58 24 63 26 63 30 L52 32Z" fill="${PAL.storm.dark}"/><path d="M54 30 L55 33 M58 29 L59 32" stroke="#e8f0f5" stroke-width="1"/>`,
    horns: `<path d="M44 22 L40 12 L49 20Z" fill="#cfe4ec"/>`,
    tail: `<path d="M22 44 C10 48 6 56 2 58 L10 58 C16 54 20 50 24 48Z" fill="${PAL.storm.mid}"/><path d="M4 58 L0 52 L8 55Z" fill="#cfe4ec"/>`,
  }),
  sylph: () => A_biped(PAL.breeze, {
    hair: `<path d="M23 16 C20 4 44 4 41 16 L41 8 C37 2 27 2 23 8Z" fill="#cfe8c0"/>
      <path d="M41 12 C50 14 54 8 56 3 C52 12 50 18 42 18Z" fill="#cfe8c0" opacity=".9"/>`,
    back: `${featherWing(26, 28, .85, '#e6f5da', '#a8cfa0')}<g transform="scale(-1,1) translate(-64,0)">${featherWing(26, 28, .85, '#e6f5da', '#a8cfa0')}</g>`,
    front: `<path d="M22 44 C24 52 22 58 19 61 L45 61 C42 58 40 52 42 44Z" fill="#cfe8c0" opacity=".55"/>
      <path d="M8 20 q10 -4 20 0" stroke="#e6f5da" stroke-width="1.6" fill="none" opacity=".8"/>
      <path d="M40 14 q10 -4 18 0" stroke="#e6f5da" stroke-width="1.6" fill="none" opacity=".6"/>
      <ellipse cx="32" cy="61" rx="15" ry="2.5" fill="#000" opacity=".2"/>`,
  }),
  griffon: () => A_wing(PAL.royal, {
    wingBack: featherWing(28, 28, 1.1, '#8a7430', '#5c4c1c'),
    wingFront: featherWing(34, 26, 1.15, PAL.royal.light, PAL.royal.dark),
    beak: `<path d="M53 25 C60 23 63 26 62 30 L53 31Z" fill="#e8c05a"/>`,
    horns: `<path d="M42 22 C41 14 50 12 52 19Z" fill="#dcc06a"/>`,
    tail: `<path d="M22 44 C12 46 8 54 6 58 L12 58 C16 52 20 48 24 47Z" fill="${PAL.royal.mid}"/><path d="M6 58 C2 54 4 48 8 46 C7 51 8 55 11 58Z" fill="${PAL.royal.light}"/>`,
    front: `<path d="M26 44 L25 58 L31 58 L31 46Z" fill="${PAL.royal.dark}"/>`,
  }),
  // 土
  orc: () => A_biped(PAL.moss, {
    bulk: 4,
    hair: `<path d="M23 12 L41 12 L41 17 L23 17Z" fill="#2a3a1c"/>`,
    horns: `<path d="M25 22 L21 16 L28 20Z M39 22 L43 16 L36 20Z" fill="#e0dcc0"/>`,
    arms: `<path d="M48 30 L58 38 L52 44 L43 36Z" fill="${PAL.moss.dark}"/><path d="M16 30 L6 38 L12 44 L21 36Z" fill="${PAL.moss.dark}"/>`,
    front: `<path d="M29 22 L31 26 M35 22 L33 26" stroke="#e0dcc0" stroke-width="2" stroke-linecap="round"/>
      <path d="M55 40 L61 14" stroke="#6b5233" stroke-width="3.5" stroke-linecap="round"/><path d="M57 20 L64 10 L62 22Z" fill="#9aa6ac"/>`,
  }),
  troll: () => A_mass(PAL.moss, {
    plates: `<path d="M20 42 C24 38 40 38 44 42 L42 50 L22 50Z" fill="#4a5c30"/>`,
    horns: `<path d="M23 18 L18 8 L28 15Z M41 18 L46 8 L36 15Z" fill="#c9c0a0"/>`,
    mouth: `<path d="M26 27 L38 27 L36 31 L28 31Z" fill="#241810"/><path d="M28 27 L29 31 M36 27 L35 31" stroke="#e0dcc0" stroke-width="1.4"/>`,
    front: `<path d="M8 44 C2 40 4 32 10 30 L14 40Z" fill="${PAL.moss.dark}"/>
      <path d="M56 44 C62 40 60 32 54 30 L50 40Z" fill="${PAL.moss.dark}"/>`,
  }),
  golem: () => A_mass(PAL.stone, {
    plates: `<path d="M16 32 L28 28 L28 42 L16 44Z M36 28 L48 32 L48 44 L36 42Z" fill="#5a5a5a"/>
      <path d="M26 44 L38 44 L38 56 L26 56Z" fill="#7e7e7e"/>
      <path d="M20 50 L26 48 M44 50 L38 48" stroke="#3a3a3a" stroke-width="2"/>`,
    horns: `<path d="M21 16 L16 8 L26 14Z M43 16 L48 8 L38 14Z" fill="#6e6e6e"/>`,
    mouth: `<path d="M25 26 L39 26 L39 30 L25 30Z" fill="#2a2a2a"/>`,
    front: `<circle cx="32" cy="40" r="4" fill="#8fe0ff" opacity=".85"/><circle cx="32" cy="40" r="7" fill="#8fe0ff" opacity=".25"/>`,
  }),
  antlion: () => A_mass(PAL.sand, {
    back: `<path d="M4 58 C0 50 6 44 12 46 L16 54Z M60 58 C64 50 58 44 52 46 L48 54Z" fill="${PAL.sand.dark}"/>`,
    plates: `${[0, 1, 2].map(i => `<path d="M${18 + i * 2} ${38 + i * 6} C24 ${34 + i * 6} 40 ${34 + i * 6} ${46 - i * 2} ${38 + i * 6}" stroke="${PAL.sand.dark}" stroke-width="2.4" fill="none"/>`).join('')}`,
    horns: `<path d="M22 20 C14 16 8 8 10 4 C16 8 20 14 25 17Z" fill="#c0a068"/>
      <path d="M42 20 C50 16 56 8 54 4 C48 8 44 14 39 17Z" fill="#c0a068"/>`,
    mouth: `<path d="M28 27 L36 27 L34 30 L30 30Z" fill="#3a2a18"/>`,
    front: `<path d="M12 52 L20 48 M52 52 L44 48" stroke="${PAL.sand.dark}" stroke-width="3" stroke-linecap="round"/>`,
  }),
  // 対大型
  dragon: () => A_wing(PAL.wyrm, {
    wingBack: batWing(26, 26, 1.35, '#3b2a5c', '#2a1e42'),
    wingFront: batWing(33, 24, 1.4, PAL.wyrm.mid, PAL.wyrm.dark),
    beak: `<path d="M52 24 C60 22 64 25 63 29 L52 31Z" fill="${PAL.wyrm.mid}"/><path d="M55 29 L56 32 M59 28 L60 31" stroke="#e8e0cf" stroke-width="1"/>`,
    horns: `<path d="M44 22 L40 10 L49 19Z M50 20 L56 9 L56 20Z" fill="#e8e0cf"/>`,
    tail: `<path d="M22 44 C10 48 6 56 2 58 L10 58 C16 54 20 50 24 48Z" fill="${PAL.wyrm.mid}"/><path d="M3 58 L0 50 L9 55Z" fill="#e8e0cf"/>`,
    front: `<path d="M28 32 L36 32 L34 40 L30 40Z" fill="${PAL.wyrm.light}" opacity=".7"/>`,
  }),
  behemoth: () => A_mass(PAL.behe, {
    plates: `<path d="M14 36 L26 30 L26 44 L15 48Z M38 30 L50 36 L49 48 L38 44Z" fill="#4a3c66"/>
      <path d="M22 30 L26 20 L32 28 L38 20 L42 30Z" fill="#4a3c66"/>`,
    horns: `<path d="M21 18 C12 14 8 6 12 2 C16 8 20 12 26 15Z M43 18 C52 14 56 6 52 2 C48 8 44 12 38 15Z" fill="#e0d8c0"/>`,
    mouth: `<path d="M25 27 L39 27 L37 32 L27 32Z" fill="#1c1226"/><path d="M28 27 L29 32 M36 27 L35 32" stroke="#e0d8c0" stroke-width="1.4"/>`,
    front: `<path d="M6 50 L14 46 M58 50 L50 46" stroke="${PAL.behe.dark}" stroke-width="4" stroke-linecap="round"/>`,
  }),
  gigas: () => A_biped(PAL.titan, {
    bulk: 7,
    hair: `<path d="M22 12 L42 12 L42 16 L22 16Z" fill="#33334a"/>`,
    horns: `<path d="M23 14 L17 4 L28 11Z M41 14 L47 4 L36 11Z" fill="#c8c8e0"/>`,
    arms: `<path d="M51 28 L62 40 L55 46 L45 34Z" fill="${PAL.titan.dark}"/><path d="M13 28 L2 40 L9 46 L19 34Z" fill="${PAL.titan.dark}"/>`,
    front: `<path d="M24 30 L40 30 L40 36 L24 36Z" fill="${PAL.titan.acc}" opacity=".5"/>
      <path d="M32 30 L32 46" stroke="${PAL.titan.dark}" stroke-width="2"/>
      <circle cx="6" cy="42" r="5" fill="${PAL.titan.mid}"/><circle cx="58" cy="42" r="5" fill="${PAL.titan.mid}"/>`,
  }),
  hydra: () => A_serpent(PAL.hydra, {
    back: `<path d="M28 46 C30 32 20 26 14 22" stroke="${PAL.hydra.dark}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M10 22 C6 18 8 12 14 13 C20 14 20 22 14 24 C12 25 11 24 10 22Z" fill="${PAL.hydra.dark}"/>
      <circle cx="13" cy="18" r="1.6" fill="#c8ff9a"/>
      <path d="M32 46 C36 30 34 22 32 16" stroke="${PAL.hydra.dark}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M28 14 C26 8 32 4 37 7 C42 10 40 17 34 17 C31 17 29 16 28 14Z" fill="${PAL.hydra.dark}"/>
      <circle cx="34" cy="11" r="1.6" fill="#c8ff9a"/>`,
    crest: `<path d="M20 44 L18 36 L26 42Z" fill="${PAL.hydra.acc}"/>`,
    horns: `<path d="M46 24 L43 14 L51 22Z" fill="${PAL.hydra.acc}"/>`,
    front: `<path d="M50 43 C56 46 60 44 62 40" stroke="${PAL.hydra.light}" stroke-width="1.6" fill="none"/>`,
  }),
};


// ---------- 追加種族(20) パレット ----------
Object.assign(PAL, {
  imp: { dark: '#5a2a3a', mid: '#8c3c4c', light: '#c85a5a', acc: '#ff9a4a', eye: '#ffe066' },
  phoenix: { dark: '#8a3a10', mid: '#d0642a', light: '#ffa040', acc: '#ffe27a', eye: '#fff7d0' },
  cinder: { dark: '#3a2a2a', mid: '#5c3c34', light: '#8a5a48', acc: '#ff6a2c', eye: '#ffb04a' },
  wraith: { dark: '#3a3540', mid: '#5c5468', light: '#8a8095', acc: '#ff7a3c', eye: '#ff9a3c' },
  merrow: { dark: '#1e5a60', mid: '#2f8a90', light: '#6fc4c0', acc: '#c8f0e0', eye: '#ffffff' },
  frost: { dark: '#3a5a80', mid: '#6a90b8', light: '#b8dcf0', acc: '#e8f8ff', eye: '#d0f0ff' },
  slime: { dark: '#2a6a7a', mid: '#3a9ab0', light: '#7ad0e0', acc: '#c8f0ff', eye: '#ffffff' },
  levi: { dark: '#12304a', mid: '#1f5578', light: '#3f8ab0', acc: '#7fd0f0', eye: '#e0ffff' },
  thunder: { dark: '#3a3a5a', mid: '#5c5c8a', light: '#9a9ac8', acc: '#ffe066', eye: '#ffffff' },
  gale: { dark: '#7a5a3a', mid: '#b08a5a', light: '#e0c48a', acc: '#f0f0e0', eye: '#4a3a2a' },
  djinn: { dark: '#4a5a7a', mid: '#7a90b0', light: '#b8c8e0', acc: '#e8f0ff', eye: '#ffffff' },
  ray: { dark: '#5a6a80', mid: '#8a9ab0', light: '#c8d4e0', acc: '#f0f4f8', eye: '#ffffff' },
  goblin: { dark: '#3a4a2a', mid: '#5c7a3c', light: '#8aa85a', acc: '#e0c48a', eye: '#ffe066' },
  zombie: { dark: '#3a3a30', mid: '#5c5c48', light: '#8a8a6a', acc: '#a8b890', eye: '#c8ff9a' },
  treant: { dark: '#3a2c1c', mid: '#5c4630', light: '#8a6c48', acc: '#7aa050', eye: '#c8ff9a' },
  basilisk: { dark: '#4a4a20', mid: '#7a7a30', light: '#a8a850', acc: '#e0e070', eye: '#ff4a4a' },
  cyclops: { dark: '#5a4030', mid: '#8a6048', light: '#b88868', acc: '#d0b090', eye: '#ffe066' },
  bone: { dark: '#6a6a60', mid: '#9a9a8a', light: '#d0d0c0', acc: '#e8e8d8', eye: '#8fe0ff' },
  turtle: { dark: '#2a4a3a', mid: '#3c6a50', light: '#5c8a68', acc: '#8ab088', eye: '#ffd98a' },
  ape: { dark: '#3a2a20', mid: '#5c4030', light: '#8a6048', acc: '#c0a080', eye: '#ffd98a' },
});

// ---------- 追加種族(20) ----------
Object.assign(SPECIES_ART, {
  // 火
  fire_imp: () => A_biped(PAL.imp, {
    horns: hornPair(32, 13, 8, '#f0e0b0', 6),
    back: batWing(24, 30, .7, PAL.imp.dark, PAL.imp.dark) + `<g transform="scale(-1,1) translate(-64,0)">${batWing(24, 30, .7, PAL.imp.dark, PAL.imp.dark)}</g>`,
    front: `<path d="M40 46 C48 50 52 46 54 40" stroke="${PAL.imp.mid}" stroke-width="2.4" fill="none"/><path d="M54 40 L58 36 L57 42Z" fill="${PAL.imp.acc}"/>${flameTuft(32, 6, 6, '#ff9a4a', '#ffe066')}`,
  }),
  phoenix: () => A_wing(PAL.phoenix, {
    wingBack: featherWing(28, 30, 1.1, PAL.phoenix.mid, PAL.phoenix.dark),
    wingFront: featherWing(34, 27, 1.15, PAL.phoenix.light, PAL.phoenix.mid),
    horns: `${flameTuft(47, 20, 10, '#ffa040', '#ffe27a')}${flameTuft(43, 22, 7, '#ffa040', '#ffe27a')}`,
    tail: `<path d="M22 42 C12 46 6 54 2 60 L8 58 C12 52 16 48 24 46Z" fill="${PAL.phoenix.acc}"/>${flameTuft(6, 58, 8, '#ffa040', '#ffe27a')}`,
    beak: `<path d="M53 27 L61 26 L60 30 L53 30Z" fill="#ffe27a"/>`,
  }),
  cinder_wolf: () => A_quad(PAL.cinder, {
    mane: `<path d="M40 40 L41 30 L45 35 L48 26 L52 33 L55 28 L56 36Z" fill="${PAL.cinder.dark}"/>`,
    front: `<path d="M20 38 L26 34 L30 40 L36 34 L40 40" stroke="#ff6a2c" stroke-width="1.6" fill="none" opacity=".8"/>`,
    snout: `<path d="M56 23 C63 21 65 26 63 30 L55 31Z" fill="${PAL.cinder.dark}"/>`,
    tail: `<path d="M18 42 C8 44 4 36 8 28 C10 36 14 38 20 40Z" fill="${PAL.cinder.mid}"/>${flameTuft(8, 30, 8, '#ff6a2c', '#ffb04a')}`,
  }),
  ash_wraith: () => A_biped(PAL.wraith, {
    hair: `<path d="M22 14 C22 2 42 2 42 14 C40 8 24 8 22 14Z" fill="${PAL.wraith.dark}"/>`,
    arms: `<path d="M44 30 C52 30 56 36 54 44 L48 42 C48 38 46 34 42 34Z" fill="${PAL.wraith.mid}" opacity=".8"/><path d="M20 30 C12 30 8 36 10 44 L16 42 C16 38 18 34 22 34Z" fill="${PAL.wraith.mid}" opacity=".8"/>`,
    front: `<path d="M20 47 C22 56 20 60 16 62 L48 62 C44 60 42 56 44 47Z" fill="${PAL.wraith.mid}" opacity=".5"/><ellipse cx="32" cy="18" rx="9" ry="9" fill="${PAL.wraith.dark}" opacity=".6"/>${eyes(32, 18, 3.6, '#ff9a3c', 2)}`,
  }),
  // 水
  merrow: () => A_biped(PAL.merrow, {
    hair: `<path d="M22 14 C20 6 44 6 42 14 C40 8 24 8 22 14Z M40 12 C48 14 52 20 50 28 C48 20 44 16 40 16Z" fill="#c8f0e0"/>`,
    front: `<path d="M22 44 C24 52 20 58 12 60 L52 60 C44 58 40 52 42 44Z" fill="${PAL.merrow.mid}"/><path d="M12 60 L6 54 L14 56 M52 60 L58 54 L50 56Z" fill="${PAL.merrow.light}"/>
      <path d="M26 46 L38 46 M26 50 L38 50 M27 54 L37 54" stroke="${PAL.merrow.light}" stroke-width="1" opacity=".7"/>`,
  }),
  frost_serpent: () => A_serpent(PAL.frost, {
    crest: `<path d="M20 44 L18 34 L26 42Z M28 52 L26 42 L34 50Z" fill="${PAL.frost.acc}"/>`,
    horns: `<path d="M44 26 L40 16 L48 24Z M52 24 L52 14 L56 24Z" fill="#e8f8ff"/>`,
    front: `<path d="M8 58 L4 52 M14 56 L12 50" stroke="#e8f8ff" stroke-width="1.4" opacity=".7"/>`,
  }),
  slime_king: () => A_mass(PAL.slime, {
    plates: `<circle cx="24" cy="46" r="3" fill="${PAL.slime.acc}" opacity=".6"/><circle cx="40" cy="42" r="2.4" fill="${PAL.slime.acc}" opacity=".6"/><circle cx="34" cy="50" r="2" fill="${PAL.slime.acc}" opacity=".6"/>`,
    horns: `<path d="M22 16 L24 6 L27 15 L32 5 L37 15 L40 6 L42 16Z" fill="#ffd23c"/>`,
    mouth: `<path d="M26 27 C29 31 35 31 38 27" stroke="#1a3a44" stroke-width="2" fill="none"/>`,
  }),
  leviathan_whelp: () => A_serpent(PAL.levi, {
    crest: `<path d="M18 44 L14 32 L24 40 L22 30 L30 42Z" fill="${PAL.levi.acc}"/>`,
    horns: `<path d="M44 26 L42 14 L50 24Z" fill="${PAL.levi.light}"/>`,
    back: `<path d="M34 50 C30 40 34 34 40 34" stroke="${PAL.levi.acc}" stroke-width="2" fill="none" opacity=".7"/>`,
    front: `<path d="M8 58 C4 54 6 48 12 48" stroke="${PAL.levi.acc}" stroke-width="2" fill="none"/>`,
  }),
  // 風
  thunderbird: () => A_wing(PAL.thunder, {
    wingBack: featherWing(28, 30, 1.15, PAL.thunder.dark, '#2a2a40'),
    wingFront: featherWing(34, 27, 1.2, PAL.thunder.mid, PAL.thunder.dark),
    horns: `<path d="M44 22 L40 12 L46 18 L48 8 L50 20Z" fill="#ffe066"/>`,
    beak: `<path d="M53 27 L62 26 L60 31 L53 31Z" fill="#ffe066"/>`,
    front: `<path d="M12 22 L16 28 L12 30 L18 38" stroke="#ffe066" stroke-width="1.6" fill="none"/>`,
  }),
  gale_fox: () => A_quad(PAL.gale, {
    tail: `<path d="M18 42 C4 44 0 30 8 22 C6 32 12 38 20 40Z" fill="${PAL.gale.light}"/><path d="M8 22 C4 30 6 36 12 38" stroke="${PAL.gale.acc}" stroke-width="3" fill="none"/>
      <path d="M22 44 C10 50 4 46 6 40" stroke="${PAL.gale.mid}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    horns: `<path d="M48 19 L45 8 L53 17Z M56 18 L60 8 L59 18Z" fill="${PAL.gale.mid}"/>`,
    snout: `<path d="M56 24 C62 22 64 26 63 29 L55 30Z" fill="${PAL.gale.acc}"/>`,
    front: `<path d="M22 34 C28 30 36 30 42 34" stroke="${PAL.gale.acc}" stroke-width="2" fill="none" opacity=".8"/>`,
  }),
  storm_djinn: () => A_biped(PAL.djinn, {
    hair: `<path d="M22 14 C22 4 42 4 42 14 L44 6 C48 2 52 4 54 8 C50 6 46 8 44 12Z" fill="${PAL.djinn.light}"/>`,
    bulk: 2,
    front: `<path d="M20 47 C24 56 26 60 22 62 C34 58 36 52 32 46 C36 52 40 58 44 62 C40 60 42 56 46 47Z" fill="${PAL.djinn.mid}" opacity=".7"/>
      <path d="M6 30 C10 26 14 30 10 34 M58 30 C54 26 50 30 54 34" stroke="${PAL.djinn.acc}" stroke-width="1.6" fill="none"/>
      <path d="M12 44 L14 40 L11 38 L15 34" stroke="#ffe066" stroke-width="1.4" fill="none"/>`,
  }),
  cloud_ray: () => A_wing(PAL.ray, {
    wingBack: `<path d="M30 34 C14 24 4 30 6 40 C12 38 20 40 30 44Z" fill="${PAL.ray.dark}"/>`,
    wingFront: `<path d="M34 32 C50 22 62 28 60 38 C54 36 46 38 34 42Z" fill="${PAL.ray.mid}"/>`,
    tail: `<path d="M22 44 C16 52 12 58 6 60 L10 54 C14 50 18 48 22 46Z" fill="${PAL.ray.dark}"/>`,
    beak: `<path d="M53 28 C58 27 60 30 58 32 L53 31Z" fill="${PAL.ray.light}"/>`,
    front: `<circle cx="20" cy="38" r="2" fill="${PAL.ray.acc}" opacity=".7"/><circle cx="46" cy="36" r="2" fill="${PAL.ray.acc}" opacity=".7"/>`,
  }),
  // 土
  goblin: () => A_biped(PAL.goblin, {
    hair: `<path d="M22 16 L20 6 L28 12 L32 4 L36 12 L44 6 L42 16Z" fill="${PAL.goblin.dark}"/>`,
    horns: `<path d="M22 18 L12 14 L21 22Z M42 18 L52 14 L43 22Z" fill="${PAL.goblin.mid}"/>`,
    front: `<path d="M44 34 L56 26 L58 30 L47 38Z" fill="#8a6a40"/><path d="M55 22 L62 20 L60 30 L56 30Z" fill="#a0a0a0"/><path d="M28 32 L36 32 L35 40 L29 40Z" fill="${PAL.goblin.acc}" opacity=".6"/>`,
  }),
  dwarf_zombie: () => A_biped(PAL.zombie, {
    bulk: 3,
    hair: `<path d="M22 22 C22 30 42 30 42 22 L42 34 C38 40 26 40 22 34Z" fill="#8a8a70"/><path d="M22 14 C22 6 42 6 42 14Z" fill="#6a6a58"/>`,
    front: `<path d="M24 32 L40 32 L40 36 L24 36Z M26 40 L38 40" stroke="${PAL.zombie.dark}" stroke-width="1.6" fill="none"/><path d="M8 34 L18 30 L20 36 L10 40Z" fill="#a0a0a0"/><path d="M6 30 L10 26 L12 32 L8 36Z" fill="#7a5a3a"/>
      <path d="M36 16 L40 14 M26 15 L28 19" stroke="#c8ff9a" stroke-width="1.2"/>`,
  }),
  treant: () => A_mass(PAL.treant, {
    plates: `<path d="M22 40 L24 56 M32 36 L32 56 M42 40 L40 56" stroke="${PAL.treant.dark}" stroke-width="2"/>`,
    horns: `<path d="M20 18 L10 4 L18 12 L14 2 L24 14 M44 18 L54 4 L46 12 L50 2 L40 14" stroke="${PAL.treant.dark}" stroke-width="3" fill="none"/>
      <circle cx="12" cy="6" r="4" fill="${PAL.treant.acc}"/><circle cx="20" cy="4" r="3" fill="${PAL.treant.acc}"/><circle cx="52" cy="6" r="4" fill="${PAL.treant.acc}"/><circle cx="44" cy="4" r="3" fill="${PAL.treant.acc}"/>`,
    mouth: `<path d="M27 27 C29 30 35 30 37 27" stroke="#241810" stroke-width="2" fill="none"/>`,
  }),
  basilisk: () => A_serpent(PAL.basilisk, {
    crest: `<path d="M20 44 L20 34 L26 42Z M28 52 L30 42 L34 50Z" fill="${PAL.basilisk.acc}"/>`,
    horns: `<path d="M44 26 L42 14 L50 24Z M52 24 L54 12 L58 24Z" fill="${PAL.basilisk.acc}"/>`,
    front: `<path d="M22 56 L26 62 M30 56 L34 62" stroke="${PAL.basilisk.dark}" stroke-width="3"/><circle cx="52" cy="32" r="3.2" fill="#ff4a4a"/><circle cx="52" cy="32" r="1.4" fill="#2a0000"/>`,
  }),
  // 対大型
  cyclops: () => A_biped(PAL.cyclops, {
    bulk: 5,
    hair: `<path d="M22 12 C22 4 42 4 42 12Z" fill="#3a2a20"/>`,
    front: `<circle cx="32" cy="18" r="9" fill="${PAL.cyclops.light}"/><circle cx="32" cy="18" r="4.4" fill="#ffffff"/><circle cx="32" cy="18" r="2.4" fill="#ffe066"/><circle cx="32" cy="18" r="1.1" fill="#000"/>
      <path d="M50 30 L60 20 L64 26 L54 38Z" fill="#7a5a3a"/><path d="M58 18 L66 14 L68 22 L62 26Z" fill="#8a8a8a"/><path d="M28 34 L36 34 L36 44 L28 44Z" fill="${PAL.cyclops.acc}" opacity=".5"/>`,
  }),
  bone_colossus: () => A_mass(PAL.bone, {
    plates: `<path d="M20 44 L44 44 M20 50 L44 50 M32 36 L32 56" stroke="${PAL.bone.dark}" stroke-width="2"/>`,
    horns: `<path d="M22 16 L16 4 L26 12Z M42 16 L48 4 L38 12Z" fill="${PAL.bone.light}"/>`,
    mouth: `<path d="M26 26 L38 26 L38 30 L26 30Z" fill="${PAL.bone.dark}"/><path d="M28 26 L28 30 M31 26 L31 30 M34 26 L34 30 M37 26 L37 30" stroke="${PAL.bone.light}" stroke-width="1"/>`,
    front: `<circle cx="27" cy="21" r="3.5" fill="#1a1a20"/><circle cx="37" cy="21" r="3.5" fill="#1a1a20"/><circle cx="27" cy="21" r="1.4" fill="#8fe0ff"/><circle cx="37" cy="21" r="1.4" fill="#8fe0ff"/>`,
  }),
  ancient_turtle: () => A_mass(PAL.turtle, {
    plates: `<path d="M18 40 L28 36 L30 46 L20 50Z M34 36 L46 40 L44 50 L34 46Z M26 48 L38 48 L36 56 L28 56Z" fill="${PAL.turtle.acc}" opacity=".7"/>
      <path d="M22 44 L42 44 M20 52 L44 52" stroke="${PAL.turtle.dark}" stroke-width="1.4"/>`,
    horns: `<path d="M20 22 L14 26 L20 28Z M44 22 L50 26 L44 28Z" fill="${PAL.turtle.dark}"/>`,
    front: `<circle cx="18" cy="12" r="3" fill="${PAL.turtle.acc}"/><circle cx="46" cy="10" r="2.4" fill="${PAL.turtle.acc}"/><path d="M14 14 L18 8 M46 12 L48 6" stroke="${PAL.turtle.dark}" stroke-width="1.4"/>`,
  }),
  titan_ape: () => A_mass(PAL.ape, {
    plates: `<path d="M24 40 C28 36 36 36 40 40 L40 52 L24 52Z" fill="${PAL.ape.acc}" opacity=".5"/>`,
    horns: `<path d="M22 20 C20 12 26 10 28 14 M42 20 C44 12 38 10 36 14" stroke="${PAL.ape.dark}" stroke-width="3" fill="none"/>`,
    mouth: `<path d="M26 27 L38 27 L36 31 L28 31Z" fill="#241810"/><path d="M28 27 L28 30 M36 27 L36 30" stroke="#f0e8d8" stroke-width="1.6"/>`,
    front: `<path d="M4 44 L12 32 L18 40 L10 54Z M60 44 L52 32 L46 40 L54 54Z" fill="${PAL.ape.mid}"/><path d="M6 52 L14 52 M50 52 L58 52" stroke="${PAL.ape.dark}" stroke-width="3"/>`,
  }),
});

// 立ち絵版(種族スプライトを拡大して枠に収める)
function portraitSpecies(key, attr) {
  const inner = SPECIES_ART[key]().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return SP('0 0 240 320', `
    <defs>${rgrad('ps' + key, [[0, C[attr], .35], [1, C.deep, 0]], .5, .42, .72)}</defs>
    <rect width="240" height="320" fill="${C.deep}" opacity=".4"/>
    <rect width="240" height="320" fill="url(#ps${key})"/>
    <g transform="translate(20,20) scale(3.1)">${inner}</g>
    <rect x="0" y="286" width="240" height="34" fill="${C.deep}" opacity=".55"/>
    <rect x="0" y="286" width="240" height="2" fill="${C[attr]}" opacity=".75"/>`);
}

// レジストリへ登録
Object.entries(SPECIES).forEach(([attr, list]) => {
  list.forEach(([key]) => {
    if (!SPECIES_ART[key]) return;
    ART['btl.sp_' + key] = () => SPECIES_ART[key]();
    ART['chr.sp_' + key] = () => portraitSpecies(key, attr);
  });
});
