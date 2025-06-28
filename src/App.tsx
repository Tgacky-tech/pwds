import React, { useState, useEffect } from 'react';
import { DogFormData, PredictionResult, User } from './types';
import { predictDogGrowthWithGemini } from './utils/geminiApi';
// import { savePredictionStart, updatePredictionCompletion, saveSatisfactionRating } from './utils/supabaseApi';
import { insertPredictionLog, updatePredictionLogCompletion, updateSatisfactionRating } from './utils/supabaseRestApi';
import { logPredictionStart, logPredictionComplete, logSatisfactionRating } from './utils/analytics';
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
        
        // REST API経由でSupabaseに保存を試行
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
          logId = await insertPredictionLog(logData);
          setCurrentLogId(logId);
          console.log('REST API: Prediction log saved with ID:', logId);
        } catch (restError) {
          console.warn('REST API failed, continuing with console logging only:', restError);
        }
      }

      // 2. AI予測を実行
      const predictionResult = await predictDogGrowthWithGemini(data);
      
      // 3. 分析用ログ記録（予測完了）
      const processingTime = Date.now() - startTime;
      logPredictionComplete(predictionResult.predictedWeight, processingTime);
      
      // REST API経由で予測完了を更新
      if (logId) {
        try {
          await updatePredictionLogCompletion(logId, predictionResult.predictedWeight);
          console.log('REST API: Prediction completion updated');
        } catch (restError) {
          console.warn('REST API completion update failed:', restError);
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
    
    // REST API経由で満足度評価を保存
    if (currentLogId) {
      try {
        await updateSatisfactionRating(currentLogId, rating);
        console.log('REST API: Satisfaction rating saved');
      } catch (restError) {
        console.warn('REST API satisfaction update failed:', restError);
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
