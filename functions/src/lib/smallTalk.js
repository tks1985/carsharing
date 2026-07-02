/************************************************************
 * 予約コマンドとして解釈されなかったメッセージへの軽い雑談応答
 ************************************************************/
const PATTERNS = [
  { test: /おはよ/, reply: 'おはようピィ！今日も一日がんばるピィ！' },
  { test: /こんにちは/, reply: 'こんにちはピィ！' },
  { test: /こんばんは/, reply: 'こんばんはピィ〜' },
  { test: /おやすみ/, reply: 'おやすみピィ、また明日ピィ' },
  { test: /おつかれ|お疲れ/, reply: 'おつかれさまピィ！ゆっくり休むピィ' },
  { test: /がんば|頑張/, reply: 'ありがとうピィ！がんばるピィ！' },
  { test: /ありがと/, reply: 'どういたしましてピィ！' }
];

function matchSmallTalk(text) {
  const hit = PATTERNS.find(function (p) { return p.test.test(text); });
  return hit ? hit.reply : null;
}

module.exports = { matchSmallTalk };
