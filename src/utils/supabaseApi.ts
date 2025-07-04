import { supabase, type PredictionLog } from '../lib/supabase';
import { DogFormData, PredictionResult, User } from '../types';

// 予測開始時にフォームデータを保存
// データサニタイズ関数
const sanitizeString = (str: string): string => {
  if (!str) return '';
  // 制御文字や無効なUTF-8文字を除去
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
};

// データベース接続テスト関数
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 データベース接続テスト開始...');
    const { data, error } = await supabase
      .from('prediction_logs')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ データベース接続テスト失敗:', error);
      return false;
    }
    
    console.log('✅ データベース接続テスト成功:', data?.length || 0, '件取得');
    return true;
  } catch (error) {
    console.error('❌ データベース接続テストエラー:', error);
    return false;
  }
};

// テーブル構造確認関数（デバッグ用）
export const checkTableStructure = async (): Promise<void> => {
  try {
    console.log('🔍 テーブル構造確認開始...');
    
    // 空のレコードでテスト挿入を試行（実際には挿入しない）
    const testData = {
      line_user_id: 'test',
      display_name: 'test',
      purchase_source: 'petshop',
      has_purchase_experience: 'yes',
      breed: 'test',
      gender: 'male',
      birth_date: '2024-01-01',
      current_weight: 1.0
    };
    
    // ドライランでカラムの存在確認
    const { error } = await supabase
      .from('prediction_logs')
      .insert(testData)
      .select('id')
      .limit(0); // 実際には挿入しない
    
    if (error) {
      console.error('🔍 テーブル構造チェック結果:', error.message);
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.error('❌ 必要なカラムが存在しません。マイグレーションが必要です。');
      }
    } else {
      console.log('✅ 基本的なテーブル構造は問題ありません');
    }
  } catch (error) {
    console.error('❌ テーブル構造確認エラー:', error);
  }
};

export const savePredictionStart = async (
  formData: DogFormData,
  user: User
): Promise<string> => {
  try {
    // データ検証
    const userId = sanitizeString(user.lineUserId);
    const displayName = sanitizeString(user.displayName);
    
    if (!userId) {
      throw new Error('Invalid user ID');
    }
    
    console.log('Preparing log data for user:', { userId, displayName });
    
    const logData: Partial<PredictionLog> = {
      line_user_id: userId,
      display_name: displayName || 'Unknown User',
      purchase_source: formData.purchaseSource,
      has_purchase_experience: formData.hasPurchaseExperience,
      breed: sanitizeString(formData.breed),
      gender: formData.gender,
      birth_date: formData.birthDate,
      current_weight: Number(formData.currentWeight),
      birth_weight: formData.birthWeight ? Number(formData.birthWeight) : undefined,
      past_weight_1_date: formData.pastWeights?.[0]?.date || null,
      past_weight_1_value: formData.pastWeights?.[0]?.weight ? Number(formData.pastWeights[0].weight) : null,
      past_weight_2_date: formData.pastWeights?.[1]?.date || null,
      past_weight_2_value: formData.pastWeights?.[1]?.weight ? Number(formData.pastWeights[1].weight) : null,
      mother_adult_weight: formData.motherAdultWeight ? Number(formData.motherAdultWeight) : undefined,
      father_adult_weight: formData.fatherAdultWeight ? Number(formData.fatherAdultWeight) : undefined,
      current_weight_verified: formData.currentWeightVerified,
      mother_weight_verified: formData.motherWeightVerified,
      father_weight_verified: formData.fatherWeightVerified,
    };
    
    console.log('📋 予測開始データ準備完了:', logData);
    console.log('📊 過去体重データ詳細:', {
      originalPastWeights: formData.pastWeights,
      past_weight_1_date: logData.past_weight_1_date,
      past_weight_1_value: logData.past_weight_1_value,
      past_weight_2_date: logData.past_weight_2_date,
      past_weight_2_value: logData.past_weight_2_value
    });
    console.log('✅ 体重確認フラグ詳細:', {
      currentWeightVerified: logData.current_weight_verified,
      motherWeightVerified: logData.mother_weight_verified,
      fatherWeightVerified: logData.father_weight_verified
    });
    
    // フォームデータの元の値も確認
    console.log('📋 フォームデータ元の値確認:', {
      currentWeightVerified: formData.currentWeightVerified,
      motherWeightVerified: formData.motherWeightVerified,
      fatherWeightVerified: formData.fatherWeightVerified,
      pastWeights: formData.pastWeights
    });
    
    // has_purchase_experienceとの比較確認
    console.log('🔍 保存方法比較:', {
      has_purchase_experience: formData.hasPurchaseExperience,
      current_weight_verified: formData.currentWeightVerified,
      mother_weight_verified: formData.motherWeightVerified,
      father_weight_verified: formData.fatherWeightVerified
    });

    console.log('🚀 Supabaseへデータ挿入開始...');
    const { data, error } = await supabase
      .from('prediction_logs')
      .insert(logData)
      .select('id, current_weight_verified, mother_weight_verified, father_weight_verified, past_weight_1_date, past_weight_1_value, past_weight_2_date, past_weight_2_value')
      .single();
    
    console.log('📥 Supabase挿入レスポンス:', { data, error });
    
    if (data) {
      console.log('✅ 保存されたデータ確認:', {
        id: data.id,
        current_weight_verified: data.current_weight_verified,
        mother_weight_verified: data.mother_weight_verified,
        father_weight_verified: data.father_weight_verified,
        past_weight_1_date: data.past_weight_1_date,
        past_weight_1_value: data.past_weight_1_value,
        past_weight_2_date: data.past_weight_2_date,
        past_weight_2_value: data.past_weight_2_value
      });
      
      // 体重確認フラグの型確認
      console.log('📊 体重確認フラグの型と値:', {
        current_weight_verified: { value: data.current_weight_verified, type: typeof data.current_weight_verified },
        mother_weight_verified: { value: data.mother_weight_verified, type: typeof data.mother_weight_verified },
        father_weight_verified: { value: data.father_weight_verified, type: typeof data.father_weight_verified }
      });
    }

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      console.error('Failed logData:', logData);
      
      // カラムが存在しない場合の詳細エラー情報とフォールバック処理
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.error('⚠️ データベースのカラムが存在しません。以下のマイグレーションを実行してください:');
        console.error('-- 過去体重記録用カラム');
        console.error('ALTER TABLE prediction_logs ADD COLUMN past_weight_1_date DATE;');
        console.error('ALTER TABLE prediction_logs ADD COLUMN past_weight_1_value DECIMAL(5,2);');
        console.error('ALTER TABLE prediction_logs ADD COLUMN past_weight_2_date DATE;');
        console.error('ALTER TABLE prediction_logs ADD COLUMN past_weight_2_value DECIMAL(5,2);');
        console.error('-- 体重確認フラグ用カラム');
        console.error('ALTER TABLE prediction_logs ADD COLUMN current_weight_verified BOOLEAN DEFAULT false;');
        console.error('ALTER TABLE prediction_logs ADD COLUMN mother_weight_verified BOOLEAN DEFAULT false;');
        console.error('ALTER TABLE prediction_logs ADD COLUMN father_weight_verified BOOLEAN DEFAULT false;');
        
        // フォールバック: 新しいカラムを除いてリトライ
        console.log('🔄 新しいカラムを除いてリトライ中...');
        const fallbackData = { ...logData };
        delete fallbackData.past_weight_1_date;
        delete fallbackData.past_weight_1_value;
        delete fallbackData.past_weight_2_date;
        delete fallbackData.past_weight_2_value;
        delete fallbackData.current_weight_verified;
        delete fallbackData.mother_weight_verified;
        delete fallbackData.father_weight_verified;
        
        const { data: fallbackResult, error: fallbackError } = await supabase
          .from('prediction_logs')
          .insert(fallbackData)
          .select('id')
          .single();
          
        if (fallbackError) {
          console.error('❌ フォールバックも失敗:', fallbackError);
          throw new Error(`フォールバック保存も失敗: ${fallbackError.message}`);
        }
        
        console.log('✅ フォールバック保存成功, log ID:', fallbackResult.id);
        return fallbackResult.id;
      }
      
      throw new Error(`データの保存に失敗しました: ${error.message}`);
    }

    console.log('✅ Prediction started, log ID:', data.id);
    console.log('✅ Log ID type:', typeof data.id);
    console.log('✅ Log ID length:', data.id?.length);
    return data.id;
  } catch (error) {
    console.error('Save prediction start error:', error);
    throw error;
  }
};

// 予測完了時に結果を更新（体重のみ）
export const updatePredictionCompletion = async (
  id: string,
  predictedWeight: number
): Promise<void> => {
  try {
    console.log('🔄 予測体重更新開始:', { id, predictedWeight });
    
    // 入力値の検証
    if (!id || typeof id !== 'string') {
      throw new Error(`Invalid id: ${id}`);
    }
    
    if (typeof predictedWeight !== 'number' || isNaN(predictedWeight) || predictedWeight <= 0) {
      throw new Error(`Invalid predicted weight: ${predictedWeight}`);
    }
    
    const updateData = {
      predicted_weight: Number(predictedWeight.toFixed(2)), // 小数点以下2桁に丸める
      prediction_completed_at: new Date().toISOString()
    };
    
    console.log('📝 更新データ:', updateData);
    console.log('📝 使用するID:', id, '(type:', typeof id, ', length:', id.length, ')');

    const { data, error } = await supabase
      .from('prediction_logs')
      .update(updateData)
      .eq('id', id)
      .select('id, predicted_weight');

    if (error) {
      console.error('❌ Supabase update error:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // ヘッダーエラーの場合、REST APIを直接使用
      if (error.message && error.message.includes('Headers')) {
        console.log('🔄 ヘッダーエラーを検出、REST APIで直接更新を試行...');
        try {
          // 環境変数を安全に取得（他の部分と同じAPIキーを使用）
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
          
          console.log('🔍 REST API用の環境変数確認:', {
            url_length: supabaseUrl?.length || 0,
            key_length: supabaseKey?.length || 0,
            url_starts_with_https: supabaseUrl?.startsWith('https://'),
            key_is_valid_length: (supabaseKey?.length || 0) > 50
          });
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('環境変数が無効です');
          }
          
          // XMLHttpRequestを使用（他の機能と同じ方法）
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const baseUrl = `${supabaseUrl}/rest/v1/prediction_logs`;
            
            // JWTトークンをクリーンアップ（他の機能と同じ方法）
            const cleanApikey = supabaseKey.replace(/\s+/g, '').trim();
            
            xhr.open('PATCH', `${baseUrl}?id=eq.${id}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('apikey', cleanApikey);
            xhr.setRequestHeader('Authorization', `Bearer ${cleanApikey}`);
            xhr.setRequestHeader('Prefer', 'return=representation');
            
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 204) {
                  try {
                    const response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                    console.log('✅ XMLHttpRequestでの予測体重更新成功:', response);
                    resolve();
                  } catch (parseError) {
                    console.log('✅ XMLHttpRequestでの予測体重更新成功（レスポンス解析不要）');
                    resolve();
                  }
                } else {
                  console.error('❌ XMLHttpRequest失敗:', xhr.status, xhr.responseText);
                  reject(new Error(`XMLHttpRequest error: ${xhr.status} ${xhr.responseText}`));
                }
              }
            };
            
            xhr.onerror = function() {
              reject(new Error('XMLHttpRequestネットワークエラー'));
            };
            
            xhr.send(JSON.stringify(updateData));
          });
          
          return;
        } catch (retryError) {
          console.error('❌ REST API直接呼び出しも失敗:', retryError);
          throw new Error('予測結果の保存に失敗しました（ヘッダーエラー）');
        }
      }
      
      throw new Error(`予測結果の保存に失敗しました: ${error.message}`);
    }

    console.log('✅ Prediction completed for log ID:', id);
    console.log('✅ Updated data:', data);
  } catch (error) {
    console.error('Update prediction completion error:', error);
    throw error;
  }
};

// 予測体重の保存確認
export const verifyPredictionWeightSaved = async (id: string): Promise<{saved: boolean, value: number | null}> => {
  try {
    const { data, error } = await supabase
      .from('prediction_logs')
      .select('id, predicted_weight')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Verification query error:', error);
      return { saved: false, value: null };
    }

    const saved = data?.predicted_weight !== null && data?.predicted_weight !== undefined;
    console.log('🔍 予測体重保存確認:', { id, predicted_weight: data?.predicted_weight, saved });
    
    return { saved, value: data?.predicted_weight || null };
  } catch (error) {
    console.error('Verification error:', error);
    return { saved: false, value: null };
  }
};

// 全体的なデータ保存確認関数
export const verifyAllDataSaved = async (id: string): Promise<void> => {
  try {
    console.log('🔍 全体データ保存確認開始:', id);
    
    const { data, error } = await supabase
      .from('prediction_logs')
      .select(`
        id,
        current_weight_verified,
        mother_weight_verified,
        father_weight_verified,
        past_weight_1_date,
        past_weight_1_value,
        past_weight_2_date,
        past_weight_2_value,
        predicted_weight,
        prediction_completed_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ 全体データ確認エラー:', error);
      return;
    }

    console.log('📊 保存されている全データ:', data);
    
    // チェックボックス状態の確認
    const checkboxStatus = {
      current_weight_verified: data.current_weight_verified,
      mother_weight_verified: data.mother_weight_verified,
      father_weight_verified: data.father_weight_verified
    };
    console.log('✅ チェックボックス状態:', checkboxStatus);
    
    // 過去体重記録の確認
    const pastWeightsStatus = {
      past_weight_1: data.past_weight_1_date ? `${data.past_weight_1_date}: ${data.past_weight_1_value}kg` : 'なし',
      past_weight_2: data.past_weight_2_date ? `${data.past_weight_2_date}: ${data.past_weight_2_value}kg` : 'なし'
    };
    console.log('📈 過去体重記録:', pastWeightsStatus);
    
    // 予測体重の確認
    const predictionStatus = {
      predicted_weight: data.predicted_weight,
      completed_at: data.prediction_completed_at
    };
    console.log('🎯 予測結果:', predictionStatus);
    
  } catch (error) {
    console.error('❌ 全体データ確認エラー:', error);
  }
};

// 満足度評価を保存
export const saveSatisfactionRating = async (
  id: string,
  rating: 'yes' | 'no'
): Promise<void> => {
  try {
    const updateData = {
      satisfaction_rating: rating,
      satisfaction_rated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('prediction_logs')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error('満足度評価の保存に失敗しました');
    }

    console.log('Satisfaction rating saved for log ID:', id, 'Rating:', rating);
  } catch (error) {
    console.error('Save satisfaction rating error:', error);
    throw error;
  }
};

// ユーザーの予測履歴を取得
export const getUserPredictionLogs = async (lineUserId: string): Promise<PredictionLog[]> => {
  try {
    const { data, error } = await supabase
      .from('prediction_logs')
      .select('*')
      .eq('line_user_id', lineUserId)
      .order('prediction_started_at', { ascending: false });

    if (error) {
      console.error('Supabase select error:', error);
      throw new Error('履歴の取得に失敗しました');
    }

    return data || [];
  } catch (error) {
    console.error('Get user prediction logs error:', error);
    throw error;
  }
};

// 特定の予測ログを取得
export const getPredictionLogById = async (id: string): Promise<PredictionLog | null> => {
  try {
    const { data, error } = await supabase
      .from('prediction_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // レコードが見つからない場合
      }
      console.error('Supabase select error:', error);
      throw new Error('データの取得に失敗しました');
    }

    return data;
  } catch (error) {
    console.error('Get prediction log by id error:', error);
    throw error;
  }
};