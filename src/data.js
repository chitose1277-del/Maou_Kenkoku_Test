// ============================================================
// data.js — 歩行内政プロトタイプ用データ
// ============================================================

// 種族(旧作から一部流用。4軸性格つき)
const SPECIES = {
  fire: [['salamander', 'サラマンダー'], ['hellhound', 'ヘルハウンド'], ['fire_imp', 'ファイアインプ'], ['phoenix', 'フェニックス']],
  water: [['siren', 'セイレーン'], ['kraken', 'クラーケン'], ['undine', 'ウンディーネ'], ['mizuchi', 'ミズチ']],
  wind: [['harpy', 'ハーピー'], ['wyvern', 'ワイバーン'], ['sylph', 'シルフ'], ['griffon', 'グリフォン']],
  earth: [['orc', 'オーク'], ['troll', 'トロール'], ['golem', 'ゴーレム'], ['goblin', 'ゴブリン']],
  giant: [['dragon', 'ドラゴン'], ['behemoth', 'ベヒモス'], ['gigas', 'ギガース'], ['cyclops', 'サイクロプス']],
};
const ATTR_KEYS = Object.keys(SPECIES);
const NAME_HEAD = ['ヴァル', 'グロ', 'ゼル', 'ミア', 'バラ', 'クロ', 'ネフ', 'ドゥ', 'ラミ', 'ゴル', 'イグ', 'ファル'];
const NAME_TAIL = ['ガス', 'ドラ', 'ケル', 'ナ', 'モス', 'ザク', 'リス', 'ゴン', 'ベル', 'ティア', 'ンティア'];

// 4軸性格: open(開/閉) dream(地/夢) logic(理/情) rule(律/気)、各-100〜100
function randAxis() { return Math.round((Math.random() * 2 - 1) * 100); }

// 施設マスタ(v0.4追補 §2.3の一部を採用)
const FACILITY_TYPES = {
  smithy:   { name: '鍛造所',   icon: 'fire_imp', cost: { stone: 12 }, floorHint: '石材12', customers: false },
  tavern:   { name: '酒場',     icon: 'siren',    cost: { stone: 8, wood: 4 }, floorHint: '石材8 木材4', customers: true },
  restaurant:{ name: 'レストラン', icon: 'harpy',  cost: { stone: 10 }, floorHint: '石材10', customers: true },
  arena:    { name: '闘技場',   icon: 'orc',      cost: { stone: 20 }, floorHint: '石材20', customers: true },
  pachinko: { name: 'パチ屋',   icon: 'goblin',   cost: { stone: 16 }, floorHint: '石材16', customers: true },
  idol:     { name: 'アイドルステージ', icon: 'griffon', cost: { rp: 400 }, floorHint: '研究点400', customers: true },
  dorm:     { name: '宿舎',     icon: 'golem',    cost: { wood: 10 }, floorHint: '木材10', customers: false },
  library:  { name: '図書館',   icon: 'sylph',    cost: { rp: 200 }, floorHint: '研究点200', customers: false },
  lab:      { name: '研究院',   icon: 'wyvern',   cost: { stone: 14 }, floorHint: '石材14', customers: false },
};

// 施設ごとの会話ネタ(occupantが2体以上いる時に使う)
const CHAT_LINES = {
  tavern: [
    (a, b) => `「聞いてくれよ${b}、鉄髭王国の坑道の酒はとんでもなく効くんだ」と${a}が身振り手振りで話している。`,
    (a, b) => `${a}と${b}が、隅の席で静かにジョッキを傾けている。会話はほとんどない。`,
    (a, b) => `「先代様の工房、書類の山に埋もれるかと思った」と${a}が大げさに語り、${b}は低く笑っている。`,
  ],
  smithy: [
    (a, b) => `${a}が運んできた鉱石を、${b}が黙々とインゴットに鍛え直している。`,
    (a, b) => `${a}と${b}が、今日の鍛造の出来について何やら言い合っている。`,
  ],
  restaurant: [
    (a, b) => `${a}が「全マシ豚ダブルで」と慣れた注文をする。${b}は横で不思議そうに眺めている。`,
    (a, b) => `${a}と${b}が、蜂蜜がけ焼き林檎を分け合っている。`,
  ],
  arena: [
    (a, b) => `${a}と${b}が軽く打ち合っている。周りで見ていた誰かが小さく歓声を上げた。`,
  ],
  pachinko: [
    (a, b) => `${a}が台の前で唸っている。${b}はとっくに諦めて隣で欠伸をしている。`,
  ],
  idol: [
    (a, b) => `${a}が舞台の前で声援を送っている。${b}はまだ推しを決めかねているようだ。`,
  ],
  default: [
    (a, b) => `${a}と${b}が何か話し込んでいる。`,
  ],
};

// スタッフ×客のペア用(まだ顔なじみでない場合の、距離のある接客口調)
const SERVICE_LINES = {
  tavern: [
    (staff, cust) => `${staff}が${cust}にジョッキを差し出す。「どうぞ、ごゆっくり」。それだけの、業務的なやり取り。`,
    (staff, cust) => `${cust}が何か注文し、${staff}は淡々と応じている。まだお互いのことをよく知らない。`,
  ],
  restaurant: [
    (staff, cust) => `${staff}が皿を運んできて、${cust}の前にそっと置く。「ごゆっくりどうぞ」。`,
    (staff, cust) => `${cust}が何やら尋ね、${staff}が丁寧に、しかしどこか他人行儀に説明している。`,
  ],
  arena: [
    (staff, cust) => `${staff}が${cust}に注意事項を説明している。まだ常連というほどの間柄ではない。`,
  ],
  pachinko: [
    (staff, cust) => `${staff}が${cust}に景品の説明をしている。事務的なやり取りが続く。`,
  ],
  idol: [
    (staff, cust) => `${cust}が${staff}に小さく会釈する。${staff}も型通りの挨拶を返した。`,
  ],
  default: [
    (staff, cust) => `${staff}と${cust}が、必要最低限のやり取りを交わしている。`,
  ],
};

const GRUMBLE_LINES = [
  (a, b) => `${a}が声を落とす。「外交部のあいつ、また安請け合いしただろう」。${b}も頷いている。`,
  (a, b) => `${a}と${b}が、遠くを歩く誰かを横目に、こそこそ話している。`,
];
