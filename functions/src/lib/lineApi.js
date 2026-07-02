const crypto = require('crypto');

async function getDisplayName(source, channelAccessToken) {
  let url;
  if (source.type === 'group') {
    url = 'https://api.line.me/v2/bot/group/' + source.groupId + '/member/' + source.userId;
  } else if (source.type === 'room') {
    url = 'https://api.line.me/v2/bot/room/' + source.roomId + '/member/' + source.userId;
  } else {
    url = 'https://api.line.me/v2/bot/profile/' + source.userId;
  }
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + channelAccessToken } });
  const text = await res.text();
  if (!res.ok) {
    console.error('getDisplayName failed: status=' + res.status + ' body=' + text);
    return '名無しさん';
  }
  const json = JSON.parse(text);
  return json.displayName || '名無しさん';
}

async function replyMessage(replyToken, messages, channelAccessToken) {
  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + channelAccessToken },
    body: JSON.stringify({ replyToken: replyToken, messages: messages })
  });
  await logLineApiResult('replyMessage', res);
}

// 家族全員（1:1で登録済みの全userId）に同じ内容を配信する。
// LINEのmulticastは宛先0件だとエラーになるため、その場合は何もしない。
async function multicastMessage(userIds, messages, channelAccessToken) {
  if (!userIds || userIds.length === 0) {
    console.error('multicastMessage skipped: no registered userIds yet');
    return;
  }
  const res = await fetch('https://api.line.me/v2/bot/message/multicast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + channelAccessToken },
    body: JSON.stringify({ to: userIds, messages: messages })
  });
  await logLineApiResult('multicastMessage', res);
}

async function logLineApiResult(label, res) {
  if (!res.ok) {
    const body = await res.text().catch(function () { return ''; });
    console.error(label + ' failed: status=' + res.status + ' body=' + body);
  } else {
    console.log(label + ' ok: status=' + res.status);
  }
}

// LINEの公式署名検証方式: HMAC-SHA256(channelSecret, rawBody) の base64 と
// x-line-signature ヘッダをタイミングセーフに比較する。GASではHTTPヘッダを
// 読めなかったため実装できなかった、本来あるべき検証。
function verifySignature(rawBody, signatureHeader, channelSecret) {
  if (!signatureHeader || !rawBody) return false;
  const expected = crypto.createHmac('sha256', channelSecret).update(rawBody).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { getDisplayName, replyMessage, multicastMessage, verifySignature };
