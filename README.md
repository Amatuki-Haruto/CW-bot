# Chatwork日付変更bot

スプレッドシートから日付ごとに異なるメッセージを取得し、Chatworkに自動送信するbotです。

## 機能

- 毎日午前0時に自動でメッセージを送信
- Google Sheetsから日付ごとのメッセージを取得
- Chatwork APIを使用したメッセージ送信
- Web API経由での手動実行

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の内容を設定：

```env
# Chatwork設定
CHATWORK_API_TOKEN=your_chatwork_api_token_here
CHATWORK_ROOM_ID=your_room_id_here

# Google Sheets設定
GOOGLE_SHEETS_CREDENTIALS_FILE=credentials.json
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here

# アプリケーション設定
PORT=3000
NODE_ENV=development
```

### 3. Google Sheets設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクト作成
2. Google Sheets APIを有効化
3. サービスアカウントキー（JSON）を作成
4. ダウンロードしたファイルを`credentials.json`として保存
5. スプレッドシートにサービスアカウントの閲覧権限を付与

### 4. スプレッドシートの準備

以下の形式でデータを入力：

| A列（日付） | B列（メッセージ） |
|-------------|-------------------|
| 日付 | メッセージ |
| 6/24 | 📅 6月24日\n今日も一日頑張りましょう！ |
| 6/25 | 📅 6月25日\n明日も頑張りましょう！ |

**対応形式**: `2025/06/24`, `6/24`, `06/24` など

### 5. アプリケーション起動

```bash
# 開発モード
npm run dev

# 本番モード
npm start
```

## API エンドポイント

- `GET /` - ヘルスチェック
- `POST /send-message` - 手動でメッセージ送信

## デプロイ

### Heroku

```bash
heroku create your-app-name
git add .
git commit -m "Initial commit"
git push heroku main

# 環境変数設定
heroku config:set CHATWORK_API_TOKEN=your_token
heroku config:set CHATWORK_ROOM_ID=your_room_id
heroku config:set GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
heroku config:set GOOGLE_SHEETS_CREDENTIALS="$(cat credentials.json)"
```

## ライセンス

ISC 