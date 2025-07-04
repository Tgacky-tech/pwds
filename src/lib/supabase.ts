import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数のサニタイズと検証
const sanitizeEnvVar = (value: string): string => {
  if (!value) return '';
  // 制御文字、改行、タブ、無効なUTF-8文字を除去
  return value.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
};

const cleanSupabaseUrl = sanitizeEnvVar(supabaseUrl);
const cleanSupabaseAnonKey = sanitizeEnvVar(supabaseAnonKey);

console.log('🔍 Environment variables check:', {
  url_length: cleanSupabaseUrl?.length || 0,
  key_length: cleanSupabaseAnonKey?.length || 0,
  url_valid: cleanSupabaseUrl?.startsWith('https://'),
  key_valid: cleanSupabaseAnonKey?.length > 50
});

if (!cleanSupabaseUrl || !cleanSupabaseAnonKey) {
  throw new Error('Missing or invalid Supabase environment variables');
}

// LIFF環境対応 - REST API直接使用
export const supabase = createClient(cleanSupabaseUrl, cleanSupabaseAnonKey, {
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
      // 環境変数の値を検証
      if (!cleanSupabaseAnonKey || typeof cleanSupabaseAnonKey !== 'string' || cleanSupabaseAnonKey.length === 0) {
        console.error('❌ Invalid cleanSupabaseAnonKey:', cleanSupabaseAnonKey);
        return fetch(url, options); // デフォルトのfetchを使用
      }

      // ヘッダーの値を安全に設定
      const safeHeaders = {};
      
      try {
        // 既存のヘッダーをコピー
        if (options.headers) {
          Object.assign(safeHeaders, options.headers);
        }
        
        // Content-Typeを安全に設定（文字列の妥当性を確認）
        const contentType = 'application/json';
        if (typeof contentType === 'string' && contentType.length > 0) {
          safeHeaders['Content-Type'] = contentType;
        }
        
        // APIキーを安全に設定（文字列の妥当性を確認）
        if (typeof cleanSupabaseAnonKey === 'string' && cleanSupabaseAnonKey.length > 0) {
          safeHeaders['apikey'] = cleanSupabaseAnonKey;
        }
        
        // Authorizationヘッダーを安全に設定
        const authHeader = `Bearer ${cleanSupabaseAnonKey}`;
        if (typeof authHeader === 'string' && authHeader.length > 7) { // "Bearer " + key
          safeHeaders['Authorization'] = authHeader;
        }
        
        // ヘッダー値の最終検証
        for (const [key, value] of Object.entries(safeHeaders)) {
          if (typeof value !== 'string' || value.length === 0) {
            console.warn(`⚠️ Invalid header value for ${key}:`, value);
            delete safeHeaders[key];
          }
        }
        
        const customOptions = {
          ...options,
          headers: safeHeaders,
        };
        
        console.log('🔍 Supabase fetch headers:', Object.keys(safeHeaders));
        return fetch(url, customOptions);
        
      } catch (headerError) {
        console.error('❌ Header設定エラー:', headerError);
        // エラー時はデフォルトのfetchを使用
        return fetch(url, options);
      }
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