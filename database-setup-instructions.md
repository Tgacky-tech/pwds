# データベースセットアップ手順

## 1. 過去の体重記録対応のためのマイグレーション

以下のSQLをSupabaseのSQL Editorで実行してください：

```sql
-- ステップ1: 過去の体重記録用のカラムを追加
ALTER TABLE prediction_logs 
ADD COLUMN IF NOT EXISTS past_weight_1_date DATE,
ADD COLUMN IF NOT EXISTS past_weight_1_value DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS past_weight_2_date DATE,
ADD COLUMN IF NOT EXISTS past_weight_2_value DECIMAL(5,2);

-- ステップ2: 体重確認フラグカラムを追加
ALTER TABLE prediction_logs 
ADD COLUMN IF NOT EXISTS current_weight_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mother_weight_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS father_weight_verified BOOLEAN DEFAULT false;

-- ステップ3: インデックスを追加
CREATE INDEX IF NOT EXISTS idx_prediction_logs_past_weight_1_date ON prediction_logs(past_weight_1_date);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_past_weight_2_date ON prediction_logs(past_weight_2_date);

-- ステップ4: カラム追加の確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prediction_logs' 
AND column_name IN (
  'past_weight_1_date', 'past_weight_1_value', 
  'past_weight_2_date', 'past_weight_2_value',
  'current_weight_verified', 'mother_weight_verified', 'father_weight_verified'
)
ORDER BY column_name;
```

## 2. 既存データの移行（必要に応じて）

既存のJSONB形式の過去体重データを新しいカラムに移行する場合：

```sql
-- 既存のpast_weightsデータを新しいカラムに移行
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
WHERE past_weights IS NOT NULL;
```

## 3. テーブル構造確認

以下のクエリでテーブル構造を確認できます：

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prediction_logs' 
ORDER BY ordinal_position;
```

## 4. データ確認

過去の体重記録と体重確認フラグが正しく保存されているかを確認：

```sql
-- 新しいカラムを含む最新データの確認
SELECT 
  id,
  line_user_id,
  current_weight,
  current_weight_verified,
  past_weight_1_date,
  past_weight_1_value,
  past_weight_2_date,
  past_weight_2_value,
  mother_adult_weight,
  mother_weight_verified,
  father_adult_weight,
  father_weight_verified,
  prediction_started_at
FROM prediction_logs 
ORDER BY prediction_started_at DESC
LIMIT 5;

-- 体重確認フラグのサマリー
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN current_weight_verified = true THEN 1 END) as current_verified_count,
  COUNT(CASE WHEN mother_weight_verified = true THEN 1 END) as mother_verified_count,
  COUNT(CASE WHEN father_weight_verified = true THEN 1 END) as father_verified_count,
  COUNT(CASE WHEN past_weight_1_date IS NOT NULL THEN 1 END) as past_weight_1_count,
  COUNT(CASE WHEN past_weight_2_date IS NOT NULL THEN 1 END) as past_weight_2_count
FROM prediction_logs;
```