// 確実なSupabaseデータ保存API
// 提供されたanon APIキーを使用した最も確実な方法

const SUPABASE_URL = 'https://sooyxifnzwyfkrkqpafb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3l4aWZuend5Zmtya3FwYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTE3ODksImV4cCI6MjA2NjUyNzc4OX0.XKWHajV9agHwQv3xz1gL4P4IUtwES5uFykAV06CUb1s';

// 確実なデータ保存関数（予測開始時）
export const saveDataReliably = async (formData: any, user: any): Promise<string> => {
  console.log('🚀 確実なデータ保存開始');
  
  const logData = {
    line_user_id: user.lineUserId,
    display_name: user.displayName || 'Unknown User',
    purchase_source: formData.purchaseSource,
    has_purchase_experience: formData.hasPurchaseExperience,
    breed: formData.breed,
    gender: formData.gender,
    birth_date: formData.birthDate,
    current_weight: Number(formData.currentWeight),
    birth_weight: formData.birthWeight ? Number(formData.birthWeight) : null,
    
    // 過去体重記録
    past_weight_1_date: formData.pastWeights?.[0]?.date || null,
    past_weight_1_value: formData.pastWeights?.[0]?.weight ? Number(formData.pastWeights[0].weight) : null,
    past_weight_2_date: formData.pastWeights?.[1]?.date || null,
    past_weight_2_value: formData.pastWeights?.[1]?.weight ? Number(formData.pastWeights[1].weight) : null,
    
    // 親の体重
    mother_adult_weight: formData.motherAdultWeight ? Number(formData.motherAdultWeight) : null,
    father_adult_weight: formData.fatherAdultWeight ? Number(formData.fatherAdultWeight) : null,
    
    // 体重確認フラグ
    current_weight_verified: formData.currentWeightVerified || false,
    mother_weight_verified: formData.motherWeightVerified || false,
    father_weight_verified: formData.fatherWeightVerified || false
  };
  
  console.log('📋 保存するデータ:', logData);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/rest/v1/prediction_logs`;
    
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader('Prefer', 'return=representation');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        console.log('📡 レスポンス:', xhr.status, xhr.responseText);
        
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            const id = response[0]?.id;
            console.log('✅ データ保存成功, ID:', id);
            resolve(id);
          } catch (parseError) {
            console.error('❌ レスポンス解析エラー:', parseError);
            reject(parseError);
          }
        } else {
          console.error('❌ HTTP エラー:', xhr.status, xhr.responseText);
          reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText}`));
        }
      }
    };
    
    xhr.onerror = function() {
      console.error('❌ ネットワークエラー');
      reject(new Error('Network error'));
    };
    
    xhr.send(JSON.stringify(logData));
  });
};

// 確実な予測体重更新関数
export const updatePredictedWeightReliably = async (id: string, predictedWeight: number): Promise<void> => {
  console.log('🔄 予測体重更新開始:', { id, predictedWeight });
  
  const updateData = {
    predicted_weight: Number(predictedWeight.toFixed(2)),
    prediction_completed_at: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/rest/v1/prediction_logs?id=eq.${id}`;
    
    xhr.open('PATCH', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader('Prefer', 'return=representation');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        console.log('📡 予測体重更新レスポンス:', xhr.status, xhr.responseText);
        console.log('📡 予測体重更新ヘッダー:', xhr.getAllResponseHeaders());
        
        if (xhr.status === 200 || xhr.status === 204) {
          console.log('✅ 予測体重更新成功');
          resolve();
        } else {
          console.error('❌ 予測体重更新失敗:', xhr.status, xhr.responseText);
          console.error('❌ 更新URL:', url);
          console.error('❌ 更新データ:', JSON.stringify(updateData));
          reject(new Error(`予測体重更新失敗: HTTP ${xhr.status} - ${xhr.responseText}`));
        }
      }
    };
    
    xhr.onerror = function() {
      console.error('❌ 予測体重更新ネットワークエラー');
      reject(new Error('Network error during weight update'));
    };
    
    xhr.send(JSON.stringify(updateData));
  });
};

// 画面遷移時の確実な予測体重保存関数（複数回の再試行あり）
export const savePredictedWeightOnTransition = async (id: string, predictedWeight: number, maxRetries: number = 3): Promise<void> => {
  console.log('🎯 画面遷移時の予測体重保存開始:', { id, predictedWeight, maxRetries });
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 予測体重保存試行 ${attempt}/${maxRetries}`);
      
      // まず現在の状態を確認
      const currentData = await verifyDataSaved(id);
      if (currentData?.predicted_weight) {
        console.log('✅ 予測体重は既に保存済み:', currentData.predicted_weight, 'kg');
        return;
      }
      
      // 予測体重を保存
      await updatePredictedWeightReliably(id, predictedWeight);
      
      // 保存確認
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
      const verificationData = await verifyDataSaved(id);
      
      if (verificationData?.predicted_weight) {
        console.log('✅ 画面遷移時の予測体重保存成功:', verificationData.predicted_weight, 'kg');
        return;
      } else {
        console.warn(`⚠️ 試行 ${attempt}/${maxRetries}: 予測体重が確認できません`);
        if (attempt === maxRetries) {
          throw new Error('予測体重保存の最大試行回数に達しました');
        }
      }
      
    } catch (error) {
      console.error(`❌ 試行 ${attempt}/${maxRetries} 失敗:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      // 次の試行前に少し待機
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// 確実な満足度評価更新関数
export const updateSatisfactionReliably = async (id: string, rating: 'yes' | 'no'): Promise<void> => {
  console.log('⭐ 満足度評価更新開始:', { id, rating });
  
  const updateData = {
    satisfaction_rating: rating,
    satisfaction_rated_at: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/rest/v1/prediction_logs?id=eq.${id}`;
    
    xhr.open('PATCH', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader('Prefer', 'return=minimal');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        console.log('📡 満足度更新レスポンス:', xhr.status, xhr.responseText);
        
        if (xhr.status === 200 || xhr.status === 204) {
          console.log('✅ 満足度評価更新成功');
          resolve();
        } else {
          console.error('❌ 満足度評価更新失敗:', xhr.status, xhr.responseText);
          reject(new Error(`満足度評価更新失敗: HTTP ${xhr.status}`));
        }
      }
    };
    
    xhr.onerror = function() {
      console.error('❌ 満足度評価更新ネットワークエラー');
      reject(new Error('Network error during satisfaction update'));
    };
    
    xhr.send(JSON.stringify(updateData));
  });
};

// データ確認関数
export const verifyDataSaved = async (id: string): Promise<any> => {
  console.log('🔍 データ確認開始:', id);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/rest/v1/prediction_logs?id=eq.${id}&select=*`;
    
    xhr.open('GET', url, true);
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            const data = response[0];
            console.log('📊 保存データ確認:', data);
            resolve(data);
          } catch (parseError) {
            console.error('❌ データ確認解析エラー:', parseError);
            reject(parseError);
          }
        } else {
          console.error('❌ データ確認失敗:', xhr.status, xhr.responseText);
          reject(new Error(`データ確認失敗: HTTP ${xhr.status}`));
        }
      }
    };
    
    xhr.onerror = function() {
      console.error('❌ データ確認ネットワークエラー');
      reject(new Error('Network error during verification'));
    };
    
    xhr.send();
  });
};

// データベーススキーマ確認関数
export const verifyDatabaseSchema = async (): Promise<void> => {
  console.log('🔍 データベーススキーマ確認開始');
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'prediction_logs' 
      AND column_name IN ('predicted_weight', 'prediction_completed_at')
      ORDER BY column_name
    `;
    const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
    
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        console.log('📡 スキーマ確認レスポンス:', xhr.status, xhr.responseText);
        
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('📊 スキーマ確認結果:', response);
            resolve();
          } catch (parseError) {
            console.error('❌ スキーマ確認解析エラー:', parseError);
            reject(parseError);
          }
        } else {
          console.warn('⚠️ スキーマ確認できません（権限不足の可能性）:', xhr.status, xhr.responseText);
          // スキーマ確認に失敗してもエラーとはしない
          resolve();
        }
      }
    };
    
    xhr.onerror = function() {
      console.warn('⚠️ スキーマ確認ネットワークエラー');
      // ネットワークエラーでもエラーとはしない
      resolve();
    };
    
    xhr.send(JSON.stringify({ sql: query }));
  });
};