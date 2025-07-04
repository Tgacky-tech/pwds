import React, { useState, useEffect } from 'react';
import { DogFormData, PredictionResult, User } from './types';
import { predictDogGrowthWithGemini } from './utils/geminiApi';
import { savePredictionStart, updatePredictionCompletion, saveSatisfactionRating, verifyPredictionWeightSaved } from './utils/supabaseApi';
import { saveDataWithFallback } from './utils/liffCompatibleApi';
import { updateSatisfactionRating } from './utils/supabaseUpdate';
import { logPredictionStart, logPredictionComplete, logSatisfactionRating } from './utils/analytics';
import './utils/dataExport'; // データエクスポート機能を初期化
import { startDataMonitoring } from './utils/dataSync';
import './utils/supabaseDebug'; // Supabaseデバッグ機能を初期化
import LoginScreen from './components/LoginScreen';
import FormScreen from './components/FormScreen';
import ProcessingScreen from './components/ProcessingScreen';
import ResultScreen from './components/ResultScreen';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import UndoRedoDemo from './components/UndoRedoDemo';

import { initializeLiff, isLoggedIn, login, getProfile } from './liff';

type AppState = 'login' | 'form' | 'processing' | 'result' | 'terms' | 'privacy';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<DogFormData | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);

  // LIFF初期化とログイン状態チェック
  useEffect(() => {
    const init = async () => {
      try {
        await initializeLiff();

        const loggedIn = isLoggedIn();
        console.log('isLoggedIn:', loggedIn);

        if (loggedIn) {
          const profile = await getProfile();
          setUser({
            lineUserId: profile?.userId ?? '',
            displayName: profile?.displayName ?? '',
            pictureUrl: profile?.pictureUrl,
          });
          setCurrentState('form');
        } else {
          setCurrentState('login');
        }
      } catch (error) {
        console.error('LIFF init error:', error);
        setCurrentState('login');
      }
    };
    init();
    
    // データ監視を開始
    startDataMonitoring();
  }, []);

  // LINEログインボタン押下時の処理
  const handleLineLogin = () => {
    if (!isLoggedIn()) {
      login(); // LIFFのlogin()はリダイレクトするため、この後の処理は不要
    }
  };

  // ログイン成功時に呼ぶ（LoginScreenのonLoginに渡す）
  const handleLogin = () => {
    // LIFFのログイン後はリダイレクトされてこの処理は通常呼ばれないが、
    // 万が一手動で呼ぶ場合の保険として残す
    setCurrentState('form');
  };

  const handleFormSubmit = async (data: DogFormData) => {
    setFormData(data);
    setCurrentState('processing');
    
    const startTime = Date.now();
    
    try {
      // 1. 分析用ログ記録（予測開始）
      let logId: string | null = null;
      if (user) {
        logPredictionStart(data, user);
        
        // LIFF互換API経由でデータ保存を試行
        try {
          const logData = {
            line_user_id: user.lineUserId,
            display_name: user.displayName,
            purchase_source: data.purchaseSource,
            has_purchase_experience: data.hasPurchaseExperience,
            breed: data.breed,
            gender: data.gender,
            birth_date: data.birthDate,
            current_weight: Number(data.currentWeight),
            birth_weight: data.birthWeight ? Number(data.birthWeight) : null,
            mother_adult_weight: data.motherAdultWeight ? Number(data.motherAdultWeight) : null,
            father_adult_weight: data.fatherAdultWeight ? Number(data.fatherAdultWeight) : null,
          };
          logId = await saveDataWithFallback(logData);
          setCurrentLogId(logId);
          if (logId) {
            console.log('✅ Data saved successfully with ID:', logId);
          }
        } catch (saveError) {
          console.warn('All save methods failed:', saveError);
        }
      }

      // 2. AI予測を実行
      const predictionResult = await predictDogGrowthWithGemini(data);
      
      // 3. 分析用ログ記録（予測完了）
      const processingTime = Date.now() - startTime;
      logPredictionComplete(predictionResult.predictedWeight, processingTime);
      
      // データベースに予測結果を保存
      console.log('🔍 予測体重保存処理開始:', { logId, predictedWeight: predictionResult.predictedWeight });
      
      if (logId) {
        // logIdの形式を確認
        const cleanLogId = logId.startsWith('supabase-') ? logId.replace('supabase-', '') : logId;
        console.log('🔍 Clean log ID:', cleanLogId);
        
        try {
          await updatePredictionCompletion(cleanLogId, predictionResult.predictedWeight);
          console.log('✅ Prediction weight saved to database');
          
          // 保存確認
          setTimeout(async () => {
            const verification = await verifyPredictionWeightSaved(cleanLogId);
            if (!verification.saved) {
              console.warn('⚠️ 予測体重が正しく保存されていません');
            } else {
              console.log('✅ 予測体重保存確認完了:', verification.value);
            }
          }, 1000);
        } catch (dbError) {
          console.warn('Database prediction completion failed:', dbError);
          // フォールバック: ローカルストレージに保存
          try {
            const completionData = {
              id: logId,
              predicted_weight: predictionResult.predictedWeight,
              prediction_completed_at: new Date().toISOString(),
              processing_time_ms: processingTime
            };
            const localCompletions = JSON.parse(localStorage.getItem('prediction_completions') || '[]');
            localCompletions.push(completionData);
            localStorage.setItem('prediction_completions', JSON.stringify(localCompletions));
            console.log('✅ Prediction completion recorded locally as fallback');
          } catch (localError) {
            console.warn('Local completion storage also failed:', localError);
          }
        }
      } else if (logId) {
        // フォールバック保存の場合はローカルストレージのみ
        try {
          const completionData = {
            id: logId,
            predicted_weight: predictionResult.predictedWeight,
            prediction_completed_at: new Date().toISOString(),
            processing_time_ms: processingTime
          };
          const localCompletions = JSON.parse(localStorage.getItem('prediction_completions') || '[]');
          localCompletions.push(completionData);
          localStorage.setItem('prediction_completions', JSON.stringify(localCompletions));
          console.log('✅ Prediction completion recorded locally (fallback source)');
        } catch (localError) {
          console.warn('Local completion storage failed:', localError);
        }
      }

      setResult(predictionResult);
      setCurrentState('result');
    } catch (error) {
      console.error('Prediction failed:', error);
      // エラー時はフォーム画面に戻る
      setCurrentState('form');
      alert('予測の生成に失敗しました。入力内容をご確認の上、再度お試しください。');
    }
  };

  const handleReset = () => {
    setFormData(null);
    setResult(null);
    setCurrentLogId(null);
    setCurrentState('form');
  };

  const handleSatisfactionRating = async (rating: 'yes' | 'no') => {
    // 分析用ログ記録
    logSatisfactionRating(rating);
    console.log('Satisfaction rating recorded:', rating);
    
    // Supabaseデータベースに満足度評価を更新
    if (currentLogId && !currentLogId.startsWith('local-') && !currentLogId.startsWith('line-') && !currentLogId.startsWith('sheets-')) {
      try {
        const success = await updateSatisfactionRating(currentLogId, rating);
        if (success) {
          console.log('✅ Satisfaction rating updated in Supabase');
        } else {
          console.warn('❌ Failed to update satisfaction rating in Supabase');
        }
      } catch (updateError) {
        console.warn('❌ Satisfaction rating update error:', updateError);
      }
    }
    
    // 満足度評価をローカルストレージに記録（フォールバック）
    if (currentLogId) {
      try {
        const satisfactionData = {
          id: currentLogId,
          satisfaction_rating: rating,
          satisfaction_rated_at: new Date().toISOString()
        };
        const localSatisfactions = JSON.parse(localStorage.getItem('satisfaction_ratings') || '[]');
        localSatisfactions.push(satisfactionData);
        localStorage.setItem('satisfaction_ratings', JSON.stringify(localSatisfactions));
        console.log('✅ Satisfaction rating recorded locally');
      } catch (localError) {
        console.warn('Local satisfaction storage failed:', localError);
      }
    }
  };

  const handleShowTerms = () => {
    setCurrentState('terms');
  };

  const handleShowPrivacy = () => {
    setCurrentState('privacy');
  };

  const handleBackToLogin = () => {
    setCurrentState('login');
  };

  // Handle navigation for terms and privacy links
  React.useEffect(() => {
    const handleNavigation = (e: PopStateEvent) => {
      const path = window.location.pathname;
      if (path === '/terms') {
        setCurrentState('terms');
      } else if (path === '/privacy') {
        setCurrentState('privacy');
      }
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Handle direct navigation to terms/privacy
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/terms') {
      setCurrentState('terms');
    } else if (path === '/privacy') {
      setCurrentState('privacy');
    }
  }, []);

  switch (currentState) {
    case 'login':
      return <LoginScreen onLogin={handleLineLogin} onNavigateToForm={() => setCurrentState('form')} />;
    case 'form':
      return <FormScreen onSubmit={handleFormSubmit} />;
    case 'processing':
      return <ProcessingScreen />;
    case 'result':
      return result && formData ? (
        <ResultScreen 
          result={result} 
          formData={formData} 
          onReset={handleReset}
          onSatisfactionRating={handleSatisfactionRating}
        />
      ) : null;
    case 'terms':
      return <TermsPage onBack={handleBackToLogin} />;
    case 'privacy':
      return <PrivacyPage onBack={handleBackToLogin} />;
    default:
      return <UndoRedoDemo />;
  }
}

export default App;
