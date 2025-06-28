// データ同期とフィードバック機能

// 蓄積されたローカルデータを開発者に送信する機能
export const sendDataFeedback = async () => {
  try {
    const predictions = JSON.parse(localStorage.getItem('prediction_logs') || '[]');
    const completions = JSON.parse(localStorage.getItem('prediction_completions') || '[]');
    const satisfactions = JSON.parse(localStorage.getItem('satisfaction_ratings') || '[]');
    
    if (predictions.length === 0) {
      console.log('No data to send');
      return;
    }
    
    // データサマリーを作成
    const summary = {
      timestamp: new Date().toISOString(),
      dataCount: {
        predictions: predictions.length,
        completions: completions.length,
        satisfactions: satisfactions.length
      },
      lastEntries: {
        prediction: predictions[predictions.length - 1],
        completion: completions[completions.length - 1],
        satisfaction: satisfactions[satisfactions.length - 1]
      }
    };
    
    // 簡易的なフィードバック送信（実際の実装では適切なエンドポイントを使用）
    console.group('📤 Data Feedback Ready');
    console.log('Summary:', summary);
    console.log('Full Data:', { predictions, completions, satisfactions });
    console.groupEnd();
    
    // メール形式でのフィードバック準備
    const emailBody = encodeURIComponent(`
Dog Growth Prediction - Data Feedback

Summary:
- Total Predictions: ${predictions.length}
- Completed Predictions: ${completions.length}
- Satisfaction Responses: ${satisfactions.length}

Last Prediction Data:
${JSON.stringify(summary.lastEntries, null, 2)}

Full data is available in browser console.
    `);
    
    const emailLink = `mailto:feedback@yourapp.com?subject=PWDS Data Feedback&body=${emailBody}`;
    console.log('Email feedback link:', emailLink);
    
    return summary;
  } catch (error) {
    console.error('Data feedback preparation failed:', error);
    return null;
  }
};

// 定期的なデータチェック（30分ごと）
export const startDataMonitoring = () => {
  setInterval(() => {
    const predictions = JSON.parse(localStorage.getItem('prediction_logs') || '[]');
    if (predictions.length > 0) {
      console.log(`📊 Data Status: ${predictions.length} predictions stored locally`);
    }
  }, 30 * 60 * 1000); // 30分ごと
};

// 開発者用：手動データ送信
declare global {
  interface Window {
    sendDataFeedback: () => Promise<any>;
  }
}

window.sendDataFeedback = sendDataFeedback;