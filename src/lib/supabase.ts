import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// LIFF環境対応 - REST API直接使用
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {},
    fetch: (url, options = {}) => {
      // LIFF環境用のfetchカスタマイズ
      const customOptions = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          ...options.headers,
        },
      };
      return fetch(url, customOptions);
    },
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
  past_weight_1_date?: string;
  past_weight_1_value?: number;
  past_weight_2_date?: string;
  past_weight_2_value?: number;
  mother_adult_weight?: number;
  father_adult_weight?: number;
  current_weight_verified?: boolean;
  mother_weight_verified?: boolean;
  father_weight_verified?: boolean;
  
  // アウトプット情報（体重のみ）
  predicted_weight?: number;
  
  // 予測完了時刻
  prediction_completed_at?: string;
  
  // 満足度評価
  satisfaction_rating?: 'yes' | 'no';
  satisfaction_rated_at?: string;
}