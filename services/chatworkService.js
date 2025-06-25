const axios = require('axios');

class ChatworkService {
  constructor() {
    this.apiToken = process.env.CHATWORK_API_TOKEN;
    this.roomId = process.env.CHATWORK_ROOM_ID;
    this.baseUrl = 'https://api.chatwork.com/v2';
    
    if (!this.apiToken) {
      throw new Error('CHATWORK_API_TOKENが設定されていません');
    }
    
    if (!this.roomId) {
      throw new Error('CHATWORK_ROOM_IDが設定されていません');
    }
  }

  /**
   * メッセージを指定された形式に変換
   * @param {string} message - 元のメッセージ
   * @param {Date} date - 日付
   * @returns {string} 変換されたメッセージ
   */
  formatMessage(message, date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `[info][title]日付変更[/title]今日は${month}月${day}日！\n${message}[/info]`;
  }

  /**
   * Chatworkにメッセージを送信
   * @param {string} message - 送信するメッセージ
   * @param {Date} date - 日付（オプション）
   * @returns {Promise<Object>} 送信結果
   */
  async sendMessage(message, date = new Date()) {
    try {
      // メッセージを指定された形式に変換
      const formattedMessage = this.formatMessage(message, date);
      
      const response = await axios.post(
        `${this.baseUrl}/rooms/${this.roomId}/messages`,
        `body=${encodeURIComponent(formattedMessage)}`,
        {
          headers: {
            'X-ChatWorkToken': this.apiToken,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('Chatworkメッセージ送信成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('Chatworkメッセージ送信エラー:', error.response?.data || error.message);
      throw new Error(`Chatworkメッセージ送信に失敗しました: ${error.message}`);
    }
  }

  /**
   * ルーム情報を取得
   * @returns {Promise<Object>} ルーム情報
   */
  async getRoomInfo() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rooms/${this.roomId}`,
        {
          headers: {
            'X-ChatWorkToken': this.apiToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('ルーム情報取得エラー:', error.response?.data || error.message);
      throw new Error(`ルーム情報の取得に失敗しました: ${error.message}`);
    }
  }

  /**
   * メッセージ一覧を取得
   * @param {number} force - 強制取得フラグ
   * @returns {Promise<Array>} メッセージ一覧
   */
  async getMessages(force = 0) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rooms/${this.roomId}/messages?force=${force}`,
        {
          headers: {
            'X-ChatWorkToken': this.apiToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('メッセージ取得エラー:', error.response?.data || error.message);
      throw new Error(`メッセージの取得に失敗しました: ${error.message}`);
    }
  }
}

// シングルトンインスタンス
const chatworkService = new ChatworkService();

/**
 * Chatworkにメッセージを送信する関数
 * @param {string} message - 送信するメッセージ
 * @param {Date} date - 日付（オプション）
 * @returns {Promise<Object>} 送信結果
 */
async function sendMessageToChatwork(message, date = new Date()) {
  return await chatworkService.sendMessage(message, date);
}

module.exports = {
  sendMessageToChatwork,
  ChatworkService
}; 