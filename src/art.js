// ============================================================
// art.js — 全グラフィックをコード生成(SVG)。画像ファイル不要。
// ART[key]() が SVG文字列を返す。assets.js の img()/bgStyle() から参照。
// ============================================================
const C = {
  ink: '#e9dfcd', dim: '#a89bb5', line: '#463658', panel: '#221a2e', deep: '#15111d',
  gold: '#d9a441', red: '#d64c4c', green: '#5fb37a', blue: '#5b8fd6', purple: '#9b7bd6', amber: '#e0a83a',
  fire: '#e0623c', water: '#4d8fd1', wind: '#7fb77e', earth: '#b8894a', giant: '#9c7bd6',
  flesh: '#c9a68c', steel: '#c3ccd6', bone: '#e8e0cf',
};
const S = (vb, body, extra = '') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" ${extra}>${body}</svg>`;
// 立ち絵用: 枠いっぱいに埋める(はみ出しはトリミング)
const SP = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin slice">${body}</svg>`;
const SB = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">${body}</svg>`;
// 決定論的乱数(背景を毎回同じ絵にする)
const seeded = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const grad = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const rgrad = (id, stops, cx = .5, cy = .5, r = .6) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;

// ---------- 汎用パーツ ----------
const eyes = (x, y, d, c = '#fff9c4', r = 2.2) =>
  `<g fill="${c}"><ellipse cx="${x - d}" cy="${y}" rx="${r}" ry="${r * .8}"/><ellipse cx="${x + d}" cy="${y}" rx="${r}" ry="${r * .8}"/></g>`;
const glow = (id, c) => rgrad(id, [[0, c, .55], [1, c, 0]]);

// ============================================================
// 魔物スプライト(戦闘用・右向き / viewBox 0 0 64 64、足元=y64)
// ============================================================
function monFire(scale = 1) {
  return S('0 0 64 64', `
    <defs>${glow('gf', C.fire)}</defs>
    <ellipse cx="32" cy="34" rx="30" ry="28" fill="url(#gf)"/>
    <!-- 尾の炎 -->
    <path d="M14 46 C4 40 8 28 14 24 C12 34 18 36 16 46Z" fill="${C.fire}" opacity=".85"/>
    <!-- 胴 -->
    <path d="M16 46 C14 34 22 28 34 29 C46 30 52 36 50 46 L48 58 L42 58 L41 50 L26 50 L25 58 L19 58Z" fill="#5e2418"/>
    <path d="M20 44 C20 36 26 32 35 33 C44 34 48 38 47 46Z" fill="#8c3620"/>
    <!-- たてがみ -->
    <path d="M34 28 L38 18 L41 27 L46 20 L47 30 L52 26 L50 36 Z" fill="${C.fire}"/>
    <!-- 頭 -->
    <path d="M42 30 C42 24 48 21 54 23 C60 25 62 31 59 36 L50 38 C45 38 42 35 42 30Z" fill="#7a2e1c"/>
    <path d="M58 27 L63 20 L62 30Z" fill="${C.fire}"/>
    <path d="M50 26 L54 18 L55 27Z" fill="${C.fire}"/>
    <!-- 口 -->
    <path d="M56 34 L63 33 L62 37 L56 37Z" fill="#2a1010"/>
    <path d="M57 34 L58 37 M60 33 L61 37" stroke="${C.bone}" stroke-width="1"/>
    ${eyes(53, 29, 3.5, '#ffd23c', 2)}
    <!-- 脚 -->
    <path d="M24 50 L23 60 L28 60 L28 50Z M40 50 L39 60 L44 60 L44 50Z" fill="#4a1c12"/>
    <ellipse cx="32" cy="61" rx="22" ry="3" fill="#000" opacity=".35"/>`);
}
function monWater(scale = 1) {
  return S('0 0 64 64', `
    <defs>${glow('gw', C.water)}</defs>
    <ellipse cx="32" cy="34" rx="30" ry="28" fill="url(#gw)"/>
    <!-- 蛇腹の胴 -->
    <path d="M10 58 C4 50 12 44 20 46 C28 48 22 54 28 54 C36 54 34 40 42 38" stroke="#1f5d8c" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M10 58 C4 50 12 44 20 46 C28 48 22 54 28 54 C36 54 34 40 42 38" stroke="#3d8dc4" stroke-width="6" fill="none" stroke-linecap="round"/>
    <!-- 背びれ -->
    <path d="M22 44 L20 36 L27 42Z M32 46 L33 38 L38 44Z" fill="#7fd4e8" opacity=".9"/>
    <!-- 頭 -->
    <path d="M40 34 C40 27 47 24 54 27 C61 30 62 38 56 41 C50 44 41 41 40 34Z" fill="#2a6d9e"/>
    <path d="M44 30 C48 27 54 27 58 30 C54 31 48 31 44 30Z" fill="#57a8d8"/>
    <!-- ヒレ耳 -->
    <path d="M46 26 L44 16 L52 24Z" fill="#7fd4e8"/>
    <path d="M56 28 L62 20 L61 30Z" fill="#7fd4e8"/>
    ${eyes(53, 33, 3.5, '#c9f7ff', 2)}
    <path d="M58 38 L63 39 L58 41Z" fill="#123a56"/>
    <!-- 泡 -->
    <circle cx="14" cy="30" r="2.5" fill="#9fe4f5" opacity=".6"/><circle cx="20" cy="22" r="1.8" fill="#9fe4f5" opacity=".45"/><circle cx="10" cy="20" r="1.4" fill="#9fe4f5" opacity=".35"/>
    <ellipse cx="32" cy="61" rx="22" ry="3" fill="#000" opacity=".3"/>`);
}
function monWind(scale = 1) {
  return S('0 0 64 64', `
    <defs>${glow('gwd', C.wind)}</defs>
    <ellipse cx="32" cy="32" rx="30" ry="28" fill="url(#gwd)"/>
    <!-- 翼(奥) -->
    <path d="M28 30 C16 16 6 16 4 24 C12 24 16 30 20 38Z" fill="#4c7a52"/>
    <!-- 胴 -->
    <path d="M22 40 C22 30 30 26 38 28 C46 30 48 38 44 44 C40 50 26 50 22 40Z" fill="#6f9c6b"/>
    <path d="M26 40 C26 34 32 31 38 33 C43 35 44 40 41 44Z" fill="#a8cfa0"/>
    <!-- 翼(手前) -->
    <path d="M34 30 C26 12 12 8 8 16 C18 18 22 26 26 40Z" fill="#8fc48a"/>
    <path d="M34 30 C28 18 18 14 13 17" stroke="#5b8a5a" stroke-width="1.4" fill="none"/>
    <!-- 頭 -->
    <circle cx="47" cy="28" r="8" fill="#7fb77e"/>
    <path d="M52 24 L60 20 L58 26 L62 27 L52 31Z" fill="${C.gold}"/>
    ${eyes(47, 26, 3.2, '#fffbe0', 2)}
    <!-- 尾羽 -->
    <path d="M22 42 L8 50 L14 42 L6 42Z" fill="#8fc48a"/>
    <!-- 脚 -->
    <path d="M34 48 L33 58 M42 48 L43 58" stroke="${C.gold}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M30 58 L38 58 M40 58 L48 58" stroke="${C.gold}" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="38" cy="61" rx="20" ry="3" fill="#000" opacity=".3"/>`);
}
function monEarth(scale = 1) {
  return S('0 0 64 64', `
    <defs>${glow('ge', C.earth)}</defs>
    <ellipse cx="32" cy="36" rx="28" ry="26" fill="url(#ge)"/>
    <!-- 胴 -->
    <path d="M18 28 L46 26 L50 52 L16 54Z" fill="#6d5136"/>
    <path d="M22 31 L43 29 L45 48 L21 50Z" fill="#8a6a45"/>
    <path d="M26 34 L38 33 L39 44 L27 45Z" fill="#a6845a"/>
    <!-- 腕 -->
    <path d="M46 30 L58 34 L56 48 L46 44Z" fill="#5d452e"/>
    <path d="M18 30 L8 36 L11 48 L18 44Z" fill="#5d452e"/>
    <!-- 頭 -->
    <path d="M24 26 L42 24 L41 12 L26 13Z" fill="#7d5e3d"/>
    <path d="M27 16 L39 15 L39 21 L27 22Z" fill="#3a2a1c"/>
    ${eyes(33, 18.5, 4.5, '#ffd98a', 2)}
    <!-- 岩の突起 -->
    <path d="M42 12 L48 8 L46 16Z M20 14 L14 9 L19 19Z" fill="#5d452e"/>
    <!-- 脚 -->
    <path d="M20 54 L20 61 L29 61 L28 54Z M38 54 L38 61 L47 61 L46 54Z" fill="#4c3826"/>
    <ellipse cx="32" cy="62" rx="24" ry="2.5" fill="#000" opacity=".4"/>`);
}
function monGiant(scale = 1) {
  return S('0 0 64 64', `
    <defs>${glow('gg', C.giant)}</defs>
    <ellipse cx="32" cy="32" rx="31" ry="30" fill="url(#gg)"/>
    <!-- 翼 -->
    <path d="M26 28 C14 8 2 8 2 18 C10 18 12 26 16 34 L8 32 C14 40 20 40 26 38Z" fill="#5b4382"/>
    <path d="M26 28 C18 14 8 12 5 16" stroke="#3b2a5c" stroke-width="1.2" fill="none"/>
    <!-- 尾 -->
    <path d="M18 44 C8 48 6 56 2 58 C10 58 14 54 20 50" fill="#4b3a6e"/>
    <!-- 胴 -->
    <path d="M18 42 C18 32 28 28 38 30 C48 32 50 42 44 48 C36 54 22 52 18 42Z" fill="#6a51a0"/>
    <path d="M24 44 C24 38 30 35 37 37 C43 39 44 45 40 48Z" fill="#a68fd6"/>
    <!-- 首と頭 -->
    <path d="M40 32 C44 24 50 20 56 20 L58 26 C52 27 48 31 46 36Z" fill="#6a51a0"/>
    <path d="M48 22 C48 16 54 13 59 15 C64 17 64 24 60 26 C55 28 48 27 48 22Z" fill="#7a5cb5"/>
    <path d="M50 16 L47 8 L55 13Z M58 14 L62 6 L63 15Z" fill="${C.bone}"/>
    ${eyes(57, 20, 3, '#ffe066', 2)}
    <path d="M60 25 L64 26 L60 28Z" fill="#2a1a3c"/>
    <!-- 脚 -->
    <path d="M26 50 L25 60 L32 60 L32 50Z M40 48 L40 59 L47 59 L46 48Z" fill="#4b3a6e"/>
    <ellipse cx="34" cy="61" rx="24" ry="3" fill="#000" opacity=".35"/>`);
}
const MON_SPRITE = { fire: monFire, water: monWater, wind: monWind, earth: monEarth, giant: monGiant };

// ============================================================
// 人間側 敵スプライト(右向き。表示側で左右反転される)
// ============================================================
function soldier(x, dx, body, trim, tall = 0) {
  return `<g transform="translate(${x},0)">
    <path d="M-6 ${34 - tall} L6 ${34 - tall} L8 58 L-8 58Z" fill="${body}"/>
    <circle cx="0" cy="${26 - tall}" r="7" fill="${C.flesh}"/>
    <path d="M-8 ${23 - tall} A8 8 0 0 1 8 ${23 - tall} L8 ${26 - tall} L-8 ${26 - tall}Z" fill="${trim}"/>
    ${eyes(1, 27 - tall, 2.5, '#2a1a1a', 1.1)}
    ${dx}</g>`;
}
function enemySquad() {
  return S('0 0 96 64', `
    <defs>${glow('gs', C.steel)}</defs>
    <ellipse cx="48" cy="40" rx="46" ry="26" fill="url(#gs)" opacity=".5"/>
    ${soldier(26, `<path d="M10 12 L12 58" stroke="#8a6a45" stroke-width="3"/><path d="M9 8 L14 18 L11 20Z" fill="${C.steel}"/>`, '#3f5b7a', '#7d8fa6', 2)}
    ${soldier(48, `<rect x="8" y="34" width="16" height="20" rx="3" fill="${C.steel}"/><rect x="12" y="38" width="8" height="12" fill="#5b7290"/>`, '#4a6a8c', '#96a6bb')}
    ${soldier(70, `<path d="M8 14 L10 58" stroke="#8a6a45" stroke-width="3"/><path d="M7 10 L12 20 L9 22Z" fill="${C.steel}"/>`, '#3f5b7a', '#7d8fa6', 1)}
    <ellipse cx="48" cy="60" rx="40" ry="4" fill="#000" opacity=".35"/>`);
}
function enemyBounty() {
  return S('0 0 96 64', `
    <defs>${glow('gb', '#c9a227')}</defs>
    <ellipse cx="48" cy="36" rx="40" ry="26" fill="url(#gb)" opacity=".45"/>
    <path d="M40 44 L38 60 L46 60 L46 44Z M50 44 L50 60 L58 60 L56 44Z" fill="#2f2519"/>
    <path d="M34 24 C26 32 24 48 28 58 L48 56 L48 24Z" fill="#4a3c2c"/>
    <path d="M62 24 C70 32 72 48 68 58 L48 56 L48 24Z" fill="#5c4a34"/>
    <path d="M38 24 L58 24 L60 46 L36 46Z" fill="#6a5540"/>
    <path d="M36 32 L60 32 L61 37 L35 37Z" fill="#2f2519"/>
    <circle cx="47" cy="34.5" r="3" fill="#c9a227"/>
    <circle cx="48" cy="18" r="10" fill="#3a2e20"/>
    <path d="M38 20 C38 6 58 6 58 20 L58 14 C54 6 42 6 38 14Z" fill="#5c4a34"/>
    <path d="M41 18 L55 18 L54 24 L42 24Z" fill="#1a140e"/>
    ${eyes(48, 21, 4, '#e6c34a', 1.9)}
    <path d="M56 38 L82 32" stroke="#5b4630" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M74 20 L79 44" stroke="#3a2e20" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M75 21 L88 33 L77 44" stroke="#8a7550" stroke-width="1.8" fill="none"/>
    <path d="M62 36 L86 33" stroke="#cfc4a8" stroke-width="1.2"/>
    <ellipse cx="48" cy="61" rx="26" ry="3.5" fill="#000" opacity=".35"/>`);
}
function enemyAdventurer() {
  return S('0 0 96 64', `
    <defs>${glow('ga', C.gold)}</defs>
    <ellipse cx="48" cy="38" rx="46" ry="26" fill="url(#ga)" opacity=".35"/>
    <!-- 魔法使い -->
    <g transform="translate(24,0)"><path d="M-8 34 L8 34 L11 58 L-11 58Z" fill="#5b4a86"/><circle cx="0" cy="26" r="7" fill="${C.flesh}"/>
      <path d="M-10 24 L10 24 L0 8Z" fill="#6f5a9e"/>${eyes(1, 27, 2.5, '#2a1a1a', 1.1)}
      <path d="M12 16 L14 58" stroke="#6b5233" stroke-width="3"/><circle cx="13" cy="13" r="4" fill="#9fd8f0" opacity=".9"/></g>
    <!-- 剣士 -->
    <g transform="translate(50,0)"><path d="M-8 32 L8 32 L10 58 L-10 58Z" fill="#7a4438"/><circle cx="0" cy="24" r="7.5" fill="${C.flesh}"/>
      <path d="M-8 21 A8 8 0 0 1 8 21 L8 24 L-8 24Z" fill="#c9a227"/>${eyes(1, 25, 2.5, '#2a1a1a', 1.1)}
      <path d="M9 40 L26 22" stroke="${C.steel}" stroke-width="4" stroke-linecap="round"/><path d="M6 42 L14 34" stroke="#6b5233" stroke-width="5" stroke-linecap="round"/></g>
    <!-- 弓 -->
    <g transform="translate(74,0)"><path d="M-7 34 L7 34 L9 58 L-9 58Z" fill="#3f6b4a"/><circle cx="0" cy="27" r="6.5" fill="${C.flesh}"/>
      <path d="M-8 24 L8 24 L4 18 L-4 18Z" fill="#2f5238"/>${eyes(1, 28, 2.2, '#2a1a1a', 1)}
      <path d="M10 20 C18 28 18 44 10 52" stroke="#6b5233" stroke-width="2.5" fill="none"/><path d="M10 20 L10 52" stroke="${C.dim}" stroke-width="1"/></g>
    <ellipse cx="48" cy="60" rx="42" ry="4" fill="#000" opacity=".35"/>`);
}
function enemyHero(big) {
  return S('0 0 96 96', `
    <defs>${rgrad('gh', [[0, '#fff3c0', .5], [1, '#fff3c0', 0]])}</defs>
    <ellipse cx="48" cy="50" rx="46" ry="46" fill="url(#gh)"/>
    <!-- マント -->
    <path d="M30 34 C18 44 16 70 20 88 L48 84 L48 34Z" fill="#8c2f3a"/>
    <path d="M66 34 C78 44 80 70 76 88 L48 84 L48 34Z" fill="#a53c48"/>
    <!-- 胴鎧 -->
    <path d="M34 34 L62 34 L66 74 L30 74Z" fill="${C.steel}"/>
    <path d="M38 38 L58 38 L60 68 L36 68Z" fill="#9aa8b8"/>
    <path d="M48 40 L48 66 M40 50 L56 50" stroke="#e8eef5" stroke-width="2"/>
    <!-- 肩 -->
    <ellipse cx="33" cy="37" rx="9" ry="7" fill="#dfe6ee"/><ellipse cx="63" cy="37" rx="9" ry="7" fill="#dfe6ee"/>
    <!-- 頭 -->
    <circle cx="48" cy="22" r="11" fill="${C.flesh}"/>
    <path d="M37 20 A11 11 0 0 1 59 20 L59 24 L37 24Z" fill="#c9a227"/>
    <path d="M48 11 L48 5" stroke="#c9a227" stroke-width="2"/>
    ${eyes(48, 24, 4, '#3a4a6a', 1.8)}
    <!-- 大剣 -->
    <path d="M66 62 L92 12" stroke="${C.steel}" stroke-width="7" stroke-linecap="round"/>
    <path d="M66 62 L92 12" stroke="#f0f6ff" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M58 70 L70 56" stroke="#c9a227" stroke-width="6" stroke-linecap="round"/>
    <path d="M56 76 L64 66" stroke="#6b5233" stroke-width="6" stroke-linecap="round"/>
    <!-- 脚 -->
    <path d="M36 74 L34 92 L44 92 L45 74Z M52 74 L53 92 L63 92 L61 74Z" fill="#5b6472"/>
    <ellipse cx="48" cy="93" rx="30" ry="3.5" fill="#000" opacity=".35"/>`);
}
function spritePlayer() {
  return S('0 0 64 64', `
    <defs>${glow('gp', C.gold)}</defs>
    <ellipse cx="32" cy="36" rx="26" ry="26" fill="url(#gp)" opacity=".5"/>
    <!-- スーツ -->
    <path d="M22 30 L42 30 L45 60 L19 60Z" fill="#2f2740"/>
    <path d="M28 30 L36 30 L34 48 L30 48Z" fill="#e9dfcd"/>
    <path d="M32 30 L35 36 L32 46 L29 36Z" fill="${C.gold}"/>
    <!-- 頭 -->
    <circle cx="32" cy="22" r="9" fill="#b98fa8"/>
    <path d="M23 20 A9 9 0 0 1 41 20 L41 17 C38 12 26 12 23 17Z" fill="#2a1f38"/>
    <path d="M24 14 L20 4 L28 11Z M40 14 L44 4 L36 11Z" fill="#7a5cb5"/>
    ${eyes(33, 22, 3.5, '#fff', 1.8)}
    <!-- クリップボード -->
    <g transform="rotate(-8 46 42)"><rect x="42" y="34" width="14" height="18" rx="2" fill="#c9a227"/><rect x="44" y="37" width="10" height="13" fill="#f5efe0"/>
      <path d="M46 40 H52 M46 43 H52 M46 46 H50" stroke="#8a7550" stroke-width="1"/></g>
    <ellipse cx="32" cy="61" rx="18" ry="3" fill="#000" opacity=".35"/>`);
}

// ============================================================
// 立ち絵(240x320)
// ============================================================
function portraitFrame(inner, tint) {
  return SP('0 0 240 320', `
    <defs>${rgrad('pf', [[0, tint, .35], [1, C.deep, 0]], .5, .4, .7)}</defs>
    <rect width="240" height="320" fill="${C.deep}" opacity=".35"/>
    <rect width="240" height="320" fill="url(#pf)"/>
    ${inner}`);
}
function portraitMaou() {
  return portraitFrame(`
    <!-- 玉座 -->
    <path d="M60 300 L60 120 C60 100 180 100 180 120 L180 300Z" fill="#2c2238"/>
    <path d="M70 120 L70 60 L110 90 L120 40 L130 90 L170 60 L170 120Z" fill="#3a2c4a"/>
    <!-- だらけた姿勢の脚 -->
    <path d="M100 220 L70 290 L92 296 L120 232Z" fill="#3b3050"/>
    <path d="M130 224 L150 292 L172 286 L145 220Z" fill="#3b3050"/>
    <!-- 胴(ゆるい部屋着) -->
    <path d="M86 150 C86 128 154 128 154 150 L162 234 L78 234Z" fill="#4a2f5e"/>
    <path d="M120 150 L120 234" stroke="#5e3d76" stroke-width="3"/>
    <path d="M86 150 L120 176 L154 150" fill="#3a2549"/>
    <!-- 腕と設計図 -->
    <path d="M154 158 L186 190 L176 202 L146 176Z" fill="#4a2f5e"/>
    <g transform="rotate(12 180 200)"><rect x="150" y="186" width="66" height="44" rx="3" fill="#e6dcc4"/>
      <path d="M158 198 H206 M158 208 H196 M158 218 H208" stroke="#7a6a9a" stroke-width="1.6"/>
      <circle cx="192" cy="208" r="9" fill="none" stroke="#a5324a" stroke-width="1.6"/>
      <path d="M192 199 L192 217 M183 208 L201 208" stroke="#a5324a" stroke-width="1.2"/></g>
    <!-- 首・頭 -->
    <path d="M110 128 L130 128 L130 144 L110 144Z" fill="#9b6f92"/>
    <ellipse cx="120" cy="106" rx="27" ry="30" fill="#b285a6"/>
    <path d="M93 100 C93 74 147 74 147 100 L147 88 C142 68 98 68 93 88Z" fill="#241a33"/>
    <!-- 角 -->
    <path d="M96 84 C84 62 78 50 82 40 C94 50 100 66 104 80Z" fill="#e5dcc8"/>
    <path d="M144 84 C156 62 162 50 158 40 C146 50 140 66 136 80Z" fill="#e5dcc8"/>
    <!-- 王冠(斜めにずれている) -->
    <g transform="rotate(-14 120 74)"><path d="M96 78 L96 62 L104 70 L112 56 L120 70 L128 56 L136 70 L144 62 L144 78Z" fill="${C.gold}"/>
      <circle cx="112" cy="63" r="3" fill="${C.red}"/></g>
    <!-- 気だるい半目 -->
    <path d="M104 108 L118 108" stroke="#2a1a2e" stroke-width="3" stroke-linecap="round"/>
    <path d="M126 108 L140 108" stroke="#2a1a2e" stroke-width="3" stroke-linecap="round"/>
    <circle cx="111" cy="112" r="2.6" fill="#ffd23c"/><circle cx="133" cy="112" r="2.6" fill="#ffd23c"/>
    <path d="M112 124 C118 128 126 128 132 124" stroke="#5a3a52" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <!-- あくびの吹き出し風の点 -->
    <circle cx="176" cy="96" r="3" fill="${C.dim}" opacity=".5"/><circle cx="186" cy="86" r="4.5" fill="${C.dim}" opacity=".35"/>`, C.purple);
}
function portraitHero() {
  return portraitFrame(`
    <path d="M78 150 C56 172 52 260 58 310 L120 300 L120 150Z" fill="#8c2f3a"/>
    <path d="M162 150 C184 172 188 260 182 310 L120 300 L120 150Z" fill="#a53c48"/>
    <path d="M88 148 L152 148 L164 268 L76 268Z" fill="${C.steel}"/>
    <path d="M98 158 L142 158 L150 254 L90 254Z" fill="#9aa8b8"/>
    <path d="M120 162 L120 244 M100 186 L140 186" stroke="#e8eef5" stroke-width="3"/>
    <ellipse cx="84" cy="156" rx="20" ry="14" fill="#dfe6ee"/><ellipse cx="156" cy="156" rx="20" ry="14" fill="#dfe6ee"/>
    <path d="M96 266 L88 316 L112 316 L118 266Z M132 266 L138 316 L162 316 L152 266Z" fill="#5b6472"/>
    <!-- 頭 -->
    <path d="M108 122 L132 122 L132 148 L108 148Z" fill="${C.flesh}"/>
    <ellipse cx="120" cy="98" rx="26" ry="29" fill="${C.flesh}"/>
    <path d="M94 92 C94 62 146 62 146 92 L146 80 C140 62 100 62 94 80Z" fill="#c9a86a"/>
    <path d="M94 90 L146 90 L146 96 L94 96Z" fill="#c9a227"/>
    <!-- 迷いのある眉と目 -->
    <path d="M104 92 L116 96 M136 92 L124 96" stroke="#8a6a3a" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="110" cy="104" rx="4" ry="4.5" fill="#3a4a6a"/><ellipse cx="130" cy="104" rx="4" ry="4.5" fill="#3a4a6a"/>
    <circle cx="111.5" cy="102.5" r="1.4" fill="#fff"/><circle cx="131.5" cy="102.5" r="1.4" fill="#fff"/>
    <path d="M112 118 C118 116 124 116 130 118" stroke="#9a6a5a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <!-- 下ろした剣 -->
    <path d="M186 152 L200 300" stroke="${C.steel}" stroke-width="10" stroke-linecap="round"/>
    <path d="M186 152 L200 300" stroke="#f0f6ff" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M172 148 L206 144" stroke="#c9a227" stroke-width="8" stroke-linecap="round"/>
    <path d="M186 128 L188 146" stroke="#6b5233" stroke-width="8" stroke-linecap="round"/>`, '#8fa6d6');
}
function portraitMonster(attr) {
  const col = C[attr];
  return portraitFrame(`
    <g transform="translate(20,30) scale(3.1)">${MON_SPRITE[attr]().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>
    <rect x="0" y="286" width="240" height="34" fill="${C.deep}" opacity=".55"/>
    <rect x="0" y="286" width="240" height="2" fill="${col}" opacity=".7"/>`, col);
}

// ============================================================
// 幹部の顔(100x100・円形トリミング)
// ============================================================
function execFace(bg, skin, hair, prop, eyeC = '#2a1a2e') {
  return S('0 0 100 100', `
    <rect width="100" height="100" fill="${bg}"/>
    <circle cx="50" cy="104" r="42" fill="#2f2740"/>
    <ellipse cx="50" cy="46" rx="26" ry="29" fill="${skin}"/>
    <path d="M24 42 C24 14 76 14 76 42 L76 30 C70 14 30 14 24 30Z" fill="${hair}"/>
    ${eyes(50, 50, 10, eyeC, 4)}
    <circle cx="47" cy="48" r="1.6" fill="#fff"/><circle cx="63" cy="48" r="1.6" fill="#fff"/>
    ${prop}`);
}
const EXEC_ART = {
  finance: () => execFace('#2a3a3a', '#c9a68c', '#3a3028',
    `<rect x="6" y="62" width="34" height="24" rx="3" fill="#6b5233"/>
     <path d="M10 70 H36 M10 78 H36" stroke="#c9a227" stroke-width="1.4"/>
     ${[0, 1, 2, 3].map(i => `<circle cx="${13 + i * 7}" cy="70" r="2.4" fill="#e9dfcd"/><circle cx="${13 + i * 7}" cy="78" r="2.4" fill="#e9dfcd"/>`).join('')}
     <path d="M34 30 L26 12 L38 24Z M66 30 L74 12 L62 24Z" fill="#e5dcc8"/>
     <rect x="30" y="46" width="40" height="12" rx="6" fill="none" stroke="#c9c9c9" stroke-width="1.6"/>`),
  training: () => execFace('#3a2a2a', '#b8917a', '#2a1f1c',
    `<path d="M8 88 L36 56" stroke="#6b5233" stroke-width="6" stroke-linecap="round"/>
     <path d="M32 60 L44 48" stroke="${C.steel}" stroke-width="5" stroke-linecap="round"/>
     <path d="M30 34 L20 14 L36 26Z M70 34 L80 14 L64 26Z" fill="#c96a4a"/>
     <path d="M34 40 L44 44 M66 40 L56 44" stroke="#2a1a1a" stroke-width="3" stroke-linecap="round"/>`),
  medical: () => execFace('#26343a', '#cbb0a0', '#4a4a5a',
    `<path d="M24 24 C24 8 76 8 76 24 L76 20 L24 20Z" fill="#e6e6ee"/>
     <rect x="20" y="18" width="60" height="8" rx="3" fill="#e6e6ee"/>
     <rect x="44" y="4" width="12" height="16" fill="#e6e6ee"/><rect x="38" y="10" width="24" height="6" fill="#e6e6ee"/>
     <rect x="44" y="8" width="12" height="12" fill="${C.red}" opacity=".9"/>
     <rect x="6" y="70" width="26" height="18" rx="4" fill="#8fc9b0"/><path d="M12 79 H26 M19 72 V86" stroke="#fff" stroke-width="2.4"/>`),
  summoner: () => execFace('#2c2440', '#a88fb0', '#1e1830',
    `<path d="M22 30 L50 2 L78 30 L50 22Z" fill="#4a3a70"/>
     <circle cx="50" cy="16" r="6" fill="#9fd8f0" opacity=".9"/>
     <circle cx="14" cy="76" r="12" fill="none" stroke="#9b7bd6" stroke-width="2"/>
     <circle cx="14" cy="76" r="6" fill="#9b7bd6" opacity=".4"/>
     <circle cx="86" cy="70" r="8" fill="none" stroke="#9b7bd6" stroke-width="1.6"/>
     <path d="M30 36 L40 40 M70 36 L60 40" stroke="#2a1a2e" stroke-width="2.4" stroke-linecap="round"/>`, '#ffd23c'),
  tavern: () => execFace('#3a2e22', '#c08a6a', '#5a3a24',
    `<path d="M24 34 C30 26 44 30 50 34 C56 30 70 26 76 34 L76 26 C68 16 32 16 24 26Z" fill="#5a3a24"/>
     <path d="M32 66 C38 74 62 74 68 66 L66 78 C58 84 42 84 34 78Z" fill="#8a6a4a"/>
     <rect x="66" y="60" width="26" height="28" rx="4" fill="#c9a227"/>
     <rect x="68" y="62" width="22" height="10" fill="#f5e6b0"/>
     <path d="M92 68 C102 70 102 82 92 84" stroke="#c9a227" stroke-width="4" fill="none"/>`),
};

// ============================================================
// 施設アイコン(96x96)
// ============================================================
const facSummon = () => S('0 0 96 96', `
  <defs>${rgrad('fs1', [[0, '#c9a8ff', .9], [1, '#5b3f9e', 0]])}</defs>
  <ellipse cx="48" cy="74" rx="38" ry="12" fill="none" stroke="${C.purple}" stroke-width="2.5"/>
  <ellipse cx="48" cy="74" rx="26" ry="8" fill="none" stroke="${C.purple}" stroke-width="1.6" opacity=".7"/>
  <path d="M20 74 L76 74 M48 62 L48 86 M28 66 L68 82 M68 66 L28 82" stroke="${C.purple}" stroke-width="1.2" opacity=".5"/>
  <circle cx="48" cy="42" r="24" fill="url(#fs1)"/>
  <circle cx="48" cy="42" r="24" fill="none" stroke="#d8c4ff" stroke-width="2"/>
  <ellipse cx="40" cy="34" rx="7" ry="5" fill="#fff" opacity=".55" transform="rotate(-25 40 34)"/>
  <circle cx="24" cy="24" r="3" fill="#e6d4ff"/><circle cx="74" cy="30" r="2.2" fill="#e6d4ff"/><circle cx="68" cy="16" r="1.6" fill="#e6d4ff"/>`);
const facInterview = () => S('0 0 96 96', `
  <rect x="18" y="12" width="60" height="72" rx="5" fill="#e6dcc4"/>
  <rect x="34" y="6" width="28" height="12" rx="4" fill="#8a7550"/>
  <path d="M28 34 H68 M28 46 H68 M28 58 H56" stroke="#7a6a9a" stroke-width="3" stroke-linecap="round"/>
  <rect x="28" y="22" width="18" height="6" rx="3" fill="${C.gold}"/>
  <circle cx="62" cy="66" r="12" fill="${C.panel}"/>
  <path d="M62 60 L62 68 M58 64 L66 64" stroke="${C.gold}" stroke-width="2.4"/>`);
const facTraining = () => S('0 0 96 96', `
  <path d="M16 78 L74 20" stroke="#8a95a6" stroke-width="7" stroke-linecap="round"/>
  <path d="M16 78 L74 20" stroke="#dfe6ee" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M80 78 L22 20" stroke="#8a95a6" stroke-width="7" stroke-linecap="round"/>
  <path d="M80 78 L22 20" stroke="#dfe6ee" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M10 84 L22 72 M86 84 L74 72" stroke="#6b5233" stroke-width="9" stroke-linecap="round"/>
  <circle cx="48" cy="49" r="7" fill="${C.gold}"/>`);
const facTavern = () => S('0 0 96 96', `
  <path d="M22 26 L64 26 L60 82 L26 82Z" fill="#c9a227"/>
  <path d="M26 30 L60 30 L58 46 L28 46Z" fill="#f5e6b0"/>
  <path d="M28 48 C34 44 52 44 58 48 L56 78 L30 78Z" fill="#e0a83a"/>
  <path d="M64 36 C82 38 82 66 64 68" stroke="#c9a227" stroke-width="7" fill="none"/>
  <ellipse cx="43" cy="27" rx="21" ry="6" fill="#fff8e0"/>
  <circle cx="34" cy="20" r="5" fill="#fff8e0"/><circle cx="48" cy="16" r="7" fill="#fff8e0"/><circle cx="58" cy="21" r="4" fill="#fff8e0"/>`);
const facMedical = () => S('0 0 96 96', `
  <rect x="14" y="28" width="68" height="48" rx="8" fill="#8fc9b0"/>
  <rect x="14" y="28" width="68" height="48" rx="8" fill="none" stroke="#5f9c86" stroke-width="2"/>
  <path d="M40 40 H56 V52 H68 V60 H56 V72 H40 V60 H28 V52 H40Z" fill="#fff"/>
  <rect x="36" y="20" width="24" height="10" rx="4" fill="#5f9c86"/>`);
const facFinance = () => S('0 0 96 96', `
  <rect x="14" y="20" width="50" height="62" rx="4" fill="#6b5233"/>
  <rect x="20" y="26" width="38" height="50" rx="2" fill="#e6dcc4"/>
  <path d="M26 38 H52 M26 48 H52 M26 58 H44" stroke="#8a7550" stroke-width="2.5"/>
  <circle cx="66" cy="62" r="16" fill="${C.gold}"/><circle cx="66" cy="62" r="11" fill="#f0c76b"/>
  <path d="M66 54 L66 70 M60 58 H72 M60 66 H72" stroke="#8a6a20" stroke-width="2.4"/>
  <circle cx="76" cy="38" r="10" fill="#c9a227"/><circle cx="76" cy="38" r="6.5" fill="#e0b84a"/>`);
const facThrone = () => S('0 0 96 96', `
  <path d="M26 84 L26 40 C26 28 70 28 70 40 L70 84Z" fill="#3a2c4a"/>
  <path d="M32 40 L32 12 L42 26 L48 4 L54 26 L64 12 L64 40Z" fill="#4a3a5e"/>
  <path d="M20 84 L76 84 L72 92 L24 92Z" fill="#2c2238"/>
  <path d="M34 50 L62 50 L60 80 L36 80Z" fill="#8c2f3a"/>
  <g transform="translate(48,22)"><path d="M-16 8 L-16 -6 L-8 2 L0 -12 L8 2 L16 -6 L16 8Z" fill="${C.gold}"/><circle cx="0" cy="-4" r="3" fill="${C.red}"/></g>`);

// ============================================================
// 状態・属性アイコン(32x32)
// ============================================================
const dot = (c, inner) => S('0 0 32 32', `<circle cx="16" cy="16" r="12" fill="${c}"/><circle cx="16" cy="16" r="12" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="2"/>${inner || ''}`);
const ST_ART = {
  calm: () => dot(C.green, `<path d="M11 16 L15 20 L22 12" stroke="#153a24" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  warn: () => dot(C.amber, `<path d="M16 9 L16 18" stroke="#4a3208" stroke-width="3.4" stroke-linecap="round"/><circle cx="16" cy="23" r="2" fill="#4a3208"/>`),
  severe: () => dot('#f0783c', `<path d="M16 6 L28 26 L4 26Z" fill="#f0783c" stroke="#000" stroke-opacity=".25" stroke-width="2"/><path d="M16 13 L16 20" stroke="#3a1a08" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="23.5" r="1.8" fill="#3a1a08"/>`),
  critical: () => S('0 0 32 32', `<path d="M16 2 L20 12 L30 16 L20 20 L16 30 L12 20 L2 16 L12 12Z" fill="${C.red}"/><circle cx="16" cy="16" r="4.5" fill="#ffd9d9"/>`),
  lost: () => S('0 0 32 32', `<path d="M16 4 C7 4 4 11 4 16 C4 20 7 22 8 24 L8 28 L24 28 L24 24 C25 22 28 20 28 16 C28 11 25 4 16 4Z" fill="#9a94a6"/>
    <circle cx="11" cy="16" r="3.6" fill="#241d30"/><circle cx="21" cy="16" r="3.6" fill="#241d30"/><path d="M14 23 L18 23" stroke="#241d30" stroke-width="2"/>`),
  forecast: () => S('0 0 32 32', `<path d="M9 4 H23 L16 15Z" fill="${C.amber}"/><path d="M9 28 H23 L16 17Z" fill="${C.amber}" opacity=".55"/>
    <path d="M7 3 H25 M7 29 H25" stroke="#8a6a20" stroke-width="2.6" stroke-linecap="round"/>`),
};
const ATTR_ART = {
  fire: () => S('0 0 32 32', `<path d="M16 2 C20 10 26 12 26 19 C26 25 21 29 16 29 C11 29 6 25 6 19 C6 13 12 12 16 2Z" fill="${C.fire}"/><path d="M16 13 C18 17 21 18 21 21 C21 24 19 26 16 26 C13 26 11 24 11 21 C11 18 14 17 16 13Z" fill="#ffd23c"/>`),
  water: () => S('0 0 32 32', `<path d="M16 3 C22 12 26 16 26 21 C26 26 21 29 16 29 C11 29 6 26 6 21 C6 16 10 12 16 3Z" fill="${C.water}"/><path d="M11 20 C11 24 13 26 16 26" stroke="#bfe6ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`),
  wind: () => S('0 0 32 32', `<path d="M4 11 H20 A4 4 0 1 0 16 7" stroke="${C.wind}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M4 18 H24 A4 4 0 1 1 20 22" stroke="${C.wind}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M6 25 H16" stroke="${C.wind}" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".6"/>`),
  earth: () => S('0 0 32 32', `<path d="M2 27 L12 9 L18 19 L22 13 L30 27Z" fill="${C.earth}"/><path d="M12 9 L8 17 L16 17Z" fill="#e6d4b8"/><path d="M22 13 L19 19 L25 19Z" fill="#e6d4b8"/>`),
  giant: () => S('0 0 32 32', `<path d="M4 24 C4 15 10 10 17 10 C24 10 28 15 28 22 L28 27 L4 27Z" fill="${C.giant}"/>
    <path d="M10 10 L7 3 L14 8Z M24 10 L28 3 L27 11Z" fill="#e5dcc8"/>
    <circle cx="12" cy="18" r="2.4" fill="#ffe066"/><circle cx="22" cy="18" r="2.4" fill="#ffe066"/>
    <path d="M11 24 L21 24" stroke="#2a1a3c" stroke-width="2.4"/>`),
};

// ============================================================
// エフェクト
// ============================================================
const fxHit = () => S('0 0 64 64', `<path d="M32 2 L38 22 L58 14 L44 30 L62 38 L42 40 L48 60 L32 46 L18 62 L22 40 L2 38 L20 30 L6 12 L26 22Z" fill="#ffd23c"/><circle cx="32" cy="34" r="8" fill="#fff"/>`);
const fxHeal = () => S('0 0 64 64', `<path d="M32 6 L36 26 L56 32 L36 38 L32 58 L28 38 L8 32 L28 26Z" fill="#9fe8c0"/><circle cx="52" cy="14" r="4" fill="#dffaec"/><circle cx="14" cy="46" r="3" fill="#dffaec"/>`);
const fxTalk = () => S('0 0 64 64', `<path d="M8 10 H56 A6 6 0 0 1 62 16 V40 A6 6 0 0 1 56 46 H28 L14 58 L17 46 H8 A6 6 0 0 1 2 40 V16 A6 6 0 0 1 8 10Z" fill="#e9dfcd"/><circle cx="20" cy="28" r="4" fill="${C.panel}"/><circle cx="32" cy="28" r="4" fill="${C.panel}"/><circle cx="44" cy="28" r="4" fill="${C.panel}"/>`);

// ============================================================
// 城アイコン & タイトルロゴ
// ============================================================
const iconCastle = () => S('0 0 128 128', `
  <defs>${rgrad('cg', [[0, C.purple, .45], [1, C.purple, 0]])}</defs>
  <ellipse cx="64" cy="70" rx="62" ry="58" fill="url(#cg)"/>
  <path d="M24 118 L24 62 L104 62 L104 118Z" fill="#3a2c4a"/>
  <path d="M24 62 L24 50 L32 50 L32 58 L40 58 L40 50 L48 50 L48 58 L56 58 L56 50 L72 50 L72 58 L80 58 L80 50 L88 50 L88 58 L96 58 L96 50 L104 50 L104 62Z" fill="#4a3a5e"/>
  <path d="M14 118 L14 46 L38 46 L38 118Z" fill="#332742"/>
  <path d="M90 118 L90 46 L114 118Z" fill="#332742"/>
  <path d="M90 118 L90 46 L114 46 L114 118Z" fill="#332742"/>
  <path d="M10 46 L26 20 L42 46Z" fill="#8c2f3a"/>
  <path d="M86 46 L102 20 L118 46Z" fill="#8c2f3a"/>
  <path d="M52 30 L64 6 L76 30 L76 62 L52 62Z" fill="#3f3052"/>
  <path d="M50 30 L64 8 L78 30Z" fill="#a53c48"/>
  <path d="M64 8 L64 0 L82 6 L64 12Z" fill="${C.gold}"/>
  <rect x="56" y="90" width="16" height="28" rx="8" fill="#1a1424"/>
  ${[[26, 62], [26, 82], [102, 62], [102, 82], [46, 74], [82, 74]].map(([x, y]) => `<rect x="${x - 4}" y="${y}" width="8" height="11" rx="4" fill="${C.gold}" opacity=".85"/>`).join('')}
  <path d="M8 122 L120 122" stroke="#241d30" stroke-width="6" stroke-linecap="round"/>`);
const titleLogo = () => S('0 0 1040 300', `
  <defs>${grad('tl', [[0, '#f4e2b8'], [.5, C.gold], [1, '#a5721f']])}
    <filter id="tsh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity=".65"/></filter></defs>
  <g filter="url(#tsh)">
    <text x="520" y="150" text-anchor="middle" font-family="'Shippori Mincho','Yu Mincho',serif" font-weight="800" font-size="118" letter-spacing="10" fill="url(#tl)" stroke="#3a2a12" stroke-width="2">魔王軍、営業中。</text>
  </g>
  <g transform="translate(520,224)">
    <rect x="-150" y="-26" width="300" height="52" rx="26" fill="none" stroke="${C.gold}" stroke-width="2" opacity=".7"/>
    <text x="0" y="9" text-anchor="middle" font-family="'Shippori Mincho',serif" font-size="26" letter-spacing="12" fill="${C.ink}" opacity=".85">O P E N</text>
    <path d="M-190 0 L-160 0 M160 0 L190 0" stroke="${C.gold}" stroke-width="2" opacity=".5"/>
  </g>`);

// ============================================================
// 背景(全画面 1920x1080 / 戦闘 1280x400 / モーダル 1280x720)
// ============================================================
function stars(n, w, h, seed) {
  const r = seeded(seed); let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h * .7).toFixed(0)}" r="${(r() * 1.8 + .4).toFixed(1)}" fill="#fff" opacity="${(r() * .5 + .15).toFixed(2)}"/>`;
  return s;
}
const bgMap = () => SB('0 0 1920 1080', `
  <defs>${grad('sky', [[0, '#0d0a16'], [.55, '#241b3a'], [1, '#3a2a4e']])}
    ${rgrad('mglow', [[0, '#6a4a9e', .5], [1, '#6a4a9e', 0]], .5, .5, .55)}</defs>
  <rect width="1920" height="1080" fill="url(#sky)"/>
  ${stars(140, 1920, 1080, 7)}
  <circle cx="1560" cy="180" r="72" fill="#e8dfc0" opacity=".18"/>
  <ellipse cx="960" cy="540" rx="900" ry="520" fill="url(#mglow)"/>
  <!-- 大陸のブロブ -->
  <path d="M180 700 C120 560 260 430 420 430 C520 300 760 300 840 400 C1000 340 1180 380 1240 480 C1420 460 1620 540 1660 680 C1740 800 1560 940 1360 930 C1160 1010 780 1010 600 940 C400 940 220 840 180 700Z" fill="#241c34" opacity=".95"/>
  <path d="M200 700 C150 570 280 460 430 460 C530 340 750 340 830 430 C990 380 1160 415 1215 505 C1390 490 1580 560 1620 685 C1690 795 1530 915 1350 905 C1150 980 790 980 615 915 C425 915 240 830 200 700Z" fill="#453a5c"/>
  <!-- 山脈 -->
  ${[[430, 520], [520, 500], [1180, 560], [1280, 540], [700, 900], [800, 915]].map(([x, y]) => `<path d="M${x - 70} ${y + 60} L${x} ${y - 40} L${x + 70} ${y + 60}Z" fill="#332a48" opacity=".95"/><path d="M${x - 22} ${y - 5} L${x} ${y - 40} L${x + 22} ${y - 5}Z" fill="#5a4e6e" opacity=".7"/>`).join('')}
  <!-- 森 -->
  ${(() => { const r = seeded(31); let s = ''; for (let i = 0; i < 60; i++) { const x = 260 + r() * 1300, y = 560 + r() * 340; s += `<path d="M${x} ${y} l-13 26 h26Z" fill="#2c4a34" opacity=".85"/>`; } return s; })()}
  <!-- 街道 -->
  <path d="M300 760 C560 700 760 620 960 560 C1180 620 1380 700 1600 740" stroke="#6b5c85" stroke-width="7" fill="none" stroke-dasharray="26 18" opacity=".8"/>
  <path d="M420 470 C640 500 820 520 960 560 C1120 520 1260 500 1420 500" stroke="#6b5c85" stroke-width="6" fill="none" stroke-dasharray="22 16" opacity=".7"/>
  <!-- 湖・海 -->
  <ellipse cx="1370" cy="480" rx="120" ry="60" fill="#2f5a80" opacity=".9"/>
  <ellipse cx="1660" cy="700" rx="150" ry="80" fill="#2f5a80" opacity=".8"/>
  <rect y="1000" width="1920" height="80" fill="#0d0a16" opacity=".55"/>`);
const bgBase = () => SB('0 0 1920 1080', `
  <defs>${grad('bw', [[0, '#241b30'], [1, '#171122']])}
    ${rgrad('torch', [[0, '#ffb347', .55], [1, '#ffb347', 0]])}</defs>
  <rect width="1920" height="1080" fill="url(#bw)"/>
  <!-- 床 -->
  <path d="M0 780 L1920 780 L1920 1080 L0 1080Z" fill="#1d1728"/>
  ${(() => { let s = ''; for (let i = -6; i < 18; i++) s += `<path d="M${i * 160} 780 L${(i - 7) * 260} 1080" stroke="#2b2338" stroke-width="3"/>`; for (let j = 1; j < 6; j++) s += `<path d="M0 ${780 + j * j * 11} L1920 ${780 + j * j * 11}" stroke="#2b2338" stroke-width="3"/>`; return s; })()}
  <!-- アーチ -->
  ${[300, 960, 1620].map(x => `<path d="M${x - 190} 780 L${x - 190} 380 A190 190 0 0 1 ${x + 190} 380 L${x + 190} 780Z" fill="#120e1c" opacity=".85"/>
    <path d="M${x - 150} 780 L${x - 150} 400 A150 150 0 0 1 ${x + 150} 400 L${x + 150} 780Z" fill="#0c0914"/>`).join('')}
  <!-- 柱 -->
  ${[70, 630, 1290, 1850].map(x => `<rect x="${x - 46}" y="180" width="92" height="600" fill="#2e2440"/><rect x="${x - 60}" y="150" width="120" height="40" rx="6" fill="#3a2e50"/><rect x="${x - 58}" y="760" width="116" height="30" rx="4" fill="#3a2e50"/>`).join('')}
  <!-- 松明 -->
  ${[300, 960, 1620].map(x => `<ellipse cx="${x}" cy="300" rx="200" ry="180" fill="url(#torch)"/>`).join('')}
  ${[70, 630, 1290, 1850].map(x => `<circle cx="${x}" cy="330" r="150" fill="url(#torch)" opacity=".5"/>
    <path d="M${x - 10} 350 L${x + 10} 350 L${x + 4} 400 L${x - 4} 400Z" fill="#4a3a2a"/>
    <path d="M${x} 300 C${x + 18} 322 ${x + 14} 348 ${x} 352 C${x - 14} 348 ${x - 18} 322 ${x} 300Z" fill="#ffb347"/>
    <path d="M${x} 318 C${x + 8} 330 ${x + 7} 344 ${x} 348 C${x - 7} 344 ${x - 8} 330 ${x} 318Z" fill="#fff0b8"/>`).join('')}
  <!-- 垂れ幕 -->
  ${[420, 1500].map(x => `<path d="M${x - 60} 200 L${x + 60} 200 L${x + 60} 560 L${x} 610 L${x - 60} 560Z" fill="#5a2130"/>
    <path d="M${x} 300 L${x + 30} 360 L${x} 420 L${x - 30} 360Z" fill="${C.gold}" opacity=".8"/>`).join('')}
  <rect width="1920" height="1080" fill="#0d0a16" opacity=".25"/>`);
const bgTavern = () => SB('0 0 1280 720', `
  <defs>${grad('tv', [[0, '#2a1d16'], [1, '#150f0c']])}${rgrad('lamp', [[0, '#ffc46b', .55], [1, '#ffc46b', 0]])}</defs>
  <rect width="1280" height="720" fill="url(#tv)"/>
  <rect y="520" width="1280" height="200" fill="#221812"/>
  ${[220, 640, 1060].map(x => `<ellipse cx="${x}" cy="150" rx="260" ry="220" fill="url(#lamp)"/>
    <path d="M${x} 0 L${x} 90" stroke="#3a2a1e" stroke-width="4"/><path d="M${x - 34} 90 L${x + 34} 90 L${x + 22} 130 L${x - 22} 130Z" fill="#c9a227"/><circle cx="${x}" cy="122" r="14" fill="#fff0c0"/>`).join('')}
  <!-- 棚と酒瓶 -->
  <rect x="120" y="250" width="1040" height="14" fill="#4a3524"/><rect x="120" y="360" width="1040" height="14" fill="#4a3524"/>
  ${(() => { const r = seeded(5); let s = ''; for (let i = 0; i < 26; i++) { const x = 150 + i * 39, y = r() > .5 ? 250 : 360, h = 40 + r() * 26, c = ['#3f6b4a', '#6b3f3f', '#5a4a2a', '#3f5a6b'][Math.floor(r() * 4)]; s += `<rect x="${x}" y="${y - h}" width="16" height="${h}" rx="4" fill="${c}"/><rect x="${x + 5}" y="${y - h - 10}" width="6" height="12" fill="${c}"/>`; } return s; })()}
  <!-- 樽とカウンター -->
  <rect x="0" y="520" width="1280" height="40" fill="#5a4028"/>
  <rect x="0" y="556" width="1280" height="18" fill="#3a2a1a"/>
  ${[120, 300, 980, 1160].map(x => `<ellipse cx="${x}" cy="640" rx="70" ry="78" fill="#4a3524"/><ellipse cx="${x}" cy="640" rx="70" ry="78" fill="none" stroke="#2a1d12" stroke-width="6"/><path d="M${x - 68} 600 H${x + 68} M${x - 68} 680 H${x + 68}" stroke="#7a6040" stroke-width="8"/>`).join('')}
  <rect width="1280" height="720" fill="#0d0a16" opacity=".35"/>`);
const bgThrone = () => SB('0 0 1280 720', `
  <defs>${grad('th', [[0, '#1c1428'], [1, '#0e0a16']])}${rgrad('thg', [[0, '#7a4ac0', .35], [1, '#7a4ac0', 0]])}</defs>
  <rect width="1280" height="720" fill="url(#th)"/>
  <ellipse cx="640" cy="330" rx="520" ry="380" fill="url(#thg)"/>
  ${[160, 400, 880, 1120].map(x => `<rect x="${x - 40}" y="60" width="80" height="560" fill="#2a2038"/><rect x="${x - 52}" y="40" width="104" height="30" rx="5" fill="#372a4a"/>`).join('')}
  <path d="M0 620 L1280 620 L1280 720 L0 720Z" fill="#1a1426"/>
  <path d="M420 620 L860 620 L900 680 L380 680Z" fill="#241c34"/>
  <!-- 玉座 -->
  <path d="M540 620 L540 320 C540 260 740 260 740 320 L740 620Z" fill="#33263f"/>
  <path d="M560 320 L560 150 L600 210 L640 120 L680 210 L720 150 L720 320Z" fill="#3d2f4c"/>
  <path d="M580 380 L700 380 L692 600 L588 600Z" fill="#6e2434"/>
  <!-- 散らかった設計図 -->
  ${(() => { const r = seeded(11); let s = ''; for (let i = 0; i < 9; i++) { const x = 200 + r() * 900, y = 600 + r() * 90, a = (r() * 60 - 30).toFixed(0); s += `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - 40}" y="${y - 26}" width="80" height="52" rx="2" fill="#ded3b8" opacity=".8"/><path d="M${x - 28} ${y - 10} h56 M${x - 28} ${y + 2} h40" stroke="#8a7a9a" stroke-width="2"/></g>`; } return s; })()}
  <rect width="1280" height="720" fill="#0d0a16" opacity=".3"/>`);
const bgInterview = () => SB('0 0 1280 720', `
  <defs>${grad('iv', [[0, '#241d33'], [1, '#161122']])}</defs>
  <rect width="1280" height="720" fill="url(#iv)"/>
  <rect x="820" y="80" width="360" height="300" rx="8" fill="#2e2a4a"/>
  <path d="M820 80 h360 v300 h-360Z" fill="none" stroke="#4a3f66" stroke-width="8"/>
  <path d="M1000 80 v300 M820 230 h360" stroke="#4a3f66" stroke-width="8"/>
  <circle cx="1120" cy="150" r="34" fill="#e8dfc0" opacity=".2"/>
  ${stars(24, 1180, 380, 3)}
  <rect y="520" width="1280" height="200" fill="#1d1728"/>
  <rect x="120" y="470" width="700" height="30" rx="6" fill="#4a3524"/>
  <rect x="160" y="500" width="40" height="180" fill="#3a2a1a"/><rect x="740" y="500" width="40" height="180" fill="#3a2a1a"/>
  <rect x="250" y="430" width="120" height="40" rx="4" fill="#e6dcc4" opacity=".9"/>
  <rect x="420" y="440" width="90" height="30" rx="4" fill="#e6dcc4" opacity=".7"/>
  <rect width="1280" height="720" fill="#0d0a16" opacity=".35"/>`);
const bgReport = () => SB('0 0 1280 720', `
  <defs>${grad('rp', [[0, '#1e1a2e'], [1, '#131020']])}${rgrad('rl', [[0, '#ffd88a', .3], [1, '#ffd88a', 0]])}</defs>
  <rect width="1280" height="720" fill="url(#rp)"/>
  <ellipse cx="640" cy="200" rx="560" ry="280" fill="url(#rl)"/>
  ${[400, 640, 880].map(x => `<path d="M${x} 0 L${x} 110" stroke="#3a2f4e" stroke-width="4"/><path d="M${x - 40} 110 h80 l-16 40 h-48Z" fill="#c9a227"/><circle cx="${x}" cy="145" r="12" fill="#fff0c0"/>`).join('')}
  <path d="M180 520 L1100 520 L1180 620 L100 620Z" fill="#4a3524"/>
  <path d="M180 520 L1100 520 L1100 534 L180 534Z" fill="#6a5038"/>
  ${[240, 420, 600, 780, 960].map(x => `<rect x="${x - 34}" y="380" width="68" height="140" rx="8" fill="#2b2338"/>`).join('')}
  ${(() => { const r = seeded(17); let s = ''; for (let i = 0; i < 7; i++) { const x = 220 + i * 130, y = 540 + r() * 30; s += `<rect x="${x}" y="${y}" width="70" height="46" rx="3" fill="#ded3b8" opacity=".85" transform="rotate(${(r() * 20 - 10).toFixed(0)} ${x + 35} ${y + 23})"/>`; } return s; })()}
  <rect width="1280" height="720" fill="#0d0a16" opacity=".3"/>`);
const bgEndInvade = () => SB('0 0 1920 1080', `
  <defs>${grad('ei', [[0, '#2a0d10'], [.5, '#6b2114'], [1, '#c9541f']])}${rgrad('eig', [[0, '#ffb347', .55], [1, '#ffb347', 0]], .5, .8, .6)}</defs>
  <rect width="1920" height="1080" fill="url(#ei)"/>
  <ellipse cx="960" cy="900" rx="1100" ry="500" fill="url(#eig)"/>
  ${(() => { const r = seeded(23); let s = ''; for (let i = 0; i < 90; i++) { const x = r() * 1920, y = 300 + r() * 700; s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(r() * 4 + 1).toFixed(1)}" fill="#ffce6b" opacity="${(r() * .7 + .2).toFixed(2)}"/>`; } return s; })()}
  <!-- 教会シルエット -->
  <path d="M700 900 L700 560 L860 470 L1020 560 L1020 900Z" fill="#180a0c"/>
  <path d="M820 900 L820 420 L860 300 L900 420 L900 900Z" fill="#120709"/>
  <path d="M860 300 L860 240 M836 268 L884 268" stroke="#120709" stroke-width="14"/>
  <path d="M760 900 L760 660 A40 40 0 0 1 840 660 L840 900Z" fill="#2a1210"/>
  <path d="M1240 900 L1240 700 L1340 640 L1440 700 L1440 900Z" fill="#180a0c"/>
  <path d="M480 900 L480 740 L600 680 L600 900Z" fill="#180a0c"/>
  <rect y="880" width="1920" height="200" fill="#150607"/>
  <!-- 進軍する影 -->
  ${(() => { const r = seeded(29); let s = ''; for (let i = 0; i < 26; i++) { const x = 60 + r() * 1800, sc = .7 + r() * .7; s += `<g transform="translate(${x.toFixed(0)},960) scale(${sc.toFixed(2)})"><ellipse cx="0" cy="-34" rx="13" ry="15" fill="#0b0405"/><path d="M-16 -20 L16 -20 L20 30 L-20 30Z" fill="#0b0405"/><path d="M-10 -44 L-16 -62 L-4 -50Z M10 -44 L16 -62 L4 -50Z" fill="#0b0405"/></g>`; } return s; })()}`);
const bgEndPeace = () => SB('0 0 1920 1080', `
  <defs>${grad('ep', [[0, '#2a3f6e'], [.45, '#c98a5a'], [1, '#f0c98a']])}${rgrad('sun', [[0, '#fff3c0', .95], [1, '#ffd88a', 0]], .5, .78, .35)}</defs>
  <rect width="1920" height="1080" fill="url(#ep)"/>
  <ellipse cx="960" cy="840" rx="900" ry="520" fill="url(#sun)"/>
  <circle cx="960" cy="800" r="150" fill="#fff6d8" opacity=".9"/>
  ${[[240, 640], [1680, 660], [520, 700], [1420, 690]].map(([x, y]) => `<path d="M${x - 120} 900 L${x - 120} ${y} L${x} ${y - 70} L${x + 120} ${y} L${x + 120} 900Z" fill="#6b4f3f" opacity=".8"/>`).join('')}
  <rect y="880" width="1920" height="200" fill="#4a3b30"/>
  <!-- 市場の露店 -->
  ${[420, 760, 1160, 1500].map((x, i) => `<rect x="${x - 90}" y="800" width="180" height="90" fill="#5a4436"/>
    ${[0, 1, 2, 3].map(k => `<path d="M${x - 90 + k * 45} 800 L${x - 90 + k * 45 + 45} 800 L${x - 90 + k * 45 + 45} 770 L${x - 90 + k * 45} 770Z" fill="${k % 2 ? '#c9603f' : '#e8dfc0'}"/>`).join('')}
    <path d="M${x - 100} 770 H${x + 100}" stroke="#3a2c24" stroke-width="8"/>`).join('')}
  <!-- 人と魔物が並ぶ -->
  ${(() => { const r = seeded(41); let s = ''; for (let i = 0; i < 20; i++) { const x = 120 + i * 92 + r() * 30, m = r() > .5; s += `<g transform="translate(${x.toFixed(0)},960) scale(${(.8 + r() * .4).toFixed(2)})">
      <ellipse cx="0" cy="-40" rx="14" ry="16" fill="${m ? '#4a3560' : '#3a2f2a'}"/>
      <path d="M-17 -24 L17 -24 L21 34 L-21 34Z" fill="${m ? '#5c4278' : '#6b4f3f'}"/>
      ${m ? `<path d="M-11 -50 L-17 -70 L-5 -56Z M11 -50 L17 -70 L5 -56Z" fill="#4a3560"/>` : `<path d="M-14 -48 A14 14 0 0 1 14 -48 L14 -44 L-14 -44Z" fill="#8a6a4a"/>`}</g>`; } return s; })()}`);
const bgEndSurvive = () => SB('0 0 1920 1080', `
  <defs>${grad('es', [[0, '#1a1830'], [.5, '#4a3a5e'], [1, '#a0674a']])}</defs>
  <rect width="1920" height="1080" fill="url(#es)"/>
  <circle cx="1480" cy="620" r="110" fill="#f0c07a" opacity=".55"/>
  ${stars(60, 1920, 500, 13)}
  <path d="M0 780 C300 700 600 740 900 700 C1200 660 1500 720 1920 680 L1920 1080 L0 1080Z" fill="#241d33"/>
  <path d="M0 860 C400 820 800 880 1200 840 C1500 810 1700 850 1920 830 L1920 1080 L0 1080Z" fill="#1a1526"/>
  <!-- 城の遠景 -->
  <g transform="translate(760,420) scale(2.6)" opacity=".95">
    <path d="M24 118 L24 62 L104 62 L104 118Z" fill="#191323"/>
    <path d="M24 62 L24 50 L32 50 L32 58 L40 58 L40 50 L56 50 L56 58 L72 58 L72 50 L88 50 L88 58 L96 58 L96 50 L104 50 L104 62Z" fill="#221a30"/>
    <path d="M52 30 L64 6 L76 30 L76 62 L52 62Z" fill="#1d1628"/>
    <path d="M64 8 L64 0 L82 6 L64 12Z" fill="#c9a227"/>
    ${[[36, 76], [92, 76], [64, 44], [50, 90], [78, 90]].map(([x, y]) => `<rect x="${x - 3}" y="${y}" width="6" height="9" rx="3" fill="#ffcf7a"/>`).join('')}
  </g>
  <!-- 帰路の影 -->
  ${(() => { const r = seeded(53); let s = ''; for (let i = 0; i < 8; i++) { const x = 300 + i * 170 + r() * 40; s += `<g transform="translate(${x.toFixed(0)},1000) scale(${(.9 + r() * .5).toFixed(2)})"><ellipse cx="0" cy="-38" rx="13" ry="15" fill="#120e1c"/><path d="M-16 -22 L16 -22 L20 30 L-20 30Z" fill="#120e1c"/></g>`; } return s; })()}`);

// 戦闘背景(1280x400)
function battleBG(kind) {
  const B = {
    fire: `<defs>${grad('bf', [[0, '#3a1410'], [1, '#7a2c14']])}${rgrad('bfg', [[0, '#ff9a3c', .5], [1, '#ff9a3c', 0]], .5, 1, .7)}</defs>
      <rect width="1280" height="400" fill="url(#bf)"/><ellipse cx="640" cy="400" rx="800" ry="260" fill="url(#bfg)"/>
      ${[120, 420, 900, 1180].map((x, i) => `<path d="M${x - 130} 300 L${x} ${120 + i * 20} L${x + 130} 300Z" fill="#2a0f0c"/>`).join('')}
      <rect y="300" width="1280" height="100" fill="#33130f"/>
      ${(() => { const r = seeded(3); let s = ''; for (let i = 0; i < 9; i++) { const x = r() * 1280, y = 310 + r() * 70; s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(30 + r() * 50).toFixed(0)}" ry="${(6 + r() * 8).toFixed(0)}" fill="#e0623c" opacity=".7"/>`; } return s; })()}
      ${(() => { const r = seeded(9); let s = ''; for (let i = 0; i < 40; i++) s += `<circle cx="${(r() * 1280).toFixed(0)}" cy="${(r() * 320).toFixed(0)}" r="${(r() * 3 + 1).toFixed(1)}" fill="#ffce6b" opacity="${(r() * .6 + .2).toFixed(2)}"/>`; return s; })()}`,
    water: `<defs>${grad('bw2', [[0, '#101f36'], [1, '#20496e']])}</defs>
      <rect width="1280" height="400" fill="url(#bw2)"/>
      ${stars(40, 1280, 200, 19)}
      <path d="M0 210 L200 130 L360 210Z" fill="#16283e"/><path d="M900 210 L1080 120 L1280 210Z" fill="#16283e"/>
      <rect y="250" width="1280" height="150" fill="#1d4467"/>
      ${(() => { let s = ''; for (let i = 0; i < 12; i++) s += `<path d="M${i * 120 - 40} ${270 + (i % 3) * 34} q 40 -12 80 0 q 40 12 80 0" stroke="#3d7fb0" stroke-width="3" fill="none" opacity=".6"/>`; return s; })()}
      <ellipse cx="640" cy="250" rx="700" ry="26" fill="#4d8fd1" opacity=".25"/>`,
    wind: `<defs>${grad('bwd', [[0, '#1c2a3a'], [1, '#4a6a6e']])}</defs>
      <rect width="1280" height="400" fill="url(#bwd)"/>
      <path d="M0 260 L180 120 L340 260Z" fill="#243440"/><path d="M280 260 L520 90 L740 260Z" fill="#1c2a34"/><path d="M700 260 L920 140 L1120 260Z" fill="#243440"/><path d="M1040 260 L1220 160 L1280 260Z" fill="#1c2a34"/>
      <path d="M480 130 L520 90 L560 130 L520 118Z" fill="#dfe6ee" opacity=".8"/>
      <rect y="260" width="1280" height="140" fill="#33443c"/>
      ${(() => { let s = ''; for (let i = 0; i < 10; i++) { const y = 60 + i * 28; s += `<path d="M${-100 + i * 40} ${y} q 120 -14 260 0 q 120 14 260 0" stroke="#a8cfa0" stroke-width="2.4" fill="none" opacity=".${3 + (i % 4)}"/>`; } return s; })()}`,
    earth: `<defs>${grad('be', [[0, '#16201a'], [1, '#2c3a26']])}</defs>
      <rect width="1280" height="400" fill="url(#be)"/>
      ${(() => { const r = seeded(37); let s = ''; for (let i = 0; i < 34; i++) { const x = r() * 1280, h = 90 + r() * 130, y = 300; s += `<path d="M${x} ${y} l-${18 + r() * 12} -${h * .4} h${36 + r() * 24} Z" fill="#1a2a1e" opacity=".9"/><rect x="${x - 5}" y="${y - h * .4}" width="10" height="${h * .4}" fill="#2a2018"/>`; } return s; })()}
      <rect y="300" width="1280" height="100" fill="#2e2a1e"/>
      <path d="M0 330 C300 316 700 344 1280 326" stroke="#4a4030" stroke-width="14" fill="none" opacity=".7"/>
      ${(() => { const r = seeded(43); let s = ''; for (let i = 0; i < 30; i++) s += `<circle cx="${(r() * 1280).toFixed(0)}" cy="${(120 + r() * 160).toFixed(0)}" r="${(r() * 2 + .8).toFixed(1)}" fill="#b8f0a0" opacity="${(r() * .5 + .2).toFixed(2)}"/>`; return s; })()}`,
    giant: `<defs>${grad('bg2', [[0, '#1a1430'], [1, '#3a2c4e']])}${rgrad('bgg', [[0, '#9b7bd6', .35], [1, '#9b7bd6', 0]], .5, .9, .7)}</defs>
      <rect width="1280" height="400" fill="url(#bg2)"/><ellipse cx="640" cy="400" rx="760" ry="240" fill="url(#bgg)"/>
      ${stars(50, 1280, 240, 61)}
      <path d="M0 400 L0 120 L200 120 L240 400Z" fill="#191330"/><path d="M1280 400 L1280 100 L1060 100 L1020 400Z" fill="#191330"/>
      <path d="M240 400 L300 200 L360 400Z M920 400 L980 180 L1040 400Z" fill="#221a3c"/>
      <rect y="320" width="1280" height="80" fill="#241c3c"/>
      ${(() => { const r = seeded(67); let s = ''; for (let i = 0; i < 7; i++) { const x = 260 + r() * 760, y = 336 + r() * 40; s += `<g opacity=".55" transform="translate(${x.toFixed(0)},${y.toFixed(0)})"><path d="M0 0 q14 -20 28 0 q-14 8 -28 0Z" fill="#c9c0e0"/><path d="M34 6 q10 -14 20 0 q-10 6 -20 0Z" fill="#c9c0e0"/></g>`; } return s; })()}`,
    church: `<defs>${grad('bc', [[0, '#20243a'], [1, '#4a4a66']])}</defs>
      <rect width="1280" height="400" fill="url(#bc)"/>
      ${[200, 440, 840, 1080].map(x => `<rect x="${x - 40}" y="60" width="80" height="280" fill="#2e3048"/><rect x="${x - 52}" y="40" width="104" height="26" rx="4" fill="#3a3c58"/>`).join('')}
      <path d="M540 340 L540 140 A100 100 0 0 1 740 140 L740 340Z" fill="#1a1c2e"/>
      <circle cx="640" cy="170" r="54" fill="#f0e2a0" opacity=".55"/>
      <path d="M640 130 L640 210 M612 154 L668 154" stroke="#c9a227" stroke-width="8"/>
      <rect y="340" width="1280" height="60" fill="#22243a"/>`,
  };
  return SB('0 0 1280 400', B[kind] || B.earth);
}

// ============================================================
// レジストリ
// ============================================================
const ART = {
  'ui.title_logo': titleLogo,
  'ui.icon_castle': iconCastle,
  'ui.fac_summon': facSummon, 'ui.fac_interview': facInterview, 'ui.fac_training': facTraining,
  'ui.fac_tavern': facTavern, 'ui.fac_medical': facMedical, 'ui.fac_finance': facFinance, 'ui.fac_throne': facThrone,
  'ui.st_calm': ST_ART.calm, 'ui.st_warn': ST_ART.warn, 'ui.st_severe': ST_ART.severe,
  'ui.st_critical': ST_ART.critical, 'ui.st_lost': ST_ART.lost, 'ui.st_forecast': ST_ART.forecast,
  'ui.attr_fire': ATTR_ART.fire, 'ui.attr_water': ATTR_ART.water, 'ui.attr_wind': ATTR_ART.wind,
  'ui.attr_earth': ATTR_ART.earth, 'ui.attr_giant': ATTR_ART.giant,
  'chr.maou': portraitMaou, 'chr.hero': portraitHero,
  'chr.maou_face': () => execFace('#2c2036', '#b285a6', '#241a33', `<path d="M28 30 L18 8 L38 24Z M72 30 L82 8 L62 24Z" fill="#e5dcc8"/>`),
  'chr.hero_face': () => execFace('#2a3350', C.flesh, '#c9a86a', `<path d="M22 34 L78 34 L78 42 L22 42Z" fill="#c9a227"/>`, '#3a4a6a'),
  'chr.player_face': () => execFace('#2f2740', '#b98fa8', '#2a1f38', `<path d="M26 28 L16 6 L36 22Z M74 28 L84 6 L64 22Z" fill="#7a5cb5"/>`),
  'chr.exec_finance': EXEC_ART.finance, 'chr.exec_training': EXEC_ART.training, 'chr.exec_medical': EXEC_ART.medical,
  'chr.exec_summoner': EXEC_ART.summoner, 'chr.exec_tavern': EXEC_ART.tavern,
  'chr.mon_fire': () => portraitMonster('fire'), 'chr.mon_water': () => portraitMonster('water'),
  'chr.mon_wind': () => portraitMonster('wind'), 'chr.mon_earth': () => portraitMonster('earth'),
  'chr.mon_giant': () => portraitMonster('giant'),
  'btl.mon_fire': monFire, 'btl.mon_water': monWater, 'btl.mon_wind': monWind,
  'btl.mon_earth': monEarth, 'btl.mon_giant': monGiant, 'btl.mon_generic': monEarth,
  'btl.enemy_squad': enemySquad, 'btl.enemy_bounty': enemyBounty,
  'btl.enemy_adventurer': enemyAdventurer, 'btl.enemy_hero': enemyHero,
  'btl.player': spritePlayer,
  'btl.fx_hit': fxHit, 'btl.fx_heal': fxHeal, 'btl.fx_talk': fxTalk,
  'ui.bg_map': bgMap, 'ui.bg_base': bgBase, 'ui.bg_tavern': bgTavern, 'ui.bg_throne': bgThrone,
  'ui.bg_interview': bgInterview, 'ui.bg_report': bgReport,
  'ui.bg_ending_invade': bgEndInvade, 'ui.bg_ending_peace': bgEndPeace, 'ui.bg_ending_survive': bgEndSurvive,
  'btl.bg_fire': () => battleBG('fire'), 'btl.bg_water': () => battleBG('water'), 'btl.bg_wind': () => battleBG('wind'),
  'btl.bg_earth': () => battleBG('earth'), 'btl.bg_giant': () => battleBG('giant'), 'btl.bg_church': () => battleBG('church'),
};
