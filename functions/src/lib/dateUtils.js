/************************************************************
 * 日付ユーティリティ
 * GASの Utilities.formatDate は使えないため素のDateで再実装する。
 * ローカルgetter（getFullYear/getMonth/getDate/getDay/getHours）を
 * 日本時間として扱えるよう、プロセスの TZ 環境変数を Asia/Tokyo に
 * 設定しておくことが前提（config.js で確認・警告している）。
 ************************************************************/
const DOW = ['日', '月', '火', '水', '木', '金', '土'];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDateKey(dateInput) {
  const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function formatDateLabel(dateObj) {
  return (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '(' + DOW[dateObj.getDay()] + ')';
}

function parseDateKey(dateKey) {
  const parts = dateKey.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function getCurrentSlotKey(now, afternoonStartHour) {
  return now.getHours() < afternoonStartHour ? 'am' : 'pm';
}

module.exports = { startOfDay, formatDateKey, formatDateLabel, parseDateKey, getCurrentSlotKey };
