# carsharing — ポピィ店長のカーシェア

3人家族（夫・妻・義母）向けの車シェア予約LINE Bot。LINEで「明日の午前」のように送ると予約でき、Botのキャラクター「ポピィ」が累計予約数に応じて20段階に「進化」していくゲーミフィケーション付き。予約はLINEの1:1トークのテキストコマンドと、リッチメニューから開くLIFF（LINE製のミニアプリ）のタップ操作の両方から行える。

このREADMEは、会話履歴が失われた状態でこのリポジトリだけを読んだ人（未来の自分やAIアシスタント含む）が迷わないように書いている。

## 現在の構成

```
LINE (1:1トーク・リッチメニュー)
  ├─ Webhook ──▶ Cloud Functions (functions/) ──▶ Firestore
  └─ リッチメニュー タップ ──▶ LIFF (index.html, GitHub Pages) ──▶ Cloud Functions API ──▶ Firestore
```

- **バックエンド**: Google Cloud Functions（第2世代, Node.js, Express）＋ Firestore（Nativeモード）
  - GCPプロジェクト: `popi-carshare-bot` / リージョン: `asia-northeast1`（東京）
  - デプロイ名: `popi-bot`
  - URL: `https://asia-northeast1-popi-carshare-bot.cloudfunctions.net/popi-bot`
  - ソース: [functions/](functions/)
- **フロントエンド（LIFF）**: 静的HTML（[index.html](index.html)）を GitHub Actions でビルドして GitHub Pages に配信
  - このリポジトリ自体がGitHub Pagesの公開元（Public）: https://tks1985.github.io/carsharing/
  - `index.html`にコミットされているのは`__LIFF_ID__`等のプレースホルダーのみ。実際の値はリポジトリのActions Secrets（`LIFF_ID`/`API_BASE_URL`/`API_ACCESS_TOKEN`）に保存されており、pushのたびに[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)が置換してデプロイする（詳細は後述）
  - Pagesの設定は「Source: GitHub Actions」（「Deploy from a branch」ではない）
- **LINE設定**: Messaging APIチャネル（Bot本体）＋ 別のLINE Loginチャネル（LIFFはこちらでしか作れない）。同一Providerに所属していれば連携設定は不要
- **リッチメニュー**: LINE Official Account Manager（manager.line.biz）の画面から手動設定。LIFF URL（`https://liff.line.me/{LIFF_ID}`）へのリンクのみで、コード側の実装は無し

## ディレクトリ構成

```
index.html              LIFFページ（値はプレースホルダー、ビルド時に注入される）
assets/popi-icon.png     LIFFヘッダーのポピィのアイコン画像
.github/workflows/deploy-pages.yml   Actions Secretsを注入してGitHub Pagesへデプロイするワークフロー
functions/               Cloud Functionsのソース（現行バックエンド）
  index.js                エントリーポイント（functions.http('popiBot', app)）
  src/app.js               Expressアプリ本体（ルーティング・CORS設定）
  src/routes/webhook.js     LINE Webhook（POST /webhook）
  src/routes/api.js         LIFF用JSON API（GET /api/schedule, POST /api/reserve, POST /api/cancel）
  src/lib/                  ロジック本体（rankTable/parseCommand/dateUtils/messages/firestore/lineApi）
  .env.yaml                 本物の秘密情報（gitignore対象・リポジトリには含まれない）
  .env.yaml.example         必要な環境変数名のテンプレート
main.js, appsscript.json, ind   過去に使っていたGoogle Apps Script版の名残（後述、gitignore対象）
```

## 過去の経緯（なぜ今の形になっているか）

最初はGoogle Apps Script（`main.js`）＋Google スプレッドシートで構築した。理由は「無料・追加インフラ不要ですぐ動かせる」ため。しかし実運用で以下の問題が出て、Cloud Functions + Firestoreへ全面移行した（`main.js`はもう使っていない。秘密情報が直書きされたままなのでリポジトリには含めていない）。

1. **LINE内蔵ブラウザでLIFFのfetch()が正しく解決されない**: GASのWebアプリは常に`script.googleusercontent.com`への302リダイレクトでレスポンスを返す仕組みで、これがLIFFの`liff.init()`やLINE内蔵ブラウザのfetch処理と相性が悪く、タップしても無反応になる不具合があった。Cloud Functionsはリダイレクトなしで直接レスポンスを返すため解消した。
2. **速度**: GASは1操作あたりSpreadsheetApp呼び出しを何度も直列実行するため約2秒かかっていた。FirestoreのトランザクションはLockServiceより競合範囲が狭く、体感速度も改善した（ただしCloud Functionsは低頻度アクセスだとコールドスタートの影響を受けるため、劇的な高速化ではない）。
3. **Webhookの署名検証ができなかった**: GASの`doPost(e)`はHTTPヘッダを読めない仕様のため、LINEの正式な署名検証（`x-line-signature`）が実装できず、簡易トークンのクエリパラメータで代用していた。Cloud Functions（Express）はヘッダを読めるため、正式なHMAC-SHA256署名検証を実装している（[functions/src/lib/lineApi.js](functions/src/lib/lineApi.js)の`verifySignature`）。

また、途中で**グループLINE運用から1:1トーク運用に方針変更**した。リッチメニューはBotとの1:1トークにしか表示できないため。これに伴い、LINE_GROUP_IDへのpush通知だった仕組みを、Firestoreの`users`コレクションに1:1で話しかけてきた人を自動登録し、家族全員へmulticast配信する方式に変更した。

## 覚えておくべき設計判断・ハマりどころ

- **TZ環境変数が必須**: Node.jsには GAS の `appsscript.json` timeZone 相当の自動時刻補正がない。`functions/.env.yaml` に `TZ: "Asia/Tokyo"` が無いと、日本時間0:00〜8:59の間だけ「今日/明日」の判定がズレるバグになる（日中のテストでは気づけない）。[functions/src/lib/config.js](functions/src/lib/config.js) で起動時に警告ログを出している。
- **累計経験値（`status/current`のcount）は、キャンセルすると1減る**（最初は「減らない」仕様だったが、連打で不正に進化できてしまうため変更した）。予約が対応するキャンセルでのみ減算されるため、0未満にはならない。
- **呼びかけワード「ポピィ」は撤廃済み**（グループチャット時代の誤反応防止用だったが、1:1運用では不要と判断）。この結果、「今日はお疲れさま」のような雑談に含まれる「今日」等の単語だけで予約コマンドと誤認識され、勝手に終日予約されるリスクを許容している（対策なしで進める、とユーザー確認済み）。
- **API認証はBearerトークンの共有シークレット方式**（`API_ACCESS_TOKEN`）。gitのソースには含まれていないが、デプロイ後の公開ページ（GitHub Pages）のHTMLソースを見れば誰でも読める値であることに変わりはない。本格的な認証ではなく、自動スキャンやいたずらの抑止が目的の「無いよりマシ」レベルの防御という前提で運用している。
- **Webhookの通知は「予約/キャンセル/出世」は家族全員にmulticast、エラーや確認結果は送信者本人にreply**という使い分けをしている（[functions/src/routes/webhook.js](functions/src/routes/webhook.js)の`handleEvent`）。
- **`--min-instances=1`は使っていない**（コールドスタートより月額課金の回避を優先）。LIFFを開くとまずスケジュール取得でインスタンスが温まるため、その後のタップ操作は速くなりやすい。

## デプロイ方法

```bash
cd functions
gcloud functions deploy popi-bot \
  --gen2 --runtime=nodejs20 --region=asia-northeast1 \
  --source=. --entry-point=popiBot --trigger-http \
  --allow-unauthenticated \
  --service-account=popi-bot-runtime@popi-carshare-bot.iam.gserviceaccount.com \
  --env-vars-file=.env.yaml \
  --memory=256Mi --timeout=30s
```

`functions/.env.yaml`は各自で`.env.yaml.example`を元に作成する（本物の値はこのファイルにしか無く、リポジトリには含まれない）。

フロントエンド（`index.html`）は、以下3つをリポジトリの Settings → Secrets and variables → Actions に登録しておけば、`main`にpushするたびに GitHub Actions が自動でビルド・デプロイする。

| Secret名 | 値 |
|---|---|
| `LIFF_ID` | LINE LoginチャネルのLIFFタブで発行されたID |
| `API_BASE_URL` | Cloud FunctionsのURL（上記参照） |
| `API_ACCESS_TOKEN` | `functions/.env.yaml`の`API_ACCESS_TOKEN`と同じ値 |

トークンを再発行（ローテーション）した場合は、`functions/.env.yaml`とこのActions Secretsの両方を更新し、Cloud Functionsを再デプロイする必要がある。

## ローカル動作確認

```bash
cd functions
npm install
TZ=Asia/Tokyo LINE_CHANNEL_ACCESS_TOKEN=dummy LINE_CHANNEL_SECRET=xxx API_ACCESS_TOKEN=xxx npx functions-framework --target=popiBot --source=. --port=8080
```

Firestoreへの実際の読み書きにはApplication Default Credentials（`gcloud auth application-default login`）またはデプロイ環境が必要。ローカルではルーティング・認証・署名検証・日付パースのロジックまでは確認できる。
