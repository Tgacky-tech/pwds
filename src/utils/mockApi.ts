import { DogFormData, PredictionResult } from '../types';

// Mock API call for prediction
export const predictDogGrowth = async (formData: DogFormData): Promise<PredictionResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 8000));

  // Generate mock prediction based on breed type and current weight
  const currentWeight = typeof formData.currentWeight === 'number' ? formData.currentWeight : 1;
  const breedCategory = getBreedCategory(formData);
  
  let predictedWeight: number;
  let bcsPosition: number;

  switch (breedCategory) {
    case 'small':
      predictedWeight = Math.round((currentWeight * 2.5 + Math.random() * 2) * 10) / 10;
      bcsPosition = 5;
      break;
    case 'medium':
      predictedWeight = Math.round((currentWeight * 3.5 + Math.random() * 5) * 10) / 10;
      bcsPosition = 5;
      break;
    case 'large':
      predictedWeight = Math.round((currentWeight * 4.5 + Math.random() * 8) * 10) / 10;
      bcsPosition = 5;
      break;
    default:
      predictedWeight = Math.round((currentWeight * 3 + Math.random() * 3) * 10) / 10;
      bcsPosition = 5;
  }

  return {
    predictedWeight,
    imageUrl: '/public/image copy copy copy copy.png',
    advice: {
      health: generateHealthAdvice(breedCategory, formData.breed || ''),
      training: generateTrainingAdvice(breedCategory, formData.breed || ''),
      cost: generateCostSimulation(breedCategory)
    },
    bcsPosition
  };
};

const getBreedCategory = (formData: DogFormData): 'small' | 'medium' | 'large' => {
  if (formData.breedType === 'purebred' && formData.breed) {
    // This would normally look up the breed in the database
    if (formData.breed.includes('トイ') || formData.breed.includes('チワワ') || formData.breed.includes('ヨーク')) {
      return 'small';
    } else if (formData.breed.includes('柴') || formData.breed.includes('ビーグル') || formData.breed.includes('コーギー')) {
      return 'medium';
    } else if (formData.breed.includes('ゴールデン') || formData.breed.includes('ラブラドール') || formData.breed.includes('シェパード')) {
      return 'large';
    }
  }
  return 'medium'; // Default
};

const generateHealthAdvice = (category: string, breed: string): string => {
  const adviceMap = {
    small: `【膝蓋骨脱臼に注意】
小型犬に多い病気です。階段の上り下りを控え、滑りやすい床にはマットを敷きましょう。
定期的な関節チェックと適度な運動で予防できます。

【歯周病対策】
小型犬は歯が密集しているため歯周病になりやすいです。
週2-3回の歯磨きと、定期的な歯科検診を心がけましょう。`,
    
    medium: `【股関節形成不全に注意】
中型犬に見られる遺伝的疾患です。過度な運動は避け、適正体重を維持しましょう。
症状が見られたら早めに獣医師に相談することが大切です。

【皮膚疾患対策】
定期的なブラッシングと清潔な環境維持が重要です。
アレルギー症状が出た場合は、食事内容の見直しも検討しましょう。`,
    
    large: `【胃捻転に注意】
大型犬特有の緊急疾患です。食後すぐの激しい運動は避け、
一度に大量の食事を与えず、数回に分けて給餌しましょう。

【心疾患対策】
大型犬は心臓への負担が大きいため、定期的な心電図検査を推奨します。
適度な運動と塩分控えめの食事を心がけましょう。`
  };
  
  return adviceMap[category as keyof typeof adviceMap] || adviceMap.medium;
};

const generateTrainingAdvice = (category: string, breed: string): string => {
  const adviceMap = {
    small: `【社会化トレーニング】
生後3ヶ月までの社会化期が重要です。様々な人や音に慣れさせましょう。
小型犬は警戒心が強いため、無理をせず徐々に慣らすことがポイントです。

【吠え癖対策】
小型犬は吠えやすい傾向があります。吠える原因を特定し、
適切な対処法を身につけることで改善できます。`,
    
    medium: `【基本的な服従訓練】
「おすわり」「まて」「おいで」などの基本コマンドを確実に覚えさせましょう。
中型犬は学習能力が高いため、一貫した訓練で良い結果が期待できます。

【運動とメンタルケア】
十分な運動量と知的刺激が必要です。散歩だけでなく、
パズルトイなどを使った頭を使う遊びも取り入れましょう。`,
    
    large: `【力のコントロール】
大型犬は力が強いため、引っ張り癖の矯正が重要です。
リーダーウォークの訓練を幼犬期から始めましょう。

【社会性の育成】
大型犬は存在感があるため、他の犬や人との適切な関わり方を学ばせることが大切です。
パピークラスへの参加を強く推奨します。`
  };
  
  return adviceMap[category as keyof typeof adviceMap] || adviceMap.medium;
};

const generateCostSimulation = (category: string): string => {
  const costMap = {
    small: `【年間費用目安】
1年後: 約25万円（フード代8万円、医療費7万円、その他10万円）
3年後: 約23万円（フード代8万円、医療費5万円、その他10万円）
5年後: 約28万円（フード代8万円、医療費10万円、その他10万円）

※小型犬は医療費が比較的安価ですが、歯科治療費用に注意が必要です。`,
    
    medium: `【年間費用目安】
1年後: 約35万円（フード代12万円、医療費10万円、その他13万円）
3年後: 約32万円（フード代12万円、医療費7万円、その他13万円）
5年後: 約38万円（フード代12万円、医療費13万円、その他13万円）

※中型犬は運動量が多いため、フード代とトリミング代が中程度です。`,
    
    large: `【年間費用目安】
1年後: 約45万円（フード代18万円、医療費12万円、その他15万円）
3年後: 約42万円（フード代18万円、医療費9万円、その他15万円）
5年後: 約50万円（フード代18万円、医療費17万円、その他15万円）

※大型犬は食事量が多く、医療費も高額になる傾向があります。`
  };
  
  return costMap[category as keyof typeof costMap] || costMap.medium;
};