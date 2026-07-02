/************************************************************
 * ポピィ進化テーブル（20段階） — main.js から移植
 ************************************************************/
const RANK_TABLE = [
  { min: 0,   max: 2,   title: '卵から還ったばかりのポピィ', firstPerson: 'ぼく',      ending: 'ピィ？',
    joyLine: 'これからいっぱいがんばるピィ！よろしくねピィ？' },
  { min: 3,   max: 5,   title: '見習いバイトのポピィ',       firstPerson: 'ぼく',      ending: 'ピピッ',
    joyLine: 'やっと仕事おぼえてきたピピッ！もっと働くピピッ' },
  { min: 6,   max: 8,   title: 'お留守番専門ポピィ',         firstPerson: 'ぼく',      ending: 'ピミュ',
    joyLine: 'お留守番、まかせてほしいピミュ！' },
  { min: 9,   max: 11,  title: '車の鍵守りポピィ',           firstPerson: 'ポピィ',    ending: 'ピッ！',
    joyLine: '鍵はぜったい守るポピッ！信頼してほしいピッ！' },
  { min: 12,  max: 14,  title: 'JA仕入れ同行見習い',         firstPerson: 'ポピィ',    ending: 'ピピュ！',
    joyLine: '今度は仕入れにも同行するポピュイ！頼れる相棒めざすピピュ！' },
  { min: 15,  max: 17,  title: '一人前の正社員ポピィ',       firstPerson: 'ぼく',      ending: 'チチチッ',
    joyLine: 'ついに正社員になったチチチッ！今日から本気出すチチチッ' },
  { min: 18,  max: 20,  title: 'カーシェア主任ポピィ',       firstPerson: 'ぼく',      ending: 'ピュイ',
    joyLine: '主任になったピュイ！みんなの予約、ぼくが管理するピュイ' },
  { min: 21,  max: 24,  title: '優秀な配車係長ポピィ',       firstPerson: 'おれ',      ending: 'ピシッ',
    joyLine: '係長就任ピシッ！配車はおれに任せろピシッ' },
  { min: 25,  max: 28,  title: '安全運転の鬼課長ポピィ',     firstPerson: 'おれ',      ending: 'ピピピッ',
    joyLine: '課長になったピピピッ！安全運転、絶対厳守だピピピッ' },
  { min: 29,  max: 32,  title: 'もふもふ部長ポピィ',         firstPerson: 'わたし',    ending: 'ピュイッ',
    joyLine: '部長就任ピュイッ！もふもふパワーで会社を守るピュイッ' },
  { min: 33,  max: 36,  title: '執行役員インコ',             firstPerson: 'わたし',    ending: 'ピッ。',
    joyLine: '執行役員に就任いたしましたピッ。これからも経営に貢献しますピッ。' },
  { min: 37,  max: 40,  title: '副社長ポピィ',               firstPerson: 'わたくし',  ending: 'ピピュイ。',
    joyLine: '副社長を拝命しましたピピュイ。社を挙げてカーシェアに尽力いたしますピピュイ。' },
  { min: 41,  max: 45,  title: '最高経営責任者(CEO)ポピィ',  firstPerson: 'ポピィ社長', ending: 'ピュイ。',
    joyLine: '本日よりCEOに就任いたしましたピュイ。皆様のご期待に応えてまいりますピュイ。' },
  { min: 46,  max: 50,  title: 'カリスマ創業者ポピィ',       firstPerson: 'ポピィ会長', ending: 'ピピピッ！',
    joyLine: '会長就任だピピピッ！カリスマ経営、見せてやるピピピッ！' },
  { min: 51,  max: 60,  title: 'グループ統括総帥ポピィ',     firstPerson: '我',        ending: 'フハハ、ピィ',
    joyLine: '我、統括総帥に昇りつめたり。フハハ、ピィ' },
  { min: 61,  max: 70,  title: '粟の穂財閥のドン',           firstPerson: '当職',      ending: 'ピュイ…',
    joyLine: '当職、財閥のドンとなった…ピュイ…この街のカーシェアはすべて当職の掌中にあるピュイ…' },
  { min: 71,  max: 80,  title: '地球防衛配車軍総司令',       firstPerson: '司令官',    ending: 'ピッ！',
    joyLine: '司令官である、諸君！地球の配車は我々が守るピッ！' },
  { min: 81,  max: 90,  title: '銀河カーシェア連合総統',     firstPerson: '総統',      ending: 'ピュイッ！',
    joyLine: '総統に就任した！銀河のすみずみまで予約を統率するピュイッ！' },
  { min: 91,  max: 99,  title: '時空を超える聖鳥',           firstPerson: '光',        ending: 'ピィ…',
    joyLine: '光として、時を超え、すべての予約を見守るピィ…' },
  { min: 100, max: null, title: 'カーシェアの概念',          firstPerson: '宇宙',      ending: 'ピュイ……',
    joyLine: '宇宙…もはや我は概念そのもの…予約という現象そのものであるピュイ……' }
];

function getRankInfo(count) {
  for (let i = 0; i < RANK_TABLE.length; i++) {
    const tier = RANK_TABLE[i];
    if (count >= tier.min && (tier.max === null || count <= tier.max)) return tier;
  }
  return RANK_TABLE[RANK_TABLE.length - 1];
}

module.exports = { RANK_TABLE, getRankInfo };
