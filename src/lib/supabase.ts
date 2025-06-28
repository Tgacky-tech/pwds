import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// LIFF環境対応のオプション設定
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // LIFF環境ではセッション永続化を無効
    autoRefreshToken: false, // 自動トークン更新を無効
  },
});

// データベース型定義
export interface PredictionLog {
  id?: string;
  // 予測開始時に記録
  prediction_started_at?: string;
  
  // LINEユーザー情報
  line_user_id: string;
  display_name: string;
  
  // インプット情報
  purchase_source: string;
  has_purchase_experience: string;
  breed: string;
  gender: string;
  birth_date: string;
  current_weight: number;
  birth_weight?: number;
  past_weights?: { date: string; weight: number }[];
  mother_adult_weight?: number;
  father_adult_weight?: number;
  
  // アウトプット情報（体重のみ）
  predicted_weight?: number;
  
  // 予測完了時刻
  prediction_completed_at?: string;
  
  // 満足度評価
  satisfaction_rating?: 'yes' | 'no';
  satisfaction_rated_at?: string;
}