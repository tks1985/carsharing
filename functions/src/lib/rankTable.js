/************************************************************
 * ポピィ進化テーブル（50段階）
 * min0〜14（1〜5段階目）は据え置き。そこから先を再設計し、
 * 「正社員になる」までをじっくり長く、その後の出世コースも
 * 段階を細かくして、トータル50段階にしている。
 ************************************************************/
const RANK_TABLE = [
  // ここから5段階（0〜14）は変更しない
  { min: 0,   max: 2,   title: '卵から還ったばかりのポピィ', firstPerson: 'ぼく', ending: 'ピィ？',
    joyLine: 'これからいっぱいがんばるピィ！よろしくねピィ？' },
  { min: 3,   max: 5,   title: '見習いバイトのポピィ',       firstPerson: 'ぼく', ending: 'ピピッ',
    joyLine: 'やっと仕事おぼえてきたピピッ！もっと働くピピッ' },
  { min: 6,   max: 8,   title: 'お留守番専門ポピィ',         firstPerson: 'ぼく', ending: 'ピミュ',
    joyLine: 'お留守番、まかせてほしいピミュ！' },
  { min: 9,   max: 11,  title: '車の鍵守りポピィ',           firstPerson: 'ポピィ', ending: 'ピッ！',
    joyLine: '鍵はぜったい守るポピッ！信頼してほしいピッ！' },
  { min: 12,  max: 14,  title: 'JA仕入れ同行見習い',         firstPerson: 'ポピィ', ending: 'ピピュ！',
    joyLine: '今度は仕入れにも同行するポピュイ！頼れる相棒めざすピピュ！' },

  // ここから先が今回の再設計部分（15〜）
  // グループA: 正社員になるまでの長い下積み（ぼく）
  { min: 15,  max: 17,  title: 'パートタイムポピィ',           firstPerson: 'ぼく', ending: 'ピポッ',
    joyLine: 'もっと頑張れば正社員になれるかもしれないピポッ！' },
  { min: 18,  max: 20,  title: '見習い二年目ポピィ',           firstPerson: 'ぼく', ending: 'ピポピ',
    joyLine: '後輩もできてきたピポピ、でもまだまだ見習いピポピ' },
  { min: 21,  max: 23,  title: '繁忙期応援ポピィ',             firstPerson: 'ぼく', ending: 'ピタパタ',
    joyLine: '忙しい時期こそ頑張りどころだピタパタ！' },
  { min: 24,  max: 26,  title: '現場のムードメーカーポピィ',   firstPerson: 'ぼく', ending: 'ピチチ',
    joyLine: 'みんなを元気にするのがぼくの仕事だピチチ！' },
  { min: 27,  max: 29,  title: '契約更新おめでとうポピィ',     firstPerson: 'ぼく', ending: 'ピキュン',
    joyLine: '契約更新できたピキュン！ちょっとずつ前進ピキュン' },
  { min: 30,  max: 32,  title: '現場のエースポピィ',           firstPerson: 'ぼく', ending: 'ピシャキ',
    joyLine: '現場でならもう負けないピシャキ！' },
  { min: 33,  max: 35,  title: '昇格試験挑戦中ポピィ',         firstPerson: 'ぼく', ending: 'ピドキ',
    joyLine: '昇格試験、緊張するけど頑張るピドキ…' },
  { min: 36,  max: 38,  title: '合格発表待ちポピィ',           firstPerson: 'ぼく', ending: 'ピキンチョ',
    joyLine: '結果発表までドキドキだピキンチョ…' },
  { min: 39,  max: 41,  title: '内定者ポピィ',                 firstPerson: 'ぼく', ending: 'ピワク',
    joyLine: '内定もらえたピワク！あとは入社日を待つだけピワク！' },
  { min: 42,  max: 44,  title: '入社式前日ポピィ',             firstPerson: 'ぼく', ending: 'ピネム',
    joyLine: '緊張して昨日は眠れなかったピネム…でも楽しみピネム！' },

  // グループB: 正社員デビュー〜係長・課長（ぼく→おれ）
  { min: 45,  max: 48,  title: '正社員デビューポピィ',         firstPerson: 'ぼく', ending: 'ピャッホウ',
    joyLine: 'ついに正社員になれたピャッホウ！長かったけど嬉しいピャッホウ！' },
  { min: 49,  max: 52,  title: '新人正社員ポピィ',             firstPerson: 'ぼく', ending: 'ピッシャ',
    joyLine: '正社員としてまだまだ覚えることだらけだピッシャ' },
  { min: 53,  max: 56,  title: '一人前の正社員ポピィ',         firstPerson: 'ぼく', ending: 'チチチッ',
    joyLine: '一人前になってきた実感があるチチチッ' },
  { min: 57,  max: 60,  title: 'カーシェア主任ポピィ',         firstPerson: 'ぼく', ending: 'ピュイ',
    joyLine: '主任になったピュイ！みんなの予約、ぼくが管理するピュイ' },
  { min: 61,  max: 64,  title: '頼れる先輩主任ポピィ',         firstPerson: 'ぼく', ending: 'ピュイッコ',
    joyLine: '後輩に頼られる存在になってきたピュイッコ' },
  { min: 65,  max: 68,  title: '配車リーダーポピィ',           firstPerson: 'おれ', ending: 'ピシャ',
    joyLine: 'リーダーになったピシャ。おれに任せろピシャ' },
  { min: 69,  max: 72,  title: '優秀な配車係長ポピィ',         firstPerson: 'おれ', ending: 'ピシッ',
    joyLine: '係長就任ピシッ！配車はおれに任せろピシッ' },
  { min: 73,  max: 76,  title: '安全運転指導員ポピィ',         firstPerson: 'おれ', ending: 'ピピシッ',
    joyLine: '安全運転を後輩に教える立場になったピピシッ' },
  { min: 77,  max: 80,  title: '安全運転の鬼課長ポピィ',       firstPerson: 'おれ', ending: 'ピピピッ',
    joyLine: '課長になったピピピッ！安全運転、絶対厳守だピピピッ' },
  { min: 81,  max: 84,  title: '現場を束ねる名物課長ポピィ',   firstPerson: 'おれ', ending: 'ピピュン',
    joyLine: 'みんなから頼られる課長になったピピュン' },

  // グループC: 部長〜執行役員〜副社長（おれ→わたし→わたくし）
  { min: 85,  max: 90,  title: '次期部長候補ポピィ',           firstPerson: 'おれ',     ending: 'ピュムッ',
    joyLine: '部長候補に選ばれたピュムッ、身が引き締まるピュムッ' },
  { min: 91,  max: 96,  title: 'もふもふ部長ポピィ',           firstPerson: 'わたし',   ending: 'ピュイッ',
    joyLine: '部長就任ピュイッ！もふもふパワーで会社を守るピュイッ' },
  { min: 97,  max: 102, title: '頼れるもふもふ部長ポピィ',     firstPerson: 'わたし',   ending: 'ピュムン',
    joyLine: '部下からの信頼も厚くなってきたピュムン' },
  { min: 103, max: 108, title: '事業部を率いるポピィ',         firstPerson: 'わたし',   ending: 'ピシュル',
    joyLine: '事業部全体を見る立場になったピシュル' },
  { min: 109, max: 114, title: '次世代リーダー候補ポピィ',     firstPerson: 'わたし',   ending: 'ピュルン',
    joyLine: '次世代を担う一人に選ばれたピュルン' },
  { min: 115, max: 120, title: '執行役員インコ',               firstPerson: 'わたし',   ending: 'ピッ。',
    joyLine: '執行役員に就任いたしましたピッ。これからも経営に貢献しますピッ。' },
  { min: 121, max: 126, title: '常務執行役員インコ',           firstPerson: 'わたし',   ending: 'ピッコ。',
    joyLine: '常務に昇格いたしましたピッコ。責任も増えますピッコ。' },
  { min: 127, max: 132, title: '専務執行役員インコ',           firstPerson: 'わたし',   ending: 'ピムッ。',
    joyLine: '専務にまで上り詰めましたピムッ。感慨深いですピムッ。' },
  { min: 133, max: 138, title: '次期副社長候補インコ',         firstPerson: 'わたし',   ending: 'ピュ。',
    joyLine: '副社長候補になりましたピュ。身の引き締まる思いですピュ。' },
  { min: 139, max: 144, title: '副社長ポピィ',                 firstPerson: 'わたくし', ending: 'ピピュイ。',
    joyLine: '副社長を拝命しましたピピュイ。社を挙げてカーシェアに尽力いたしますピピュイ。' },

  // グループD: CEO〜会長〜総帥（わたくし→ポピィ社長→ポピィ会長→我）
  { min: 145, max: 154, title: '筆頭副社長ポピィ',             firstPerson: 'わたくし',   ending: 'ピュイム。',
    joyLine: '筆頭副社長という重責を賜りましたピュイム。' },
  { min: 155, max: 164, title: '次期CEO最終候補ポピィ',        firstPerson: 'わたくし',   ending: 'ピュイモ。',
    joyLine: 'とうとう次期CEOの最終候補になりましたピュイモ。' },
  { min: 165, max: 174, title: '最高経営責任者(CEO)ポピィ',    firstPerson: 'ポピィ社長', ending: 'ピュイ。',
    joyLine: '本日よりCEOに就任いたしましたピュイ。皆様のご期待に応えてまいりますピュイ。' },
  { min: 175, max: 184, title: '増収増益社長ポピィ',           firstPerson: 'ポピィ社長', ending: 'ピュイヤ。',
    joyLine: '増収増益を達成いたしましたピュイヤ。' },
  { min: 185, max: 194, title: '業界の顔ポピィ',               firstPerson: 'ポピィ社長', ending: 'ピュイヨ。',
    joyLine: '業界を代表する存在になりましたピュイヨ。' },
  { min: 195, max: 204, title: 'カリスマ創業者ポピィ',         firstPerson: 'ポピィ会長', ending: 'ピピピッ！',
    joyLine: '会長就任だピピピッ！カリスマ経営、見せてやるピピピッ！' },
  { min: 205, max: 214, title: '伝説の会長ポピィ',             firstPerson: 'ポピィ会長', ending: 'ピピュン！',
    joyLine: '伝説と呼ばれるようになったピピュン！' },
  { min: 215, max: 224, title: '名誉会長ポピィ',               firstPerson: 'ポピィ会長', ending: 'ピピュラ！',
    joyLine: '名誉会長の称号をいただいたピピュラ！' },
  { min: 225, max: 234, title: '経済界のドンポピィ',           firstPerson: 'ポピィ会長', ending: 'ピュゴォ！',
    joyLine: '経済界でも一目置かれる存在になったピュゴォ！' },
  { min: 235, max: 244, title: 'グループ統括総帥ポピィ',       firstPerson: '我',         ending: 'フハハ、ピィ',
    joyLine: '我、統括総帥に昇りつめたり。フハハ、ピィ' },

  // グループE: 財閥のドン〜宇宙（当職→司令官→総統→光→宇宙）
  { min: 245, max: 264, title: '粟の穂財閥のドン',             firstPerson: '当職',   ending: 'ピュイ…',
    joyLine: '当職、財閥のドンとなった…ピュイ…この街のカーシェアはすべて当職の掌中にあるピュイ…' },
  { min: 265, max: 284, title: '地球防衛配車軍総司令',         firstPerson: '司令官', ending: 'ピッ！',
    joyLine: '司令官である、諸君！地球の配車は我々が守るピッ！' },
  { min: 285, max: 304, title: '銀河カーシェア連合総統',       firstPerson: '総統',   ending: 'ピュイッ！',
    joyLine: '総統に就任した！銀河のすみずみまで予約を統率するピュイッ！' },
  { min: 305, max: 324, title: '時空を超える聖鳥',             firstPerson: '光',     ending: 'ピィ…',
    joyLine: '光として、時を超え、すべての予約を見守るピィ…' },
  { min: 325, max: null, title: 'カーシェアの概念',            firstPerson: '宇宙',   ending: 'ピュイ……',
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
