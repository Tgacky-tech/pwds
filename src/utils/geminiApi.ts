import { DogFormData, PredictionResult, WeightEvaluation } from '../types';
import { generateDogImage } from './fluxApi';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

// 犬の成長予測をGemini APIで実行
export const predictDogGrowthWithGemini = async (formData: DogFormData): Promise<PredictionResult> => {
  try {
    // 1. 予測体重とアドバイスを生成
    const predictionData = await generatePredictionData(formData);
    
    // 2. 画像生成用プロンプトを生成
    const imagePrompt = await generateImagePrompt(formData, predictionData.predictedWeight);
    
    // 3. FLUX.1で画像を生成
    console.log('🎨 FLUX.1画像生成開始...');
    const generatedImageUrl = await generateDogImage({
      prompt: imagePrompt,
      breed: formData.breed || 'ミックス',
      gender: formData.gender === 'male' ? 'オス' : 'メス',
      predictedWeight: predictionData.predictedWeight
    });
    
    return {
      predictedWeight: predictionData.predictedWeight,
      imageUrl: generatedImageUrl || '/default-dog.svg', // FLUX.1生成画像、失敗時はフォールバック
      imagePrompt: imagePrompt, // 画像生成用プロンプト
      advice: {
        health: predictionData.healthAdvice,
        training: predictionData.trainingAdvice,
        cost: predictionData.costAdvice
      },
      weightEvaluation: calculateWeightEvaluation(formData, predictionData.predictedWeight)
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('予測の生成に失敗しました。');
  }
};

// メインの予測データ生成
async function generatePredictionData(formData: DogFormData) {
  const prompt = createPredictionPrompt(formData);
  
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API request failed: ${response.statusText}`);
  }

  const data: GeminiResponse = await response.json();
  const result = data.candidates[0].content.parts[0].text;
  
  return parseGeminiResponse(result);
}

// 画像生成用プロンプト生成
async function generateImagePrompt(formData: DogFormData, predictedWeight: number): Promise<string> {
  const prompt = createImagePromptGenerationPrompt(formData, predictedWeight);
  
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Image prompt generation failed: ${response.statusText}`);
  }

  const data: GeminiResponse = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

// 予測プロンプト作成
function createPredictionPrompt(formData: DogFormData): string {
  const birthDate = new Date(formData.birthDate);
  const today = new Date();
  const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const ageInMonths = Math.floor(ageInDays / 30);

  return `
あなたは経験豊富な獣医師兼犬の専門家です。以下の子犬の情報を基に、成犬時の予測と詳細なアドバイスを提供してください。

## 子犬の情報
- 犬種: ${formData.breed || '不明'}
- 性別: ${formData.gender === 'male' ? 'オス' : 'メス'}
- 現在の月齢: ${ageInMonths}ヶ月
- 現在の体重: ${formData.currentWeight}kg
- 購入元: ${formData.purchaseSource === 'petshop' ? 'ペットショップ' : formData.purchaseSource === 'breeder' ? 'ブリーダー' : 'その他'}
- 購入経験: ${formData.hasPurchaseExperience === 'yes' ? 'あり' : 'なし'}
${formData.birthWeight ? `- 出生時体重: ${formData.birthWeight}kg` : ''}
${formData.motherAdultWeight ? `- 母親の成犬時体重: ${formData.motherAdultWeight}kg` : ''}
${formData.fatherAdultWeight ? `- 父親の成犬時体重: ${formData.fatherAdultWeight}kg` : ''}
${formData.pastWeights && formData.pastWeights.length > 0 ? 
  `- 過去の体重記録:\n${formData.pastWeights.map(w => `  ${w.date}: ${w.weight}kg`).join('\n')}` : ''}

## 出力形式（必ずこの形式で回答してください）
JSON形式で以下の情報を提供してください：

{
  "predictedWeight": [成犬時の予測体重（数値）],
  "healthAdvice": "[健康管理に関する具体的なアドバイス（200-300文字）]",
  "trainingAdvice": "[しつけに関する具体的なアドバイス（200-300文字）]",
  "costAdvice": "[費用に関する追加アドバイス（100-150文字）]"
}

## 注意事項
- 予測体重は犬種、現在の体重、月齢、両親の体重を考慮して計算してください
- 健康アドバイスは犬種特有の疾患リスクを含めてください
- しつけアドバイスは犬種の特性と現在の月齢に適したものにしてください
- 費用アドバイスは犬種と予測体重に基づいた注意点を含めてください
- 実用的で具体的なアドバイスを心がけてください
- 体重評価は別システムで自動計算されるため、BCSやその他体重評価は含めないでください
`;
}

// 画像プロンプト生成用プロンプト作成
function createImagePromptGenerationPrompt(formData: DogFormData, predictedWeight: number): string {
  return `
犬種「${formData.breed}」の成犬時の画像を生成するための詳細なプロンプトを作成してください。

## 情報
- 犬種: ${formData.breed}
- 性別: ${formData.gender === 'male' ? 'オス' : 'メス'}
- 予測体重: ${predictedWeight}kg

## 要求事項
- 画像生成AI（DALL-E、Midjourney等）用の英語プロンプトを作成
- 犬種の特徴を正確に反映
- 成犬らしい堂々とした姿勢
- 横向きの全身写真
- 白背景
- 高品質で自然な写真調

プロンプトのみを出力してください（説明文は不要）。
`;
}

// 適正体重評価を計算
function calculateWeightEvaluation(formData: DogFormData, predictedWeight: number): WeightEvaluation {
  const currentWeight = Number(formData.currentWeight);
  
  if (!currentWeight || !predictedWeight) {
    return {
      category: 'ideal',
      grade: 'C',
      description: '適正範囲内',
      advice: '現在の体重は一般的な範囲内にあります。このまま成長を見守りましょう。'
    };
  }

  const ratio = currentWeight / predictedWeight;
  
  if (ratio < 0.7) {
    return {
      category: 'underweight',
      grade: 'E',
      description: '痩せすぎ',
      advice: '体重は平均より軽めの傾向があります。体調や食事内容について気になる点がある場合は、かかりつけの獣医師にご相談ください。'
    };
  } else if (ratio < 0.9) {
    return {
      category: 'slightly_underweight',
      grade: 'D',
      description: 'やや痩せ気味',
      advice: 'やや軽めの傾向がありますが、成長途中の個体差もあります。継続して様子を見てあげてください。'
    };
  } else if (ratio > 1.3) {
    return {
      category: 'overweight',
      grade: 'E',
      description: '太りすぎ',
      advice: '体重は平均より重めの傾向があります。フードの量や生活環境の見直しを検討される際は、獣医師に相談されることをおすすめします。'
    };
  } else if (ratio > 1.1) {
    return {
      category: 'slightly_overweight',
      grade: 'D',
      description: 'やや太り気味',
      advice: 'やや重めの傾向があります。体型の変化や運動量なども参考にしながら観察を続けてください。'
    };
  } else {
    return {
      category: 'ideal',
      grade: 'A',
      description: '理想的',
      advice: '現在の体重は理想的な範囲内にあります。この調子で健康管理を続けてください。'
    };
  }
}

// Geminiのレスポンスをパース
function parseGeminiResponse(response: string): {
  predictedWeight: number;
  healthAdvice: string;
  trainingAdvice: string;
  costAdvice: string;
} {
  try {
    // JSONの開始と終了を見つけて抽出
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}') + 1;
    const jsonStr = response.substring(jsonStart, jsonEnd);
    
    const parsed = JSON.parse(jsonStr);
    
    return {
      predictedWeight: Number(parsed.predictedWeight) || 5.0,
      healthAdvice: parsed.healthAdvice || '健康管理について専門医にご相談ください。',
      trainingAdvice: parsed.trainingAdvice || 'しつけについては専門のトレーナーにご相談ください。',
      costAdvice: parsed.costAdvice || '費用については獣医師にご相談ください。'
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    // フォールバック値を返す
    return {
      predictedWeight: 5.0,
      healthAdvice: '健康管理について専門医にご相談ください。レスポンスの解析に失敗しました。',
      trainingAdvice: 'しつけについては専門のトレーナーにご相談ください。レスポンスの解析に失敗しました。',
      costAdvice: '費用については獣医師にご相談ください。'
    };
  }
}