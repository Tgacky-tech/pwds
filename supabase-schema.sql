-- 犬の成長予測利用ログテーブル（予測ボタン押下時のみ記録）
CREATE TABLE prediction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 予測開始時に記録
  prediction_started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- LINEユーザー情報
  line_user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  
  -- インプット情報（予測ボタン押下時）
  purchase_source TEXT NOT NULL CHECK (purchase_source IN ('petshop', 'breeder', 'other')),
  has_purchase_experience TEXT NOT NULL CHECK (has_purchase_experience IN ('yes', 'no')),
  breed TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  birth_date DATE NOT NULL,
  current_weight DECIMAL(5,2) NOT NULL,
  birth_weight DECIMAL(5,2),
  past_weights JSONB,  -- [{"date": "2024-01-01", "weight": 1.5}]
  mother_adult_weight DECIMAL(5,2),
  father_adult_weight DECIMAL(5,2),
  
  -- アウトプット情報（体重のみ）
  predicted_weight DECIMAL(5,2),
  
  -- 予測完了時刻（予測処理完了時に更新）
  prediction_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- 満足度評価（結果表示後にユーザーが評価）
  satisfaction_rating TEXT CHECK (satisfaction_rating IN ('yes', 'no')),
  satisfaction_rated_at TIMESTAMP WITH TIME ZONE
);

-- インデックス作成
CREATE INDEX idx_prediction_logs_line_user_id ON prediction_logs(line_user_id);
CREATE INDEX idx_prediction_logs_started_at ON prediction_logs(prediction_started_at);
CREATE INDEX idx_prediction_logs_completed_at ON prediction_logs(prediction_completed_at);
CREATE INDEX idx_prediction_logs_breed ON prediction_logs(breed);
CREATE INDEX idx_prediction_logs_satisfaction ON prediction_logs(satisfaction_rating);

-- RLS (Row Level Security) 設定
ALTER TABLE prediction_logs ENABLE ROW LEVEL SECURITY;

-- 管理者用ビュー（CSV出力用）
CREATE VIEW prediction_analytics AS
SELECT 
  id,
  prediction_started_at,
  prediction_completed_at,
  satisfaction_rated_at,
  line_user_id,
  display_name,
  purchase_source,
  has_purchase_experience,
  breed,
  gender,
  birth_date,
  current_weight,
  birth_weight,
  mother_adult_weight,
  father_adult_weight,
  predicted_weight,
  satisfaction_rating,
  -- 処理時間を計算
  EXTRACT(EPOCH FROM (prediction_completed_at - prediction_started_at)) as processing_time_seconds
FROM prediction_logs
WHERE prediction_completed_at IS NOT NULL
ORDER BY prediction_started_at DESC;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can only access their own logs" ON prediction_logs
  FOR ALL USING (line_user_id = current_setting('app.current_user_id', true));

-- 匿名ユーザーでも挿入・更新可能（LINEユーザーID認証）
CREATE POLICY "Allow anonymous insert and update" ON prediction_logs
  FOR ALL WITH CHECK (true);