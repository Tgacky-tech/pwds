-- 元のprediction_logsテーブルに不足しているカラムを追加
-- Supabase SQL Editorで実行してください

-- 過去体重記録用カラム（存在しない場合のみ追加）
ALTER TABLE prediction_logs 
ADD COLUMN IF NOT EXISTS past_weight_1_date DATE,
ADD COLUMN IF NOT EXISTS past_weight_1_value DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS past_weight_2_date DATE,
ADD COLUMN IF NOT EXISTS past_weight_2_value DECIMAL(5,2);

-- 体重確認フラグカラム（存在しない場合のみ追加）
ALTER TABLE prediction_logs 
ADD COLUMN IF NOT EXISTS current_weight_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mother_weight_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS father_weight_verified BOOLEAN DEFAULT false;

-- 確認クエリ
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prediction_logs' 
AND column_name IN (
  'past_weight_1_date', 'past_weight_1_value', 
  'past_weight_2_date', 'past_weight_2_value',
  'current_weight_verified', 'mother_weight_verified', 'father_weight_verified'
)
ORDER BY column_name;