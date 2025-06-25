const { google } = require('googleapis');
const path = require('path');

class SpreadsheetService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    this.credentialsFile = process.env.GOOGLE_SHEETS_CREDENTIALS_FILE || 'credentials.json';
    
    if (!this.spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_IDが設定されていません');
    }
    
    this.auth = null;
    this.sheets = null;
  }

  /**
   * Google Sheets APIの認証を初期化
   */
  async initializeAuth() {
    try {
      let credentials;
      
      // Heroku環境では環境変数から認証情報を取得
      if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
        credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      } else {
        // ローカル環境ではファイルから読み取り
        const credentialsPath = path.join(__dirname, '..', this.credentialsFile);
        credentials = require(credentialsPath);
      }

      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });

      this.auth = await auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      console.log('Google Sheets API認証成功');
    } catch (error) {
      console.error('Google Sheets API認証エラー:', error);
      throw new Error(`Google Sheets API認証に失敗しました: ${error.message}`);
    }
  }

  /**
   * 指定した日付に対応するメッセージを取得
   * @param {Date} date - 対象日付
   * @returns {Promise<string|null>} メッセージ（見つからない場合はnull）
   */
  async getMessageForDate(date) {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      // 日付をMM/DD形式に変換
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dateString = `${month}/${day}`;

      // スプレッドシートからデータを取得
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:B' // A列: 日付, B列: メッセージ
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('スプレッドシートにデータが見つかりません');
        return null;
      }

      // ヘッダー行があるかチェック（最初の行が「日付」や「date」などの文字列の場合）
      const firstRow = rows[0];
      const hasHeader = firstRow && firstRow[0] && 
        (typeof firstRow[0] === 'string') && 
        (firstRow[0].toLowerCase().includes('日付') || 
         firstRow[0].toLowerCase().includes('date') ||
         firstRow[0].toLowerCase().includes('date'));
      
      // ヘッダー行がある場合はスキップ、ない場合は全行をデータとして扱う
      const dataRows = hasHeader ? rows.slice(1) : rows;
      
      // 日付に一致する行を検索
      for (const row of dataRows) {
        if (row.length >= 2) {
          const sheetDate = row[0];
          const message = row[1];
          
          // 日付の形式を正規化して比較
          if (this.normalizeDate(sheetDate) === this.normalizeDate(dateString)) {
            console.log(`日付 ${dateString} のメッセージを取得:`, message);
            return message;
          }
        }
      }

      console.log(`日付 ${dateString} に対応するメッセージが見つかりませんでした`);
      return null;
    } catch (error) {
      console.error('メッセージ取得エラー:', error);
      throw new Error(`メッセージの取得に失敗しました: ${error.message}`);
    }
  }

  /**
   * 日付文字列を正規化
   * @param {string} dateString - 日付文字列
   * @returns {string} 正規化された日付文字列（MM/DD形式）
   */
  normalizeDate(dateString) {
    if (!dateString) return '';
    
    // 文字列をトリム
    const trimmedDate = dateString.toString().trim();
    
    // 様々な日付形式に対応
    let date;
    
    // 2024/1/1 形式の場合
    if (trimmedDate.includes('/')) {
      const parts = trimmedDate.split('/');
      if (parts.length >= 2) {
        // 年/月/日 または 月/日 形式
        if (parts.length === 3) {
          // 2024/1/1 形式
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);
          
          // 年が4桁の場合は年を無視して月/日のみ使用
          if (year >= 1000) {
            return `${month}/${day}`;
          } else {
            // 月/日/年 形式の可能性
            return `${year}/${month}`;
          }
        } else if (parts.length === 2) {
          // 月/日 形式
          return trimmedDate;
        }
      }
    }
    
    // その他の形式はDateオブジェクトで解析を試行
    date = new Date(trimmedDate);
    if (!isNaN(date.getTime())) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    }
    
    // 解析できない場合は、そのまま返す
    return trimmedDate;
  }

  /**
   * スプレッドシートの全データを取得
   * @returns {Promise<Array>} 全データ
   */
  async getAllData() {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:B'
      });

      return response.data.values || [];
    } catch (error) {
      console.error('全データ取得エラー:', error);
      throw new Error(`全データの取得に失敗しました: ${error.message}`);
    }
  }

  /**
   * スプレッドシートの情報を取得
   * @returns {Promise<Object>} スプレッドシート情報
   */
  async getSpreadsheetInfo() {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      return response.data;
    } catch (error) {
      console.error('スプレッドシート情報取得エラー:', error);
      throw new Error(`スプレッドシート情報の取得に失敗しました: ${error.message}`);
    }
  }
}

// シングルトンインスタンス
const spreadsheetService = new SpreadsheetService();

/**
 * 指定した日付に対応するメッセージを取得する関数
 * @param {Date} date - 対象日付
 * @returns {Promise<string|null>} メッセージ
 */
async function getMessageForDate(date) {
  return await spreadsheetService.getMessageForDate(date);
}

module.exports = {
  getMessageForDate,
  SpreadsheetService
}; 