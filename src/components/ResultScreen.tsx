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

  const handleSatisfactionRating = (rating: 'yes' | 'no') => {
    setSatisfactionRating(rating);
    if (onSatisfactionRating) {
      onSatisfactionRating(rating);
    }
  };

  const renderWeightEvaluation = () => {
    const evaluation = result.weightEvaluation;
    
    const getGradeColor = (grade: string) => {
      switch (grade) {
        case 'A': return 'bg-green-500';
        case 'B': return 'bg-blue-500';
        case 'C': return 'bg-yellow-500';
        case 'D': return 'bg-orange-500';
        case 'E': return 'bg-red-500';
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
            <span>E</span>
            <span>A</span>
            <span>E</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          <div className="p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">E</div>
            <div className="text-red-600">痩せすぎ</div>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <div className="font-semibold text-orange-700">D</div>
            <div className="text-orange-600">やや痩せ</div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-700">A</div>
            <div className="text-green-600">理想的</div>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <div className="font-semibold text-orange-700">D</div>
            <div className="text-orange-600">やや太り</div>
          </div>
          <div className="p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-700">E</div>
            <div className="text-red-600">太りすぎ</div>
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
                />
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
                      <div className="absolute -top-1 left-0 w-0.5 h-4 bg-white"></div>
                      <div className="absolute -top-1 right-0 w-0.5 h-4 bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Predicted Weight */}
            <div className="text-center bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                予測体重: {result.predictedWeight} kg
              </div>
              <div className="text-sm text-gray-600">
                現在の体重 {formData.currentWeight}kg から予測
              </div>
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
                          <h4 className="font-semibold text-yellow-800 mb-2">使用前注意：</h4>
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
                              {(() => {
                                const currentWeight = Number(formData.currentWeight);
                                if (currentWeight) {
                                  const min = Math.max(0.1, currentWeight * 0.8);
                                  const max = currentWeight * 1.2;
                                  return `${min.toFixed(1)}〜${max.toFixed(1)}kg`;
                                }
                                return '計算中...';
                              })()}
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

                    {/* Satisfaction Survey */}
                    <div className="bg-gray-50 rounded-lg p-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4 text-center">この結果に満足頂けましたか？</h4>
                      <div className="flex justify-center space-x-4">
                        <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                          <span>👍</span>
                          <span>はい</span>
                        </button>
                        <button className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                          <span>👎</span>
                          <span>いいえ</span>
                        </button>
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
                    {/* Initial Costs */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                        <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
                        初期費用（お迎え時）
                      </h4>
                      <div className="text-sm text-purple-700 mb-3">ケージ、食器、トイレなど</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between py-1 border-b border-purple-200">
                          <span>ケージ・サークル</span>
                          <span className="font-medium">¥8,000 - ¥20,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-purple-200">
                          <span>食器・水入れ</span>
                          <span className="font-medium">¥2,000 - ¥5,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-purple-200">
                          <span>トイレ・トレー</span>
                          <span className="font-medium">¥3,000 - ¥8,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-purple-200">
                          <span>ベッド・クッション</span>
                          <span className="font-medium">¥3,000 - ¥10,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-purple-200">
                          <span>首輪・リード</span>
                          <span className="font-medium">¥2,000 - ¥6,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-purple-200">
                          <span>おもちゃ</span>
                          <span className="font-medium">¥2,000 - ¥5,000</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <div className="flex justify-between font-semibold text-purple-800">
                          <span>合計目安</span>
                          <span>¥20,000 - ¥54,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Costs */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
                        毎月の費用
                      </h4>
                      <div className="text-sm text-blue-700 mb-3">フード、おやつ、ペットシーツ、ペット保険</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-blue-200">
                          <span>フード</span>
                          <span className="font-medium">¥3,000 - ¥8,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-blue-200">
                          <span>おやつ</span>
                          <span className="font-medium">¥1,000 - ¥3,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-blue-200">
                          <span>ペットシーツ</span>
                          <span className="font-medium">¥1,500 - ¥3,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-blue-200">
                          <span>ペット保険</span>
                          <span className="font-medium">¥2,000 - ¥5,000</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex justify-between font-semibold text-blue-800">
                          <span>月額合計目安</span>
                          <span>¥7,500 - ¥19,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Health Costs */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                        <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm mr-2">3</span>
                        ワクチン・健康診断
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-green-200">
                          <span>混合ワクチン（年1回）</span>
                          <span className="font-medium">¥5,000 - ¥8,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-green-200">
                          <span>狂犬病ワクチン（年1回）</span>
                          <span className="font-medium">¥3,000 - ¥4,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-green-200">
                          <span>健康診断（年1-2回）</span>
                          <span className="font-medium">¥5,000 - ¥15,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-green-200">
                          <span>フィラリア予防（年間）</span>
                          <span className="font-medium">¥8,000 - ¥15,000</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="flex justify-between font-semibold text-green-800">
                          <span>年間合計目安</span>
                          <span>¥21,000 - ¥42,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Medical Costs */}
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                        <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm mr-2">4</span>
                        不定期の医療費
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-orange-200">
                          <span>一般的な診察</span>
                          <span className="font-medium">¥2,000 - ¥5,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-orange-200">
                          <span>去勢・避妊手術</span>
                          <span className="font-medium">¥20,000 - ¥50,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-orange-200">
                          <span>歯科治療</span>
                          <span className="font-medium">¥10,000 - ¥30,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-orange-200">
                          <span>緊急治療・手術</span>
                          <span className="font-medium">¥50,000 - ¥200,000+</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <p className="text-xs text-orange-700">
                          ※ 病気や怪我の内容により費用は大きく変動します。ペット保険の加入をおすすめします。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Satisfaction Rating */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  予測結果にご満足いただけましたか？
                </h3>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => handleSatisfactionRating('yes')}
                    className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                      satisfactionRating === 'yes'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white text-green-600 border border-green-300 hover:bg-green-50'
                    }`}
                  >
                    はい
                  </button>
                  <button
                    onClick={() => handleSatisfactionRating('no')}
                    className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                      satisfactionRating === 'no'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                    }`}
                  >
                    いいえ
                  </button>
                </div>
                {satisfactionRating && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      {satisfactionRating === 'yes' 
                        ? 'ありがとうございます！フィードバックを保存しました。' 
                        : 'フィードバックをありがとうございます。今後の改善に活用させていただきます。'
                      }
                    </p>
                  </div>
                )}
              </div>
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