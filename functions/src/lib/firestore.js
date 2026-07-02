const { Firestore, FieldValue } = require('@google-cloud/firestore');

const db = new Firestore();

function slotDocId(dateKey, slotKey) {
  return dateKey + '_' + slotKey;
}

async function getSlotOwner(dateKey, slotKey) {
  const snap = await db.collection('reservations').doc(slotDocId(dateKey, slotKey)).get();
  return snap.exists ? snap.data().displayName : null;
}

// 30日分カレンダー表示用: date範囲クエリ1回で全件取得する（単一フィールドの範囲
// クエリなので複合インデックス不要）
async function getScheduleRange(startKey, endKey) {
  const snap = await db.collection('reservations')
    .where('date', '>=', startKey)
    .where('date', '<=', endKey)
    .orderBy('date')
    .get();
  const map = {};
  snap.forEach(function (doc) {
    const d = doc.data();
    if (!map[d.date]) map[d.date] = {};
    map[d.date][d.slot] = d.displayName;
  });
  return map;
}

async function getCount() {
  const snap = await db.collection('status').doc('current').get();
  return snap.exists ? (snap.data().count || 0) : 0;
}

// LockService.getScriptLock() の置き換え。Firestoreトランザクションなので
// 同一の予約枠ドキュメントへの書き込み同士のみが競合し、無関係な日付の
// 予約とは競合しない（GAS版は全実行を直列化していたため、これは実質的な改善）。
async function reserveSlot(dateKey, slotKey, displayName) {
  const slotRef = db.collection('reservations').doc(slotDocId(dateKey, slotKey));
  const statusRef = db.collection('status').doc('current');

  return db.runTransaction(async function (tx) {
    const slotSnap = await tx.get(slotRef);
    if (slotSnap.exists) {
      return { ok: false, taken: true, owner: slotSnap.data().displayName };
    }
    const statusSnap = await tx.get(statusRef);
    const before = statusSnap.exists ? (statusSnap.data().count || 0) : 0;
    const after = before + 1;

    tx.set(slotRef, { date: dateKey, slot: slotKey, displayName: displayName, reservedAt: FieldValue.serverTimestamp() });
    tx.set(statusRef, { count: after }, { merge: true });

    return { ok: true, count: after };
  });
}

// キャンセル成功時は経験値も1減らす（このスロットが誰かの reserveSlot による
// +1と対になっているものだけがキャンセル可能なため、負になることはない）。
async function cancelSlot(dateKey, slotKey, displayName) {
  const slotRef = db.collection('reservations').doc(slotDocId(dateKey, slotKey));
  const statusRef = db.collection('status').doc('current');
  return db.runTransaction(async function (tx) {
    const snap = await tx.get(slotRef);
    if (!snap.exists) return { ok: false, reason: 'not_found' };
    if (snap.data().displayName !== displayName) return { ok: false, reason: 'not_owner', owner: snap.data().displayName };
    tx.delete(slotRef);
    tx.set(statusRef, { count: FieldValue.increment(-1) }, { merge: true });
    return { ok: true };
  });
}

// 1:1でBotにメッセージを送ってきたユーザーを自動登録する（グループIDの
// 代わり）。予約/キャンセル成功時のmulticast通知先として使う。
async function registerUser(userId, displayName) {
  await db.collection('users').doc(userId).set(
    { displayName: displayName, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

async function getAllUserIds() {
  const snap = await db.collection('users').get();
  return snap.docs.map(function (doc) { return doc.id; });
}

module.exports = { getSlotOwner, getScheduleRange, getCount, reserveSlot, cancelSlot, registerUser, getAllUserIds };
