require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { sendMessageToChatwork } = require('./services/chatworkService');
const { getMessageForDate } = require('./services/spreadsheetService');

const app = express();
const PORT = process.env.PORT || 3000;

// JSONボディパーサー
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ヘルスチェックエンドポイント
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Chatwork日付変更botが稼働中です',
    timestamp: new Date().toISOString()
  });
});

// 手動実行エンドポイント
app.post('/send-message', async (req, res) => {
  try {
    const today = new Date();
    const message = await getMessageForDate(today);
    
    if (message) {
      await sendMessageToChatwork(message, today);
      res.json({
        success: true,
        message: 'メッセージを送信しました',
        sentMessage: message,
        timestamp: today.toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        message: '今日の日付に対応するメッセージが見つかりませんでした'
      });
    }
  } catch (error) {
    console.error('メッセージ送信エラー:', error);
    res.status(500).json({
      success: false,
      message: 'メッセージ送信中にエラーが発生しました',
      error: error.message
    });
  }
});

// スケジュール実行（毎日午前0時）
const scheduleTime = process.env.SCHEDULE_TIME || '0 0 * * *';
cron.schedule(scheduleTime, async () => {
  console.log('スケジュール実行開始:', new Date().toISOString());
  
  try {
    const today = new Date();
    const message = await getMessageForDate(today);
    
    if (message) {
      await sendMessageToChatwork(message, today);
      console.log('メッセージを送信しました:', message);
    } else {
      console.log('今日の日付に対応するメッセージが見つかりませんでした');
    }
  } catch (error) {
    console.error('スケジュール実行エラー:', error);
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`スケジュール設定: ${scheduleTime}`);
});

module.exports = app; 