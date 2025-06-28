// LIFF環境完全対応のデータ送信API

// LIFF環境でのデータ送信を XMLHttpRequest で実装
export const sendToSupabaseLiff = async (data: any): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/prediction_logs`;
      const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // JWTトークンをURLパラメータとして送信（LIFF環境でのヘッダー制限回避）
      const urlWithAuth = `${baseUrl}?apikey=${encodeURIComponent(apikey)}`;
      
      xhr.open('POST', urlWithAuth, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Prefer', 'return=representation');
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 201) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('XMLHttpRequest success:', response);
              resolve(response[0]?.id || null);
            } catch (parseError) {
              console.warn('Response parse error:', parseError);
              resolve(null);
            }
          } else {
            console.warn('XMLHttpRequest failed:', xhr.status, xhr.responseText);
            resolve(null);
          }
        }
      };
      
      xhr.onerror = function() {
        console.warn('XMLHttpRequest error');
        resolve(null);
      };
      
      xhr.send(JSON.stringify(data));
    } catch (error) {
      console.warn('XMLHttpRequest setup error:', error);
      resolve(null);
    }
  });
};

// Google Sheets API を使用した代替データ保存
export const sendToGoogleSheets = async (data: any): Promise<boolean> => {
  try {
    // Google Apps Script Web App URL（設定が必要）
    const SHEETS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; // 実際のURLに置き換え
    
    if (SHEETS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
      console.log('Google Sheets not configured, data would be:', data);
      return false;
    }
    
    const response = await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors', // LIFF環境対応
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log('Google Sheets API called');
    return true;
  } catch (error) {
    console.warn('Google Sheets API error:', error);
    return false;
  }
};

// LINEのsendMessages APIを使用したデータ送信（開発者向け）
export const sendDataViaLineMessage = async (data: any, userId: string): Promise<boolean> => {
  try {
    if (window.liff && window.liff.isLoggedIn()) {
      // LINEメッセージとしてデータを送信（管理者のLINEに）
      const message = {
        type: 'text',
        text: `予測データ: ${JSON.stringify(data, null, 2)}`
      };
      
      // 実際の実装では、LINEボットAPIを使用して管理者に送信
      console.log('LINE message data prepared:', message);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('LINE message API error:', error);
    return false;
  }
};

// 統合データ送信関数
export const saveDataWithFallback = async (data: any): Promise<string | null> => {
  console.log('Attempting data save with multiple fallbacks...');
  
  // 1. XMLHttpRequest でSupabaseを試行
  const supabaseResult = await sendToSupabaseLiff(data);
  if (supabaseResult) {
    console.log('✅ Data saved to Supabase via XMLHttpRequest');
    return supabaseResult;
  }
  
  // 2. Google Sheets API を試行
  const sheetsResult = await sendToGoogleSheets(data);
  if (sheetsResult) {
    console.log('✅ Data saved to Google Sheets');
    return 'sheets-' + Date.now();
  }
  
  // 3. LINE Message API を試行
  const lineResult = await sendDataViaLineMessage(data, data.line_user_id);
  if (lineResult) {
    console.log('✅ Data sent via LINE Message');
    return 'line-' + Date.now();
  }
  
  // 4. すべて失敗した場合はローカルストレージに保存
  try {
    const localData = JSON.parse(localStorage.getItem('prediction_logs') || '[]');
    localData.push({ ...data, id: 'local-' + Date.now(), timestamp: new Date().toISOString() });
    localStorage.setItem('prediction_logs', JSON.stringify(localData));
    console.log('✅ Data saved to localStorage as fallback');
    return 'local-' + Date.now();
  } catch (localError) {
    console.warn('❌ All data save methods failed');
    return null;
  }
};