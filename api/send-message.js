const { sendMessageToChatwork } = require('../services/chatworkService');
const { getMessageForDate } = require('../services/spreadsheetService');

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POSTリクエストのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // 環境変数の確認
  const requiredEnvVars = [
    'GOOGLE_SHEETS_SPREADSHEET_ID',
    'GOOGLE_SHEETS_CREDENTIALS',
    'CHATWORK_API_TOKEN',
    'CHATWORK_ROOM_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    return res.status(500).json({
      success: false,
      message: '環境変数が設定されていません',
      missingVariables: missingVars
    });
  }

  return res.json({
    success: true,
    message: '環境変数は正常に設定されています',
    timestamp: new Date().toISOString()
  });
} 