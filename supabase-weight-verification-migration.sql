-- 体重確認チェックボックスのカラム追加
-- prediction_logsテーブルに体重確認フラグを追加

ALTER TABLE prediction_logs 
ADD COLUMN current_weight_verified BOOLEAN DEFAULT false,
ADD COLUMN mother_weight_verified BOOLEAN DEFAULT false,
ADD COLUMN father_weight_verified BOOLEAN DEFAULT false;

-- カラムにコメントを追加
COMMENT ON COLUMN prediction_logs.current_weight_verified IS '現在の体重が自分で確認されたものかどうか';
COMMENT ON COLUMN prediction_logs.mother_weight_verified IS '母親の体重が自分で確認されたものかどうか';
COMMENT ON COLUMN prediction_logs.father_weight_verified IS '父親の体重が自分で確認されたものかどうか';