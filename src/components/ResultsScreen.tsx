import React, { useState } from 'react';
import { DogData, PredictionResult } from '../types';
import { ArrowLeft, Star, TrendingUp, Heart, CreditCard, X } from 'lucide-react';
import PaymentScreen from './PaymentScreen';
import PremiumFeatures from './PremiumFeatures';

interface ResultsScreenProps {
  dogData: DogData;
  result: PredictionResult;
  onReset: () => void;
  isPremiumUnlocked: boolean;
  onPremiumPurchase: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ 
  dogData, 
  result, 
  onReset, 
  isPremiumUnlocked,
  onPremiumPurchase 
}) => {
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('');

  const handlePremiumClick = (feature: string) => {
    if (isPremiumUnlocked) {
      setSelectedFeature(feature);
      setShowPremiumFeatures(true);
    } else {
      setSelectedFeature(feature);
      setShowPaymentScreen(true);
    }
  };

  const handlePaymentSuccess = () => {
    onPremiumPurchase();
    setShowPaymentScreen(false);
    setSelectedFeature('');
    setShowPremiumFeatures(true);
  };

  if (showPaymentScreen) {
    return (
      <PaymentScreen
        selectedFeature={selectedFeature}
        onBack={() => setShowPaymentScreen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  if (showPremiumFeatures) {
    return (
      <PremiumFeatures
        selectedFeature={selectedFeature}
        dogData={dogData}
        result={result}
        onBack={() => setShowPremiumFeatures(false)}
        onReset={onReset}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">成犬時の予想</h2>
      </div>
      
      {/* Main prediction image and info */}
      <div className="p-6">
        <div className="relative mb-6">
          {/* Image container with ruler overlay */}
          <div className="relative bg-gray-50 rounded-xl overflow-hidden">
            <img 
              src="/public/image copy copy copy.png"
              alt="成犬時の予測画像" 
              className="w-full h-auto object-contain rounded-xl max-h-96"
            />
            
            {/* Ruler overlay - horizontal */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">0cm</span>
                  <span className="text-sm font-semibold">25cm</span>
                </div>
                <div className="relative h-2 bg-white bg-opacity-30 rounded">
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="flex-1 border-r border-white border-opacity-50 last:border-r-0">
                        <div className="h-full bg-white bg-opacity-60"></div>
                      </div>
                    ))}
                  </div>
                  {/* Measurement marks */}
                  <div className="absolute -top-1 left-0 w-0.5 h-4 bg-white"></div>
                  <div className="absolute -top-1 right-0 w-0.5 h-4 bg-white"></div>
                </div>
              </div>
            </div>
            
            {/* Size reference in corner */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1">
              <div className="w-6 h-0.5 bg-white"></div>
              <span>実寸大</span>
            </div>
          </div>
        </div>
        
        {/* Prediction stats */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">予測成犬体重：2.5kg〜3.2kg</div>
              <div className="text-sm text-gray-600 mt-1">現在の体重から予測</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-800">18cm〜23cm</div>
                <div className="text-sm text-gray-600">予測成犬体高（肩まで）</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">25cm〜30cm</div>
                <div className="text-sm text-gray-600">体長（鼻先〜尾のつけ根）</div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <div className="text-lg font-semibold text-gray-700">
              小型犬
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-600 leading-relaxed">
            注：表示される情報は、今後の健康・成長を保証するものではありません。
          </p>
        </div>

        {/* Premium features */}
        <div className="space-y-3 mb-6">
          <button 
            onClick={() => handlePremiumClick('体重診断（BCS）')}
            className={`w-full py-4 px-6 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2 ${
              isPremiumUnlocked 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black hover:from-yellow-500 hover:to-orange-500' 
                : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black hover:from-yellow-500 hover:to-orange-500'
            }`}
          >
            <Star className="w-5 h-5" />
            <span>体重診断（BCS）はこちら</span>
          </button>
          
          <button 
            onClick={() => handlePremiumClick('追加アドバイス')}
            className={`w-full py-4 px-6 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2 ${
              isPremiumUnlocked 
                ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500' 
                : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>追加のアドバイスはこちら</span>
          </button>
          
          <div>
            <button 
              onClick={() => handlePremiumClick('精度向上')}
              className={`w-full py-4 px-6 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2 ${
                isPremiumUnlocked 
                  ? 'bg-gradient-to-r from-green-400 to-teal-400 text-white hover:from-green-500 hover:to-teal-500' 
                  : 'bg-gradient-to-r from-green-400 to-teal-400 text-white hover:from-green-500 hover:to-teal-500'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>精度を上げるにはこちら</span>
            </button>
            <p className="text-xs text-gray-500 mt-2 px-2">
              ※父母の情報、血統書、現在の食事内容など追加情報の入力が必要です
            </p>
          </div>
        </div>
        
        {/* Back button */}
        <button
          onClick={onReset}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>もう一度予測する</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;