-- 新しいテーブル作成（prediction_logs_v2）
-- Supabase SQL Editorで実行してください

-- ========================================
-- 1. 新しいテーブル作成
-- ========================================
CREATE TABLE prediction_logs_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- LINEユーザー情報
  line_user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  
  -- インプット情報
  purchase_source TEXT NOT NULL CHECK (purchase_source IN ('petshop', 'breeder', 'other')),
  has_purchase_experience TEXT NOT NULL CHECK (has_purchase_experience IN ('yes', 'no')),
  breed TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  birth_date DATE NOT NULL,
  current_weight DECIMAL(5,2) NOT NULL,
  birth_weight DECIMAL(5,2),
  
  -- 過去体重記録（個別カラム）
  past_weight_1_date DATE,
  past_weight_1_value DECIMAL(5,2),
  past_weight_2_date DATE,
  past_weight_2_value DECIMAL(5,2),
  
  -- 親の体重
  mother_adult_weight DECIMAL(5,2),
  father_adult_weight DECIMAL(5,2),
  
  -- 体重確認フラグ
  current_weight_verified BOOLEAN DEFAULT false,
  mother_weight_verified BOOLEAN DEFAULT false,
  father_weight_verified BOOLEAN DEFAULT false,
  
  -- アウトプット情報
  predicted_weight DECIMAL(5,2),
  prediction_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- 満足度評価
  satisfaction_rating TEXT CHECK (satisfaction_rating IN ('yes', 'no')),
  satisfaction_rated_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 2. インデックス作成
-- ========================================
CREATE INDEX idx_prediction_logs_v2_line_user_id ON prediction_logs_v2(line_user_id);
CREATE INDEX idx_prediction_logs_v2_started_at ON prediction_logs_v2(prediction_started_at);
CREATE INDEX idx_prediction_logs_v2_past_weight_1_date ON prediction_logs_v2(past_weight_1_date);
CREATE INDEX idx_prediction_logs_v2_past_weight_2_date ON prediction_logs_v2(past_weight_2_date);
CREATE INDEX idx_prediction_logs_v2_current_weight_verified ON prediction_logs_v2(current_weight_verified);

-- ========================================
-- 3. RLS (Row Level Security) 設定
-- ========================================
ALTER TABLE prediction_logs_v2 ENABLE ROW LEVEL SECURITY;

-- 挿入ポリシー
CREATE POLICY "Users can insert own data v2" ON prediction_logs_v2
  FOR INSERT WITH CHECK (
    line_user_id IS NOT NULL 
    AND length(line_user_id) = 33
    AND line_user_id LIKE 'U%'
    AND display_name IS NOT NULL
    AND length(display_name) <= 50
  );

-- 更新ポリシー
CREATE POLICY "Users update own data only v2" ON prediction_logs_v2
  FOR UPDATE USING (
    line_user_id IS NOT NULL
    AND id IS NOT NULL
  ) WITH CHECK (
    line_user_id = OLD.line_user_id
    AND display_name = OLD.display_name
    AND prediction_started_at = OLD.prediction_started_at
  );

-- 読み取りポリシー
CREATE POLICY "Users read own data only v2" ON prediction_logs_v2
  FOR SELECT USING (
    line_user_id IS NOT NULL
  );

-- ========================================
-- 4. 既存データの移行（オプション）
-- ========================================
-- 既存のprediction_logsからデータをコピーする場合
/*
INSERT INTO prediction_logs_v2 (
  id, prediction_started_at, line_user_id, display_name,
  purchase_source, has_purchase_experience, breed, gender,
  birth_date, current_weight, birth_weight,
  mother_adult_weight, father_adult_weight,
  predicted_weight, prediction_completed_at,
  satisfaction_rating, satisfaction_rated_at
)
SELECT 
  id, prediction_started_at, line_user_id, display_name,
  purchase_source, has_purchase_experience, breed, gender,
  birth_date, current_weight, birth_weight,
  mother_adult_weight, father_adult_weight,
  predicted_weight, prediction_completed_at,
  satisfaction_rating, satisfaction_rated_at
FROM prediction_logs
WHERE prediction_started_at IS NOT NULL;
*/

-- ========================================
-- 5. テーブル作成確認
-- ========================================
-- カラム確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prediction_logs_v2' 
ORDER BY ordinal_position;

-- 権限確認
SELECT schemaname, tablename, hasinserts, hasupdates, hasselects 
FROM pg_tables 
WHERE tablename = 'prediction_logs_v2';