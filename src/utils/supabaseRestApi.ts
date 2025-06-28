// LIFF環境用 Supabase REST API直接実装

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase REST API直接呼び出し
export const insertPredictionLog = async (data: any) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/prediction_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Supabase REST API error:', response.status, errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    console.log('Successfully inserted data via REST API:', result);
    return result[0]?.id;
  } catch (error) {
    console.error('REST API insert error:', error);
    throw error;
  }
};

// 予測完了の更新
export const updatePredictionLogCompletion = async (id: string, predictedWeight: number) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/prediction_logs?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        predicted_weight: predictedWeight,
        prediction_completed_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Supabase REST API update error:', response.status, errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    console.log('Successfully updated prediction completion via REST API');
  } catch (error) {
    console.error('REST API update error:', error);
    throw error;
  }
};

// 満足度評価の更新
export const updateSatisfactionRating = async (id: string, rating: 'yes' | 'no') => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/prediction_logs?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        satisfaction_rating: rating,
        satisfaction_rated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Supabase REST API satisfaction update error:', response.status, errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    console.log('Successfully updated satisfaction rating via REST API');
  } catch (error) {
    console.error('REST API satisfaction update error:', error);
    throw error;
  }
};