const express = require('express');
const CONFIG = require('../lib/config');
const { getRankInfo } = require('../lib/rankTable');
const { formatDateKey, formatDateLabel, parseDateKey, getCurrentSlotKey, startOfDay } = require('../lib/dateUtils');
const { buildReservationMessage, buildCancelMessage, buildLevelUpMessage } = require('../lib/messages');
const { multicastMessage } = require('../lib/lineApi');
const store = require('../lib/firestore');

const router = express.Router();

router.use(function (req, res, next) {
  const auth = req.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token !== CONFIG.API_ACCESS_TOKEN) {
    console.error('api forbidden: token mismatch');
    return res.status(403).json({ ok: false, message: 'forbidden' });
  }
  next();
});

router.get('/schedule', async function (req, res) {
  try {
    const data = await getScheduleData(req.query.viewer || '');
    res.json(Object.assign({ ok: true }, data));
  } catch (err) {
    console.error('schedule error: ' + err.stack);
    res.status(500).json({ ok: false, message: String(err) });
  }
});

router.post('/reserve', async function (req, res) {
  try {
    const body = req.body || {};
    const result = await store.reserveSlot(body.date, body.slot, body.viewer);
    if (!result.ok) {
      return res.json({ ok: false, message: 'その枠はもう埋まってるピィ…' });
    }
    const rankAfter = getRankInfo(result.count);
    const rankBefore = getRankInfo(result.count - 1);
    const dateLabel = formatDateLabel(parseDateKey(body.date));
    const slotLabel = body.slot === 'am' ? '午前' : '午後';
    const messages = [{ type: 'text', text: buildReservationMessage(rankAfter, body.viewer, dateLabel, slotLabel) }];
    if (rankBefore.title !== rankAfter.title) messages.push({ type: 'text', text: buildLevelUpMessage(rankAfter) });
    const userIds = await store.getAllUserIds();
    await multicastMessage(userIds, messages, CONFIG.LINE_CHANNEL_ACCESS_TOKEN);
    res.json({ ok: true, message: '予約したピィ！', count: result.count, rank: rankAfter.title });
  } catch (err) {
    console.error('reserve error: ' + err.stack);
    res.status(500).json({ ok: false, message: String(err) });
  }
});

router.post('/cancel', async function (req, res) {
  try {
    const body = req.body || {};
    const result = await store.cancelSlot(body.date, body.slot, body.viewer);
    if (!result.ok) {
      return res.json({ ok: false, message: 'キャンセルできなかったピィ…' });
    }
    const count = await store.getCount();
    const rank = getRankInfo(count);
    const dateLabel = formatDateLabel(parseDateKey(body.date));
    const slotLabel = body.slot === 'am' ? '午前' : '午後';
    const userIds = await store.getAllUserIds();
    await multicastMessage(userIds, [{ type: 'text', text: buildCancelMessage(rank, body.viewer, dateLabel, slotLabel) }], CONFIG.LINE_CHANNEL_ACCESS_TOKEN);
    res.json({ ok: true, message: 'キャンセルしたピィ' });
  } catch (err) {
    console.error('cancel error: ' + err.stack);
    res.status(500).json({ ok: false, message: String(err) });
  }
});

async function getScheduleData(viewerName) {
  const count = await store.getCount();
  const rank = getRankInfo(count);

  const today = startOfDay(new Date());
  const rangeDays = CONFIG.CALENDAR_RANGE_DAYS;
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + rangeDays - 1);
  const map = await store.getScheduleRange(formatDateKey(today), formatDateKey(endDate));

  const nowSlotKey = getCurrentSlotKey(new Date(), CONFIG.AFTERNOON_START_HOUR);
  const days = [];
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const dateKey = formatDateKey(d);
    const entry = map[dateKey] || {};
    days.push({
      dateKey: dateKey,
      label: formatDateLabel(d),
      am: slotState(entry.am, viewerName, i === 0 && nowSlotKey === 'am'),
      pm: slotState(entry.pm, viewerName, i === 0 && nowSlotKey === 'pm')
    });
  }

  return {
    rank: { title: rank.title, ending: rank.ending, message: rank.joyLine },
    count: count,
    prevThreshold: rank.min,
    nextThreshold: rank.max,
    days: days
  };
}

function slotState(name, viewerName, isNow) {
  if (!name) return { state: 'empty', isNow: !!isNow };
  if (name === viewerName) return { state: 'mine', name: name, isNow: !!isNow };
  return { state: 'others', name: name, isNow: !!isNow };
}

module.exports = router;
