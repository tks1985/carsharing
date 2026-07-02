const express = require('express');
const CONFIG = require('../lib/config');
const { verifySignature, getDisplayName, replyMessage, multicastMessage } = require('../lib/lineApi');
const { parseReservationCommand } = require('../lib/parseCommand');
const { getRankInfo } = require('../lib/rankTable');
const { formatDateKey, formatDateLabel } = require('../lib/dateUtils');
const { withPopiSuffix, buildReservationMessage, buildCancelMessage, buildLevelUpMessage } = require('../lib/messages');
const { matchSmallTalk } = require('../lib/smallTalk');
const store = require('../lib/firestore');

const router = express.Router();

router.post('/', async function (req, res) {
  const signature = req.get('x-line-signature');
  if (!verifySignature(req.rawBody, signature, CONFIG.LINE_CHANNEL_SECRET)) {
    console.error('webhook forbidden: signature mismatch');
    return res.status(403).send('forbidden');
  }

  const events = (req.body && req.body.events) || [];
  console.log('webhook events count=' + events.length);

  for (const event of events) {
    try {
      await handleEvent(event);
    } catch (err) {
      // LINEにリトライさせないよう、ここで例外を飲み込んで常に200を返す
      console.error('handleEvent error: ' + (err && err.stack ? err.stack : err));
    }
  }

  res.status(200).json({ status: 'ok' });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const source = event.source;
  const displayName = await getDisplayName(source, CONFIG.LINE_CHANNEL_ACCESS_TOKEN);
  console.log('handleEvent displayName="' + displayName + '"');

  // 1:1（またはグループ）でメッセージを送ってきた人を家族として自動登録する。
  // これがLINE_GROUP_IDの代わりで、multicast通知の宛先リストになる。
  if (source.userId) {
    await store.registerUser(source.userId, displayName);
  }

  const parsed = parseReservationCommand(event.message.text, new Date());
  console.log('handleEvent text="' + event.message.text + '" parsed=' + JSON.stringify(parsed));
  if (!parsed) {
    const smallTalkReply = matchSmallTalk(event.message.text);
    if (smallTalkReply) {
      await replyMessage(event.replyToken, [{ type: 'text', text: smallTalkReply }], CONFIG.LINE_CHANNEL_ACCESS_TOKEN);
    }
    return;
  }

  let result;
  if (parsed.action === 'cancel') {
    result = await handleCancelAction(parsed, displayName);
  } else if (parsed.action === 'confirm') {
    result = await handleConfirmAction(parsed);
  } else {
    result = await handleReserveAction(parsed, displayName);
  }

  // エラー・確認結果は送信者本人にのみ reply。予約/キャンセル/出世の確定通知は
  // 家族全員に multicast（グループ通知の代替）。
  if (result.privateMessages.length > 0) {
    await replyMessage(event.replyToken, result.privateMessages.slice(0, 5), CONFIG.LINE_CHANNEL_ACCESS_TOKEN);
  }
  if (result.broadcastMessages.length > 0) {
    const userIds = await store.getAllUserIds();
    await multicastMessage(userIds, result.broadcastMessages.slice(0, 5), CONFIG.LINE_CHANNEL_ACCESS_TOKEN);
  }
}

async function handleReserveAction(parsed, displayName) {
  const broadcastMessages = [];
  const privateMessages = [];
  const dateKey = formatDateKey(parsed.date);
  const dateLabel = formatDateLabel(parsed.date);
  for (const slotKey of parsed.slots) {
    const slotLabel = slotKey === 'am' ? '午前' : '午後';
    const result = await store.reserveSlot(dateKey, slotKey, displayName);
    if (!result.ok) {
      privateMessages.push({ type: 'text', text: 'その枠はもう埋まってるピィ…（' + dateLabel + ' ' + slotLabel + '）' });
      continue;
    }
    const rankAfter = getRankInfo(result.count);
    const rankBefore = getRankInfo(result.count - 1);
    broadcastMessages.push({ type: 'text', text: buildReservationMessage(rankAfter, displayName, dateLabel, slotLabel) });
    if (rankBefore.title !== rankAfter.title) {
      broadcastMessages.push({ type: 'text', text: buildLevelUpMessage(rankAfter) });
    }
  }
  return { broadcastMessages: broadcastMessages, privateMessages: privateMessages };
}

async function handleCancelAction(parsed, displayName) {
  const broadcastMessages = [];
  const privateMessages = [];
  const count = await store.getCount();
  const rank = getRankInfo(count);
  const dateKey = formatDateKey(parsed.date);
  const dateLabel = formatDateLabel(parsed.date);
  for (const slotKey of parsed.slots) {
    const slotLabel = slotKey === 'am' ? '午前' : '午後';
    const result = await store.cancelSlot(dateKey, slotKey, displayName);
    if (!result.ok) {
      if (result.reason === 'not_found') {
        privateMessages.push({ type: 'text', text: dateLabel + 'の' + slotLabel + 'はまだ誰も予約してない' + rank.ending });
      } else {
        privateMessages.push({ type: 'text', text: dateLabel + 'の' + slotLabel + 'は' + result.owner + 'さんの予約だからキャンセルできない' + rank.ending });
      }
      continue;
    }
    broadcastMessages.push({ type: 'text', text: buildCancelMessage(rank, displayName, dateLabel, slotLabel) });
  }
  return { broadcastMessages: broadcastMessages, privateMessages: privateMessages };
}

async function handleConfirmAction(parsed) {
  const count = await store.getCount();
  const rank = getRankInfo(count);
  const dateKey = formatDateKey(parsed.date);
  const dateLabel = formatDateLabel(parsed.date);
  const lines = [];
  for (const slotKey of parsed.slots) {
    const slotLabel = slotKey === 'am' ? '午前' : '午後';
    const owner = await store.getSlotOwner(dateKey, slotKey);
    lines.push(slotLabel + '：' + (owner ? owner + 'さんが予約中' : '空き'));
  }
  const text = withPopiSuffix(rank.title) + 'からのお知らせ：' + dateLabel + 'の予定は…\n' + lines.join('\n') + '\nこんな感じ' + rank.ending;
  return { broadcastMessages: [], privateMessages: [{ type: 'text', text: text }] };
}

module.exports = router;
