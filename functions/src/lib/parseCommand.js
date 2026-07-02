const { startOfDay } = require('./dateUtils');

/************************************************************
 * テキスト解析 — main.js の parseReservationCommand を移植
 ************************************************************/
function parseReservationCommand(text, now) {
  const t = (text || '').trim();

  // 1:1トーク運用のため呼びかけワードは不要（グループ運用時の誤反応防止用に
  // あったが、1:1では発言はすべてBot宛てなので撤廃）。
  // 操作種別の判別（キャンセル・確認のキーワードがなければ予約とみなす）
  let action = 'reserve';
  if (/キャンセル|取消|取り消し/.test(t)) action = 'cancel';
  else if (/確認|予定/.test(t)) action = 'confirm';

  let targetDate = null;
  if (/今日|きょう/.test(t)) {
    targetDate = startOfDay(now);
  } else if (/明日|あした|あす/.test(t)) {
    targetDate = startOfDay(now);
    targetDate.setDate(targetDate.getDate() + 1);
  } else {
    const m = t.match(/(\d{1,2})\s*[\/月]\s*(\d{1,2})/);
    if (m) {
      const month = parseInt(m[1], 10);
      const day = parseInt(m[2], 10);
      targetDate = new Date(now.getFullYear(), month - 1, day);
      const todayMid = startOfDay(now);
      // 年をまたぐ場合（例: 12月に来年1月の日付を指定）は翌年とみなす
      if (targetDate < todayMid) targetDate.setFullYear(targetDate.getFullYear() + 1);
    }
  }

  if (!targetDate) return null;

  let slots;
  if (/午前|AM|am/.test(t)) slots = ['am'];
  else if (/午後|PM|pm/.test(t)) slots = ['pm'];
  else slots = ['am', 'pm']; // 枠指定がない場合は終日（両方）扱い

  return { action: action, date: targetDate, slots: slots };
}

module.exports = { parseReservationCommand };
