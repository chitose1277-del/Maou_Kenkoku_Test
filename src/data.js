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
// tileW: 横方向の占有マス数。1マス=TILE_SIZE px(サイドビューなので高さは1フロア分で統一)
const FACILITY_TYPES = {
  mine:     { name: '採掘所',   icon: 'troll',    cost: { stone: 4 }, floorHint: '石材4', customers: false, tileW: 2,
              produce: { key: 'stone', amount: 1 } },
  sawmill:  { name: '伐採場',   icon: 'behemoth', cost: { wood: 4 }, floorHint: '木材4', customers: false, tileW: 2,
              produce: { key: 'wood', amount: 1 } },
  smithy:   { name: '鍛造所',   icon: 'fire_imp', cost: { stone: 12 }, floorHint: '石材12', customers: false, tileW: 2 },
  tavern:   { name: '酒場',     icon: 'siren',    cost: { stone: 8, wood: 4 }, floorHint: '石材8 木材4', customers: true, tileW: 3,
              spend: { min: 3, max: 8, items: ['エール', '蒸留酒', '果実酒'] } },
  restaurant:{ name: 'レストラン', icon: 'harpy',  cost: { stone: 10 }, floorHint: '石材10', customers: true, tileW: 3,
              spend: { min: 4, max: 10, items: ['岩塩シチュー', '香辛料串焼き', '蜂蜜がけ焼き林檎'] } },
  arena:    { name: '闘技場',   icon: 'orc',      cost: { stone: 20 }, floorHint: '石材20', customers: true, tileW: 4,
              spend: { min: 2, max: 5, items: ['観戦券'] } },
  pachinko: { name: 'パチ屋',   icon: 'goblin',   cost: { stone: 16 }, floorHint: '石材16', customers: true, tileW: 3,
              spend: { min: 5, max: 15, items: ['台'], gamble: true } },
  idol:     { name: 'アイドルステージ', icon: 'griffon', cost: { rp: 400 }, floorHint: '研究点400', customers: true, tileW: 4,
              spend: { min: 5, max: 20, items: ['応援グッズ'] } },
  dorm:     { name: '宿舎',     icon: 'golem',    cost: { wood: 10 }, floorHint: '木材10', customers: false, tileW: 3 },
  library:  { name: '図書館',   icon: 'sylph',    cost: { rp: 200 }, floorHint: '研究点200', customers: false, tileW: 2 },
  lab:      { name: '研究院',   icon: 'wyvern',   cost: { stone: 14 }, floorHint: '石材14', customers: false, tileW: 3 },
};

// 施設ごとの会話ネタ(occupantが2体以上いる時に使う)
const CHAT_LINES = {
  mine: [
    (a, b) => `${a}がツルハシを振るい、${b}が崩れた石をかごに集めている。`,
    (a, b) => `${a}と${b}が、今日の採掘量について話している。`,
  ],
  sawmill: [
    (a, b) => `${a}が斧を振るい、${b}が丸太を運び出している。`,
  ],
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

// 消費時のフレーバー文言
const SPEND_LINE = (name, item, amount) => `${name}が${item}に${amount}Gを使った。`;
const SPEND_BROKE_LINE = (name) => `${name}は財布を覗き込み、諦めたようにため息をついた。今日は我慢だ。`;

const GRUMBLE_LINES = [
  (a, b) => `${a}が声を落とす。「外交部のあいつ、また安請け合いしただろう」。${b}も頷いている。`,
  (a, b) => `${a}と${b}が、遠くを歩く誰かを横目に、こそこそ話している。`,
];