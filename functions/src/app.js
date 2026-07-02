const express = require('express');
const cors = require('cors');
const webhookRouter = require('./routes/webhook');
const apiRouter = require('./routes/api');

const app = express();

// 注意: Cloud Functions Framework が functions.http() 経由で呼ばれる前に
// req.body / req.rawBody をすでにパース済みで渡してくる。ここで
// express.json() 等のbody-parserを重ねて適用すると、消費済みのリクエスト
// ストリームを再度読もうとしてハングする。追加しないこと。

app.use('/api', cors({
  origin: 'https://tks1985.github.io',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/webhook', webhookRouter);
app.use('/api', apiRouter);

app.get('/', function (req, res) {
  res.status(200).send('ok');
});

module.exports = app;
