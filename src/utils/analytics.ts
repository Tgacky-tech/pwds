// LIFF環境用の簡易分析機能（コンソールログベース）

export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  userId?: string;
  data?: any;
}

// コンソールログとしてイベントを記録
export const logEvent = (event: string, data?: any, userId?: string) => {
  const analyticsEvent: AnalyticsEvent = {
    event,
    timestamp: new Date().toISOString(),
    userId,
    data
  };
  
  // 構造化されたログとして出力（分析ツールで収集可能）
  console.log('ANALYTICS:', JSON.stringify(analyticsEvent));
};

// 予測開始イベント
export const logPredictionStart = (formData: any, user: any) => {
  logEvent('prediction_start', {
    breed: formData.breed,
    gender: formData.gender,
    current_weight: formData.currentWeight,
    purchase_source: formData.purchaseSource,
    has_purchase_experience: formData.hasPurchaseExperience
  }, user?.lineUserId);
};

// 予測完了イベント
export const logPredictionComplete = (predictedWeight: number, processingTime?: number) => {
  logEvent('prediction_complete', {
    predicted_weight: predictedWeight,
    processing_time_ms: processingTime
  });
};

// 満足度評価イベント
export const logSatisfactionRating = (rating: 'yes' | 'no') => {
  logEvent('satisfaction_rating', {
    rating
  });
};