const { sendMessageToChatwork } = require('../services/chatworkService');
const { getMessageForDate } = require('../services/spreadsheetService');

export default async function handler(req, res) {
  // GETリクエストのみ許可
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Vercel Cron Job実行開始:', new Date().toISOString());
  
  try {
    const today = new Date();
    const message = await getMessageForDate(today);
    
    if (message) {
      await sendMessageToChatwork(message, today);
      console.log('メッセージを送信しました:', message);
      res.status(200).json({
        success: true,
        message: 'メッセージを送信しました',
        sentMessage: message,
        timestamp: today.toISOString()
      });
    } else {
      console.log('今日の日付に対応するメッセージが見つかりませんでした');
      res.status(200).json({
        success: false,
        message: '今日の日付に対応するメッセージが見つかりませんでした',
        timestamp: today.toISOString()
      });
    }
  } catch (error) {
    console.error('Cron Job実行エラー:', error);
    res.status(500).json({
      success: false,
      message: 'Cron Job実行中にエラーが発生しました',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 