require('dotenv').config();
const { sendMessageToChatwork } = require('./services/chatworkService');
const { getMessageForDate } = require('./services/spreadsheetService');

async function testSendMessage() {
  console.log('=== テストメッセージ送信 ===');
  
  try {
    // 今日の日付のメッセージを取得
    const today = new Date();
    console.log(`今日の日付: ${today.getMonth() + 1}/${today.getDate()}`);
    
    const message = await getMessageForDate(today);
    
    if (message) {
      console.log('✅ メッセージ取得成功:', message);
      
      // Chatworkに送信
      console.log('\n📤 Chatworkに送信中...');
      const result = await sendMessageToChatwork(message, today);
      console.log('✅ メッセージ送信成功:', result);
      
    } else {
      console.log('❌ 今日の日付に対応するメッセージが見つかりませんでした');
      console.log('💡 スプレッドシートに今日の日付のデータを追加してください');
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
  
  console.log('\n=== テスト終了 ===');
}

// テスト実行
if (require.main === module) {
  testSendMessage();
}

module.exports = { testSendMessage }; 