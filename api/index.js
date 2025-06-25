const { sendMessageToChatwork } = require('../services/chatworkService');
const { getMessageForDate } = require('../services/spreadsheetService');

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ヘルスチェックエンドポイント
  if (req.method === 'GET') {
    return res.json({
      status: 'OK',
      message: 'Chatwork日付変更botが稼働中です',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }

  // 手動実行エンドポイント
  if (req.method === 'POST') {
    try {
      const today = new Date();
      const message = await getMessageForDate(today);
      
      if (message) {
        await sendMessageToChatwork(message, today);
        return res.json({
          success: true,
          message: 'メッセージを送信しました',
          sentMessage: message,
          timestamp: today.toISOString()
        });
      } else {
        return res.status(404).json({
          success: false,
          message: '今日の日付に対応するメッセージが見つかりませんでした'
        });
      }
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      return res.status(500).json({
        success: false,
        message: 'メッセージ送信中にエラーが発生しました',
        error: error.message
      });
    }
  }

  // その他のリクエスト
  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
} 