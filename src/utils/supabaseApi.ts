import { supabase, type PredictionLog } from '../lib/supabase';
import { DogFormData, PredictionResult, User } from '../types';

// 予測開始時にフォームデータを保存
export const savePredictionStart = async (
  formData: DogFormData,
  user: User
): Promise<string> => {
  try {
    const logData: Partial<PredictionLog> = {
      line_user_id: user.lineUserId,
      display_name: user.displayName,
      purchase_source: formData.purchaseSource,
      has_purchase_experience: formData.hasPurchaseExperience,
      breed: formData.breed,
      gender: formData.gender,
      birth_date: formData.birthDate,
      current_weight: Number(formData.currentWeight),
      birth_weight: formData.birthWeight ? Number(formData.birthWeight) : undefined,
      past_weights: formData.pastWeights?.map(pw => ({
        date: pw.date,
        weight: Number(pw.weight)
      })),
      mother_adult_weight: formData.motherAdultWeight ? Number(formData.motherAdultWeight) : undefined,
      father_adult_weight: formData.fatherAdultWeight ? Number(formData.fatherAdultWeight) : undefined,
    };

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
      throw new Error(`データの保存に失敗しました: ${error.message}`);
    }

    console.log('Prediction started, log ID:', data.id);
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
    const updateData = {
      predicted_weight: predictedWeight,
      prediction_completed_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('prediction_logs')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error('予測結果の保存に失敗しました');
    }

    console.log('Prediction completed for log ID:', id);
  } catch (error) {
    console.error('Update prediction completion error:', error);
    throw error;
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