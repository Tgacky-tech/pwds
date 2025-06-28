// LIFF環境用データエクスポート機能

export const exportLocalDataAsCSV = () => {
  try {
    // ローカルストレージからデータを取得
    const predictions = JSON.parse(localStorage.getItem('prediction_logs') || '[]');
    const completions = JSON.parse(localStorage.getItem('prediction_completions') || '[]');
    const satisfactions = JSON.parse(localStorage.getItem('satisfaction_ratings') || '[]');
    
    if (predictions.length === 0) {
      console.log('No data to export');
      return;
    }
    
    // データをマージ
    const mergedData = predictions.map((pred: any) => {
      const completion = completions.find((comp: any) => comp.id === pred.id);
      const satisfaction = satisfactions.find((sat: any) => sat.id === pred.id);
      
      return {
        id: pred.id,
        timestamp: pred.timestamp,
        line_user_id: pred.line_user_id,
        display_name: pred.display_name,
        breed: pred.breed,
        gender: pred.gender,
        birth_date: pred.birth_date,
        current_weight: pred.current_weight,
        purchase_source: pred.purchase_source,
        has_purchase_experience: pred.has_purchase_experience,
        predicted_weight: completion?.predicted_weight || '',
        processing_time_ms: completion?.processing_time_ms || '',
        satisfaction_rating: satisfaction?.satisfaction_rating || '',
        prediction_completed_at: completion?.prediction_completed_at || '',
        satisfaction_rated_at: satisfaction?.satisfaction_rated_at || ''
      };
    });
    
    // CSV形式に変換
    const headers = Object.keys(mergedData[0]).join(',');
    const csvContent = [
      headers,
      ...mergedData.map(row => Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(','))
    ].join('\n');
    
    // ダウンロード
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prediction_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Data exported as CSV');
  } catch (error) {
    console.error('Export failed:', error);
  }
};

export const getLocalDataSummary = () => {
  try {
    const predictions = JSON.parse(localStorage.getItem('prediction_logs') || '[]');
    const completions = JSON.parse(localStorage.getItem('prediction_completions') || '[]');
    const satisfactions = JSON.parse(localStorage.getItem('satisfaction_ratings') || '[]');
    
    return {
      totalPredictions: predictions.length,
      completedPredictions: completions.length,
      satisfactionResponses: satisfactions.length,
      lastUpdate: predictions.length > 0 ? predictions[predictions.length - 1].timestamp : null
    };
  } catch (error) {
    console.error('Summary failed:', error);
    return { totalPredictions: 0, completedPredictions: 0, satisfactionResponses: 0, lastUpdate: null };
  }
};

// 開発者用：コンソールでデータ確認
export const logAllLocalData = () => {
  console.group('📊 Local Data Summary');
  console.log('Predictions:', JSON.parse(localStorage.getItem('prediction_logs') || '[]'));
  console.log('Completions:', JSON.parse(localStorage.getItem('prediction_completions') || '[]'));
  console.log('Satisfactions:', JSON.parse(localStorage.getItem('satisfaction_ratings') || '[]'));
  console.log('Summary:', getLocalDataSummary());
  console.groupEnd();
};

// ウィンドウオブジェクトに開発者用関数を追加
declare global {
  interface Window {
    exportPredictionData: () => void;
    logPredictionData: () => void;
  }
}

window.exportPredictionData = exportLocalDataAsCSV;
window.logPredictionData = logAllLocalData;