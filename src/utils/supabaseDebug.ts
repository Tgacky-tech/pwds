// Supabase接続デバッグ用ユーティリティ

export const debugSupabaseConnection = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.group('🔍 Supabase Connection Debug');
  console.log('URL:', url ? `${url.substring(0, 30)}...` : 'NOT SET');
  console.log('API Key:', key ? `${key.substring(0, 20)}...` : 'NOT SET');
  console.log('URL Valid:', url && url.includes('supabase.co'));
  console.log('Key Valid:', key && key.startsWith('eyJ'));
  console.groupEnd();
  
  return {
    url,
    key,
    isValid: url && key && url.includes('supabase.co') && key.startsWith('eyJ')
  };
};

export const testSupabaseConnection = async () => {
  const config = debugSupabaseConnection();
  
  if (!config.isValid) {
    console.error('❌ Supabase configuration invalid');
    return false;
  }
  
  try {
    const cleanKey = config.key.replace(/\s+/g, '').trim();
    const response = await fetch(`${config.url}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': cleanKey,
        'Authorization': `Bearer ${cleanKey}`
      }
    });
    
    console.log('🔗 Supabase connection test:', response.status === 200 ? '✅ SUCCESS' : '❌ FAILED');
    return response.status === 200;
  } catch (error) {
    console.error('🔗 Supabase connection test failed:', error);
    return false;
  }
};

// 単純なテスト挿入
export const testSupabaseInsert = async () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const cleanKey = key.replace(/\s+/g, '').trim();
  
  const testData = {
    line_user_id: 'test-user',
    display_name: 'Test User',
    purchase_source: 'petshop',
    has_purchase_experience: 'yes',
    breed: 'Test Breed',
    gender: 'male',
    birth_date: '2024-01-01',
    current_weight: 1.0
  };
  
  try {
    const response = await fetch(`${url}/rest/v1/prediction_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': cleanKey,
        'Authorization': `Bearer ${cleanKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.text();
    console.log('🧪 Test insert:', response.status, result);
    
    return response.status === 201;
  } catch (error) {
    console.error('🧪 Test insert failed:', error);
    return false;
  }
};

// ウィンドウオブジェクトに追加
declare global {
  interface Window {
    debugSupabase: () => void;
    testSupabaseConnection: () => Promise<boolean>;
    testSupabaseInsert: () => Promise<boolean>;
  }
}

window.debugSupabase = debugSupabaseConnection;
window.testSupabaseConnection = testSupabaseConnection;
window.testSupabaseInsert = testSupabaseInsert;