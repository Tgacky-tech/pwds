-- Add individual columns for past weight records (maximum 2)
ALTER TABLE prediction_logs 
ADD COLUMN past_weight_1_date DATE,
ADD COLUMN past_weight_1_value DECIMAL(5,2),
ADD COLUMN past_weight_2_date DATE,
ADD COLUMN past_weight_2_value DECIMAL(5,2);

-- Add indexes for past weight data
CREATE INDEX idx_prediction_logs_past_weight_1_date ON prediction_logs(past_weight_1_date);
CREATE INDEX idx_prediction_logs_past_weight_2_date ON prediction_logs(past_weight_2_date);

-- Migration script to move existing JSONB data to new columns
UPDATE prediction_logs 
SET 
  past_weight_1_date = CASE 
    WHEN jsonb_array_length(past_weights) > 0 THEN 
      (past_weights->0->>'date')::DATE 
    ELSE NULL 
  END,
  past_weight_1_value = CASE 
    WHEN jsonb_array_length(past_weights) > 0 THEN 
      (past_weights->0->>'weight')::DECIMAL(5,2) 
    ELSE NULL 
  END,
  past_weight_2_date = CASE 
    WHEN jsonb_array_length(past_weights) > 1 THEN 
      (past_weights->1->>'date')::DATE 
    ELSE NULL 
  END,
  past_weight_2_value = CASE 
    WHEN jsonb_array_length(past_weights) > 1 THEN 
      (past_weights->1->>'weight')::DECIMAL(5,2) 
    ELSE NULL 
  END
WHERE past_weights IS NOT NULL AND jsonb_array_length(past_weights) > 0;

-- Optional: Remove the old JSONB column after confirming data migration
-- ALTER TABLE prediction_logs DROP COLUMN past_weights;