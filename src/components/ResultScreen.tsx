import React, { useState } from 'react';
import { PredictionResult, DogFormData } from '../types';
import { ChevronDown, ChevronUp, RotateCcw, Heart, TrendingUp, DollarSign } from 'lucide-react';

interface ResultScreenProps {
  result: PredictionResult;
  formData: DogFormData;
  onReset: () => void;
  onSatisfactionRating?: (rating: 'yes' | 'no') => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, formData, onReset, onSatisfactionRating }) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [satisfactionRating, setSatisfactionRating] = useState<'yes' | 'no' | null>(null);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSatisfactionClick = (rating: 'yes' | 'no') => {
    setSatisfactionRating(rating);
    onSatisfactionRating?.(rating);
  };

  const renderWeightEvaluation = () => {
    const evaluation = result.weightEvaluation;
    
    const getGradeColor = (grade: string) => {
      switch (grade) {
        case 'A': return 'bg-red-500';    // 痩せすぎ
        case 'B': return 'bg-orange-500'; // やや痩せ気味
        case 'C': return 'bg-green-500';  // 適正範囲内
        case 'D': return 'bg-orange-500'; // やや重め
        case 'E': return 'bg-red-500';    // 太り気味
        default: return 'bg-gray-500';
      }
    };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-2">
            体重評価: {evaluation.grade}ランク
          </div>
          <div className="text-sm text-gray-600">
            {evaluation.description}
          </div>
        </div>
        
        <div className="relative">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>痩せすぎ</span>
            <span>理想的</span>
            <span>太りすぎ</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 relative">
            <div className="bg-gradient-to-r from-red-400 via-green-400 to-red-400 h-6 rounded-full"></div>
            <div 
              className={`absolute top-0 w-4 h-6 ${getGradeColor(evaluation.grade)} rounded-full transform -translate-x-1/2 flex items-center justify-center`}
              style={{ left: `${(['underweight', 'slightly_underweight', 'ideal', 'slightly_overweight', 'overweight'].indexOf(evaluation.category) + 1) * 20}%` }}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>A</span>
            <span>C</span>
            <span>E</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          <div className="p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">A</div>
            <div className="text-red-600">痩せすぎ</div>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <div className="font-semibold text-orange-700">B</div>
            <div className="text-orange-600">やや痩せ気味</div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-700">C</div>
            <div className="text-green-600">適正範囲内</div>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <div className="font-semibold text-orange-700">D</div>
            <div className="text-orange-600">やや重め</div>
          </div>
          <div className="p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">E</div>
            <div className="text-red-600">太り気味</div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 px-6 py-4">
            <h1 className="text-xl font-bold text-white">成長予測結果</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* Prediction Image */}
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={result.imageUrl}
                  alt="成犬時の予測画像"
                  className="w-full max-w-sm h-64 object-cover rounded-xl shadow-lg"
                  onLoad={() => console.log('✅ 画像読み込み成功:', result.imageUrl)}
                  onError={(e) => {
                    console.error('❌ 画像読み込み失敗:', result.imageUrl);
                    console.error('エラー詳細:', e);
                    // フォールバック画像を設定
                    (e.target as HTMLImageElement).src = '/default-dog.svg';
                  }}
                />
              </div>
              
            </div>

            {/* Predicted Measurements */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">成犬時の予測サイズ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">
                    {result.predictedWeight} kg
                  </div>
                  <div className="text-sm text-gray-600">体重</div>
                  <div className="text-xs text-gray-500">
                    現在: {formData.currentWeight}kg
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">
                    {result.predictedLength} cm
                  </div>
                  <div className="text-sm text-gray-600">体長</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">
                    {result.predictedHeight} cm
                  </div>
                  <div className="text-sm text-gray-600">体高</div>
                </div>
              </div>
            </div>

            {/* Satisfaction Survey */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-800 mb-4 text-center">サービスにご満足いただけましたか？</h4>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => handleSatisfactionClick('yes')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    satisfactionRating === 'yes' 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  disabled={satisfactionRating !== null}
                >
                  <span>👍</span>
                  <span>はい</span>
                </button>
                <button 
                  onClick={() => handleSatisfactionClick('no')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    satisfactionRating === 'no' 
                      ? 'bg-red-600 text-white shadow-lg' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  disabled={satisfactionRating !== null}
                >
                  <span>👎</span>
                  <span>いいえ</span>
                </button>
              </div>
              {satisfactionRating && (
                <div className="mt-4 text-center">
                  <p className={`text-sm font-medium ${
                    satisfactionRating === 'yes' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {satisfactionRating === 'yes' 
                      ? '✅ ありがとうございます！フィードバックを保存しました。' 
                      : '📝 フィードバックをありがとうございます。今後の改善に活用させていただきます。'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Weight Evaluation Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('weight')}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 flex items-center justify-between hover:from-yellow-100 hover:to-orange-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-800">適正体重診断・評価</span>
                </div>
                {openSections.weight ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openSections.weight && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="space-y-6">
                    {/* Usage Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <div className="text-yellow-600 font-bold text-sm">⚠️</div>
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-2">使用上の注意：</h4>
                          <p className="text-yellow-700 text-sm leading-relaxed">
                            本サービスは、子犬の購入を検討されている方への参考情報の提供を目的としており、犬種・生後日数・体重等に基づく簡易的な目安を提示するものです。獣医師による診断や医療的判断を行うものではありません。正確な健康状態の評価が必要な場合は、必ず獣医師にご相談ください。
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Current Weight Check */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-4">現在の体重チェック：</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-sm text-gray-600">犬種：</span>
                            <span className="font-medium text-gray-800">{formData.breed || 'ミックス'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-sm text-gray-600">生後日数：</span>
                            <span className="font-medium text-gray-800">
                              {(() => {
                                if (formData.birthDate) {
                                  const birthDate = new Date(formData.birthDate);
                                  const today = new Date();
                                  const diffTime = Math.abs(today.getTime() - birthDate.getTime());
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  return `${diffDays}日`;
                                }
                                return '未設定';
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-sm text-gray-600">適正体重範囲：</span>
                            <span className="font-medium text-gray-800">
                              {result.weightEvaluation.appropriateWeightRange.min.toFixed(2)}〜{result.weightEvaluation.appropriateWeightRange.max.toFixed(2)}kg
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weight Evaluation Display */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      {renderWeightEvaluation()}
                    </div>

                    {/* Current Weight & Judgment */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-blue-800 mb-2">現在の体重：</h4>
                          <div className="text-2xl font-bold text-blue-900">
                            {formData.currentWeight} kg
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800 mb-2">判定：</h4>
                          <div className="flex items-center space-x-2">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-12 h-12 ${result.weightEvaluation.grade === 'A' ? 'bg-green-500' : result.weightEvaluation.grade === 'B' ? 'bg-blue-500' : result.weightEvaluation.grade === 'C' ? 'bg-yellow-500' : result.weightEvaluation.grade === 'D' ? 'bg-orange-500' : 'bg-red-500'} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                                  {result.weightEvaluation.grade}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800">{result.weightEvaluation.description}</div>
                                  <div className="text-sm text-gray-600">判定カテゴリ</div>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {result.weightEvaluation.advice}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              )}
            </div>

            {/* Health Advice */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('health')}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-between hover:from-green-100 hover:to-emerald-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-800">健康管理のアドバイス</span>
                </div>
                {openSections.health ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openSections.health && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {result.advice.health}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Training Advice */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('training')}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between hover:from-blue-100 hover:to-indigo-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">しつけのアドバイス</span>
                </div>
                {openSections.training ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openSections.training && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {result.advice.training}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cost Simulation */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('cost')}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-between hover:from-purple-100 hover:to-pink-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-800">費用のシミュレーション</span>
                </div>
                {openSections.cost ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openSections.cost && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="space-y-6">
                    {result.costSimulation.categories.map((category, index) => {
                      const colorClasses = [
                        { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200", button: "bg-purple-600" },
                        { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", button: "bg-blue-600" },
                        { bg: "bg-green-50", text: "text-green-800", border: "border-green-200", button: "bg-green-600" },
                        { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200", button: "bg-orange-600" }
                      ];
                      const colors = colorClasses[index % colorClasses.length];
                      
                      return (
                        <div key={category.id} className={`${colors.bg} rounded-lg p-4`}>
                          <h4 className={`font-semibold ${colors.text} mb-3 flex items-center`}>
                            <span className={`w-6 h-6 ${colors.button} text-white rounded-full flex items-center justify-center text-sm mr-2`}>
                              {category.icon}
                            </span>
                            {category.title}
                          </h4>
                          <div className={`text-sm ${colors.text.replace('800', '700')} mb-3`}>
                            {category.description}
                          </div>
                          <div className={`${category.items.length > 4 ? 'grid grid-cols-2 gap-3' : 'space-y-2'} text-sm`}>
                            {category.items.map((item, itemIndex) => (
                              <div key={itemIndex} className={`flex justify-between py-1 border-b ${colors.border}`}>
                                <span>{item.name}</span>
                                <span className="font-medium">{item.cost}</span>
                              </div>
                            ))}
                          </div>
                          {category.total && (
                            <div className={`mt-3 pt-3 border-t ${colors.border}`}>
                              <div className={`flex justify-between font-semibold ${colors.text}`}>
                                <span>{category.id === 'medical' ? '参考価格' : '合計目安'}</span>
                                <span>{category.total}</span>
                              </div>
                            </div>
                          )}
                          {category.id === 'medical' && (
                            <div className={`mt-3 pt-3 border-t ${colors.border}`}>
                              <p className={`text-xs ${colors.text.replace('800', '700')}`}>
                                ※ 病気や怪我の内容により費用は大きく変動します。ペット保険の加入をおすすめします。
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>


            {/* Reset Button */}
            <div className="pt-6">
              <button
                onClick={onReset}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>別の子犬で予測する</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;