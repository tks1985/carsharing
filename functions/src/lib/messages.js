/************************************************************
 * メッセージ文言 — main.js から移植
 * dateLabel は呼び出し側で formatDateLabel 済みの文字列を渡す
 ************************************************************/
function withPopiSuffix(title) {
  return title.indexOf('ポピィ') !== -1 ? title : title + 'ポピィ';
}

// 誰がいつ予約/キャンセルしたかが一目で分かる簡潔な形式。
// 肩書きの前置きと経験値の言及は毎回うるさいので出さない（出世時のみ別メッセージで報告）。
function buildReservationMessage(rank, displayName, dateLabel, slotLabel) {
  return '✅ ' + dateLabel + ' ' + slotLabel + '\n' + displayName + 'さんが予約した' + rank.ending;
}

function buildCancelMessage(rank, displayName, dateLabel, slotLabel) {
  return '❌ ' + dateLabel + ' ' + slotLabel + '\n' + displayName + 'さんがキャンセルした' + rank.ending;
}

function buildLevelUpMessage(rank) {
  return 'ポピュイ！' + rank.firstPerson + 'の経験値が溜まって、今日から【' + rank.title + '】に出世した' + rank.ending + '！' + rank.joyLine;
}

module.exports = { withPopiSuffix, buildReservationMessage, buildCancelMessage, buildLevelUpMessage };
