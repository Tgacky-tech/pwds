// Supabaseでの満足度評価更新機能

export const updateSatisfactionRating = async (
  logId: string, 
  rating: 'yes' | 'no'
): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/prediction_logs`;
      const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // JWTトークンをクリーンアップ
      const cleanApikey = apikey.replace(/\s+/g, '').trim();
      
      xhr.open('PATCH', `${baseUrl}?id=eq.${logId}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('apikey', cleanApikey);
      xhr.setRequestHeader('Authorization', `Bearer ${cleanApikey}`);
      xhr.setRequestHeader('Prefer', 'return=minimal');
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 204) {
            console.log('✅ Satisfaction rating updated successfully');
            resolve(true);
          } else {
            console.warn('❌ Satisfaction rating update failed:', xhr.status, xhr.responseText);
            resolve(false);
          }
        }
      };
      
      xhr.onerror = function() {
        console.warn('❌ Satisfaction rating update error');
        resolve(false);
      };
      
      const updateData = {
        satisfaction_rating: rating,
        satisfaction_rated_at: new Date().toISOString()
      };
      
      xhr.send(JSON.stringify(updateData));
    } catch (error) {
      console.warn('❌ Satisfaction rating update setup error:', error);
      resolve(false);
    }
  });
};