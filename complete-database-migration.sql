-- 完全なデータベースマイグレーション
-- Supabase SQL Editorで以下を実行してください

-- ========================================
-- 1. 過去体重記録用カラムの追加
-- ========================================
ALTER TABLE prediction_logs 
ADD COLUMN IF NOT EXISTS past_weight_1_date DATE,
ADD COLUMN IF NOT EXISTS past_weight_1_value DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS past_weight_2_date DATE,
ADD COLUMN IF NOT EXISTS past_weight_2_value DECIMAL(5,2);

-- ========================================
-- 2. 体重確認フラグカラムの追加
-- ========================================
ALTER TABLE prediction_logs 
ADD COLUMN IF NOT EXISTS current_weight_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mother_weight_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS father_weight_verified BOOLEAN DEFAULT false;

-- ========================================
-- 3. インデックスの追加
-- ========================================
CREATE INDEX IF NOT EXISTS idx_prediction_logs_past_weight_1_date ON prediction_logs(past_weight_1_date);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_past_weight_2_date ON prediction_logs(past_weight_2_date);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_current_weight_verified ON prediction_logs(current_weight_verified);

-- ========================================
-- 4. 既存データのマイグレーション（必要に応じて）
-- ========================================
-- 既存のJSONB past_weightsデータを新しいカラムに移行
UPDATE prediction_logs 
SET 
  past_weight_1_date = CASE 
    WHEN past_weights IS NOT NULL AND jsonb_array_length(past_weights) > 0 THEN 
      (past_weights->0->>'date')::DATE 
    ELSE NULL 
  END,
  past_weight_1_value = CASE 
    WHEN past_weights IS NOT NULL AND jsonb_array_length(past_weights) > 0 THEN 
      (past_weights->0->>'weight')::DECIMAL(5,2) 
    ELSE NULL 
  END,
  past_weight_2_date = CASE 
    WHEN past_weights IS NOT NULL AND jsonb_array_length(past_weights) > 1 THEN 
      (past_weights->1->>'date')::DATE 
    ELSE NULL 
  END,
  past_weight_2_value = CASE 
    WHEN past_weights IS NOT NULL AND jsonb_array_length(past_weights) > 1 THEN 
      (past_weights->1->>'weight')::DECIMAL(5,2) 
    ELSE NULL 
  END
WHERE past_weights IS NOT NULL AND jsonb_array_length(past_weights) > 0;

-- ========================================
-- 5. マイグレーション確認クエリ
-- ========================================
-- カラムが正しく追加されたかを確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prediction_logs' 
AND column_name IN (
  'past_weight_1_date', 'past_weight_1_value', 
  'past_weight_2_date', 'past_weight_2_value',
  'current_weight_verified', 'mother_weight_verified', 'father_weight_verified'
)
ORDER BY column_name;

-- データのサンプルを確認
SELECT 
  id,
  current_weight,
  current_weight_verified,
  past_weight_1_date,
  past_weight_1_value,
  past_weight_2_date,
  past_weight_2_value,
  mother_adult_weight,
  mother_weight_verified,
  father_adult_weight,
  father_weight_verified
FROM prediction_logs 
ORDER BY prediction_started_at DESC
LIMIT 3;