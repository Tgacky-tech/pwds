import { supabase, type PredictionLog } from '../lib/supabase';
import { DogFormData, PredictionResult, User } from '../types';

// 予測開始時にフォームデータを保存
// データサニタイズ関数
const sanitizeString = (str: string): string => {
  if (!str) return '';
  // 制御文字や無効なUTF-8文字を除去
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
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
      current_weight_verified: formData.currentWeightVerified || false,
      mother_weight_verified: formData.motherWeightVerified || false,
      father_weight_verified: formData.fatherWeightVerified || false,
    };
    
    console.log('Log data prepared:', logData);
    console.log('Past weights data:', {
      pastWeights: formData.pastWeights,
      past_weight_1_date: logData.past_weight_1_date,
      past_weight_1_value: logData.past_weight_1_value,
      past_weight_2_date: logData.past_weight_2_date,
      past_weight_2_value: logData.past_weight_2_value
    });

    const { data, error } = await supabase
      .from('prediction_logs')
      .insert(logData)
      .select('id')
      .single();

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
    
    const updateData = {
      predicted_weight: predictedWeight,
      prediction_completed_at: new Date().toISOString()
    };
    
    console.log('📝 更新データ:', updateData);

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
      throw new Error('予測結果の保存に失敗しました');
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