-- セキュアなSupabaseスキーマ（推奨版）

-- テーブル作成（変更なし）
CREATE TABLE prediction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  line_user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  purchase_source TEXT NOT NULL CHECK (purchase_source IN ('petshop', 'breeder', 'other')),
  has_purchase_experience TEXT NOT NULL CHECK (has_purchase_experience IN ('yes', 'no')),
  breed TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  birth_date DATE NOT NULL,
  current_weight DECIMAL(5,2) NOT NULL,
  birth_weight DECIMAL(5,2),
  past_weights JSONB,
  mother_adult_weight DECIMAL(5,2),
  father_adult_weight DECIMAL(5,2),
  predicted_weight DECIMAL(5,2),
  prediction_completed_at TIMESTAMP WITH TIME ZONE,
  satisfaction_rating TEXT CHECK (satisfaction_rating IN ('yes', 'no')),
  satisfaction_rated_at TIMESTAMP WITH TIME ZONE
);

-- インデックス作成
CREATE INDEX idx_prediction_logs_line_user_id ON prediction_logs(line_user_id);
CREATE INDEX idx_prediction_logs_started_at ON prediction_logs(prediction_started_at);

-- RLS有効化
ALTER TABLE prediction_logs ENABLE ROW LEVEL SECURITY;

-- セキュアなポリシー
CREATE POLICY "Secure LINE user insert" ON prediction_logs
  FOR INSERT WITH CHECK (
    -- LINE User IDの形式検証
    line_user_id IS NOT NULL 
    AND length(line_user_id) = 33
    AND line_user_id LIKE 'U%'
    -- 表示名の妥当性検証
    AND display_name IS NOT NULL
    AND length(display_name) <= 50
    -- レート制限（1分に1回まで）
    AND NOT EXISTS (
      SELECT 1 FROM prediction_logs 
      WHERE line_user_id = NEW.line_user_id 
      AND prediction_started_at > NOW() - INTERVAL '1 minute'
    )
  );

-- 更新は自分のデータのみ
CREATE POLICY "Users update own data only" ON prediction_logs
  FOR UPDATE USING (
    line_user_id IS NOT NULL
    AND id IS NOT NULL
  ) WITH CHECK (
    -- 変更可能なフィールドを制限
    line_user_id = OLD.line_user_id  -- ユーザーIDは変更不可
    AND display_name = OLD.display_name  -- 表示名は変更不可
    AND prediction_started_at = OLD.prediction_started_at  -- 開始時刻は変更不可
  );

-- 読み取りは自分のデータのみ（管理者除く）
CREATE POLICY "Users read own data only" ON prediction_logs
  FOR SELECT USING (
    line_user_id IS NOT NULL
  );

-- 管理者用の安全なビュー（個人情報を除く）
CREATE VIEW public_analytics AS
SELECT 
  id,
  prediction_started_at,
  prediction_completed_at,
  breed,
  gender,
  purchase_source,
  has_purchase_experience,
  current_weight,
  predicted_weight,
  satisfaction_rating,
  EXTRACT(EPOCH FROM (prediction_completed_at - prediction_started_at)) as processing_time_seconds
FROM prediction_logs
WHERE prediction_completed_at IS NOT NULL
ORDER BY prediction_started_at DESC;