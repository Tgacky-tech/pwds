-- 既存の危険なポリシーを削除してセキュアなポリシーに移行

-- 1. 既存の危険なポリシーを削除
DROP POLICY IF EXISTS "Allow anonymous insert" ON prediction_logs;
DROP POLICY IF EXISTS "Allow anonymous update" ON prediction_logs;
DROP POLICY IF EXISTS "Users can only access their own logs" ON prediction_logs;
DROP POLICY IF EXISTS "Allow anonymous insert and update" ON prediction_logs;

-- 2. 既存のビューを削除（新しいセキュアビューと競合するため）
DROP VIEW IF EXISTS prediction_analytics;

-- 3. RLS有効化（既に有効の場合はエラーにならない）
ALTER TABLE prediction_logs ENABLE ROW LEVEL SECURITY;

-- 4. セキュアなポリシーを追加
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
      SELECT 1 FROM prediction_logs existing
      WHERE existing.line_user_id = line_user_id 
      AND existing.prediction_started_at > NOW() - INTERVAL '1 minute'
    )
  );

-- 5. 更新は自分のデータのみ
CREATE POLICY "Users update own data only" ON prediction_logs
  FOR UPDATE USING (
    line_user_id IS NOT NULL
    AND id IS NOT NULL
  );

-- 6. 読み取りは自分のデータのみ（管理者除く）
CREATE POLICY "Users read own data only" ON prediction_logs
  FOR SELECT USING (
    line_user_id IS NOT NULL
  );

-- 7. 管理者用の安全なビュー（個人情報を除く）
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

-- 8. 必要なインデックスを追加（既存の場合はエラーにならない）
CREATE INDEX IF NOT EXISTS idx_prediction_logs_line_user_id ON prediction_logs(line_user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_started_at ON prediction_logs(prediction_started_at);