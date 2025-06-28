import React, { useState } from 'react';
import { ArrowLeft, Star, Heart, TrendingUp, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import { DogData, PredictionResult } from '../types';

interface PremiumFeaturesProps {
  selectedFeature: string;
  dogData: DogData;
  result: PredictionResult;
  onBack: () => void;
  onReset: () => void;
}

const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({
  selectedFeature,
  dogData,
  result,
  onBack,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState(selectedFeature || '体重診断（BCS）');
  const [selectedAdviceType, setSelectedAdviceType] = useState('健康管理');
  const [additionalInfo, setAdditionalInfo] = useState({
    fatherBreed: '',
    motherBreed: '',
    pedigree: '',
    currentFood: '',
    feedingAmount: '',
    exerciseTime: '',
    healthHistory: ''
  });
  const [isRepredicting, setIsRepredicting] = useState(false);
  const [showImprovedResult, setShowImprovedResult] = useState(false);

  const handleReprediction = () => {
    setIsRepredicting(true);
    setTimeout(() => {
      setIsRepredicting(false);
      setShowImprovedResult(true);
    }, 5000);
  };

  const renderBCSFeature = () => {
    const bcsScore = 5; // Mock BCS score
    const isHealthy = bcsScore >= 4 && bcsScore <= 6;
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            体重診断（BCS）結果
          </h3>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-800 mb-2">{bcsScore}/9</div>
            <div className="text-sm text-gray-600">ボディ・コンディション・スコア</div>
          </div>

          {/* BCS Visual Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>痩せすぎ</span>
              <span>理想</span>
              <span>太りすぎ</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 relative">
              <div className="bg-gradient-to-r from-red-400 via-green-400 to-red-400 h-4 rounded-full"></div>
              <div 
                className="absolute top-0 w-3 h-4 bg-blue-600 rounded-full transform -translate-x-1/2"
                style={{ left: `${(bcsScore / 9) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>5</span>
              <span>9</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg flex items-start space-x-3 ${
            isHealthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {isHealthy ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div>
              <div className={`font-semibold ${isHealthy ? 'text-green-800' : 'text-red-800'}`}>
                {isHealthy ? '理想的な体重です' : '体重管理が必要です'}
              </div>
              <p className={`text-sm mt-1 ${isHealthy ? 'text-green-700' : 'text-red-700'}`}>
                {isHealthy 
                  ? '現在の体重は健康的な範囲内です。この状態を維持するため、適切な食事と運動を続けてください。'
                  : '現在の体重は理想的な範囲から外れています。獣医師に相談し、食事量や運動量の調整を検討してください。'
                }
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">おすすめサプリメント</h4>
            <p className="text-sm text-blue-700">
              関節の健康維持に「グルコサミン・コンドロイチン」、毛艶改善に「オメガ3脂肪酸」のサプリメントをおすすめします。
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderAdviceFeature = () => {
    const adviceTypes = [
      '健康管理',
      '生涯費用シミュレーション',
      'しつけアドバイス',
      '食事管理'
    ];

    const getAdviceContent = (type: string) => {
      switch (type) {
        case '健康管理':
          return {
            title: '健康管理アドバイス',
            content: `
${dogData.breed}の健康管理において重要なポイント：

• 定期健康診断：年1-2回の獣医師による健康チェック
• 予防接種：狂犬病、混合ワクチンの定期接種
• フィラリア予防：月1回の予防薬投与
• デンタルケア：週2-3回の歯磨きで歯周病予防
• 適切な運動：1日30-60分の散歩と遊び時間

特に${dogData.breed}は関節疾患に注意が必要です。階段の上り下りを控え、滑りやすい床にはマットを敷くことをおすすめします。
            `
          };
        case '生涯費用シミュレーション':
          return {
            title: '生涯費用シミュレーション',
            content: `
${dogData.breed}の生涯費用概算（15年間）：

• 初期費用：約10-15万円
  - ワクチン、去勢・避妊手術、基本用品

• 年間維持費：約25-35万円
  - フード代：月1-2万円
  - 医療費：年5-10万円
  - トリミング：年6-12万円
  - その他用品：年3-5万円

• 生涯総額：約400-550万円

※病気や怪我の治療費は別途必要になる場合があります。ペット保険の加入もご検討ください。
            `
          };
        case 'しつけアドバイス':
          return {
            title: 'しつけアドバイス',
            content: `
${dogData.breed}のしつけポイント：

• 基本コマンド
  - 「おすわり」「まて」「おいで」を最優先
  - 短時間（5-10分）の集中トレーニング
  - ご褒美は食べ物とほめ言葉を併用

• トイレトレーニング
  - 決まった場所にトイレシートを設置
  - 成功時は必ずほめる
  - 失敗しても叱らない

• 社会化
  - 生後3-14週が重要な社会化期
  - 様々な人、動物、環境に慣れさせる
  - パピークラスへの参加を推奨

${dogData.breed}は知能が高く、一貫したトレーニングで良い結果が期待できます。
            `
          };
        case '食事管理':
          return {
            title: '食事管理アドバイス',
            content: `
${dogData.breed}の食事管理：

• 年齢別給餌量（現在${dogData.ageMonths}ヶ月）
  - 子犬期：体重1kgあたり50-100g/日
  - 成犬期：体重1kgあたり30-50g/日
  - シニア期：体重1kgあたり25-40g/日

• 食事回数
  - 生後6ヶ月まで：1日3-4回
  - 6ヶ月-1歳：1日2-3回
  - 成犬：1日2回

• 注意すべき食材
  - チョコレート、玉ねぎ、ぶどうは絶対禁止
  - 人間の食べ物は基本的に与えない
  - 塩分、糖分の多い食品は避ける

現在の体重${dogData.currentWeight}gを考慮すると、1日の給餌量は約${Math.round(dogData.currentWeight * 0.05)}gが目安です。
            `
          };
        default:
          return { title: '', content: '' };
      }
    };

    const currentAdvice = getAdviceContent(selectedAdviceType);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Heart className="w-5 h-5 text-pink-500 mr-2" />
            追加アドバイス
          </h3>
          
          <div className="grid grid-cols-2 gap-2 mb-6">
            {adviceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedAdviceType(type)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  selectedAdviceType === type
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-purple-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">{currentAdvice.title}</h4>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {currentAdvice.content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAccuracyFeature = () => {
    if (isRepredicting) {
      return (
        <div className="bg-white rounded-xl p-8 flex flex-col items-center">
          <div className="mb-6">
            <div className="paw-loader-large">
              <div className="paw-print-large paw-1">🐾</div>
              <div className="paw-print-large paw-2">🐾</div>
              <div className="paw-print-large paw-3">🐾</div>
              <div className="paw-print-large paw-4">🐾</div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">再予測中...</h3>
          <p className="text-gray-600 text-center">
            追加情報を元により精密な予測を行っています
          </p>
        </div>
      );
    }

    if (showImprovedResult) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              精度向上後の予測結果
            </h3>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">予測精度</span>
                <span className="text-sm font-semibold text-green-600">85% → 94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-gray-800">{result.predictedWeight + 150}g</div>
                <div className="text-sm text-gray-600">修正後予想体重</div>
                <div className="text-xs text-green-600">+150g</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-gray-800">{result.predictedLength + 2}cm</div>
                <div className="text-sm text-gray-600">修正後予想体長</div>
                <div className="text-xs text-green-600">+2cm</div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">追加分析結果</h4>
              <p className="text-sm text-blue-700">
                父母の血統情報と現在の食事内容を考慮した結果、当初の予測より若干大きめに成長する可能性が高いことが判明しました。
                特に骨格の発達が良好で、健康的な成長が期待できます。
              </p>
            </div>

            <button
              onClick={onReset}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>新しい予測を開始</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            予測精度向上
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            以下の追加情報を入力することで、より精密な成長予測が可能になります。
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">父親の犬種</label>
                <input
                  type="text"
                  value={additionalInfo.fatherBreed}
                  onChange={(e) => setAdditionalInfo(prev => ({ ...prev, fatherBreed: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例：トイプードル"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">母親の犬種</label>
                <input
                  type="text"
                  value={additionalInfo.motherBreed}
                  onChange={(e) => setAdditionalInfo(prev => ({ ...prev, motherBreed: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例：トイプードル"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">血統書情報</label>
              <textarea
                value={additionalInfo.pedigree}
                onChange={(e) => setAdditionalInfo(prev => ({ ...prev, pedigree: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
                placeholder="血統書に記載されている情報があれば入力してください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">現在の食事内容</label>
              <input
                type="text"
                value={additionalInfo.currentFood}
                onChange={(e) => setAdditionalInfo(prev => ({ ...prev, currentFood: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例：ロイヤルカナン パピー用"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">1日の食事量</label>
                <input
                  type="text"
                  value={additionalInfo.feedingAmount}
                  onChange={(e) => setAdditionalInfo(prev => ({ ...prev, feedingAmount: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例：50g × 3回"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">1日の運動時間</label>
                <input
                  type="text"
                  value={additionalInfo.exerciseTime}
                  onChange={(e) => setAdditionalInfo(prev => ({ ...prev, exerciseTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例：散歩30分 + 遊び15分"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">既往歴・健康状態</label>
              <textarea
                value={additionalInfo.healthHistory}
                onChange={(e) => setAdditionalInfo(prev => ({ ...prev, healthHistory: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
                placeholder="過去の病気や現在の健康状態について"
              />
            </div>
          </div>

          <button
            onClick={handleReprediction}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-xl font-bold hover:from-green-600 hover:to-teal-700 transition-all mt-6"
          >
            追加情報で再予測する
          </button>
        </div>
      </div>
    );
  };

  const renderFeatureContent = () => {
    switch (activeTab) {
      case '体重診断（BCS）':
        return renderBCSFeature();
      case '追加アドバイス':
        return renderAdviceFeature();
      case '精度向上':
        return renderAccuracyFeature();
      default:
        return renderBCSFeature();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100 flex items-center">
        <button
          onClick={onBack}
          className="mr-3 p-1 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">有料機能</h2>
        <div className="ml-auto bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
          解放済み
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex space-x-2">
          {['体重診断（BCS）', '追加アドバイス', '精度向上'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderFeatureContent()}
      </div>
    </div>
  );
};

export default PremiumFeatures;