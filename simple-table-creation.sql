-- シンプルな新テーブル作成
-- Supabase SQL Editorにコピペして実行してください

CREATE TABLE prediction_logs_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  line_user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  
  purchase_source TEXT NOT NULL,
  has_purchase_experience TEXT NOT NULL,
  breed TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date DATE NOT NULL,
  current_weight DECIMAL(5,2) NOT NULL,
  birth_weight DECIMAL(5,2),
  
  past_weight_1_date DATE,
  past_weight_1_value DECIMAL(5,2),
  past_weight_2_date DATE,
  past_weight_2_value DECIMAL(5,2),
  
  mother_adult_weight DECIMAL(5,2),
  father_adult_weight DECIMAL(5,2),
  
  current_weight_verified BOOLEAN DEFAULT false,
  mother_weight_verified BOOLEAN DEFAULT false,
  father_weight_verified BOOLEAN DEFAULT false,
  
  predicted_weight DECIMAL(5,2),
  prediction_completed_at TIMESTAMP WITH TIME ZONE,
  
  satisfaction_rating TEXT,
  satisfaction_rated_at TIMESTAMP WITH TIME ZONE
);

-- インデックス作成
CREATE INDEX idx_prediction_logs_v2_line_user_id ON prediction_logs_v2(line_user_id);
CREATE INDEX idx_prediction_logs_v2_started_at ON prediction_logs_v2(prediction_started_at);