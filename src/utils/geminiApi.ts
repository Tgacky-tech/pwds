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
    
    // 4. 体重評価を生成
    console.log('📊 体重評価算出開始...');
    const weightEvaluation = await calculateWeightEvaluation(formData, predictionData.predictedWeight);

    return {
      predictedWeight: predictionData.predictedWeight,
      predictedLength: predictionData.predictedLength,
      predictedHeight: predictionData.predictedHeight,
      imageUrl: generatedImageUrl || '/default-dog.svg', // FLUX.1生成画像、失敗時はフォールバック
      imagePrompt: imagePrompt, // 画像生成用プロンプト
      advice: {
        health: predictionData.healthAdvice,
        training: predictionData.trainingAdvice,
        cost: predictionData.costAdvice
      },
      weightEvaluation
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('予測の生成に失敗しました。');
  }
};

// メインの予測データ生成（レート制限対応）
async function generatePredictionData(formData: DogFormData) {
  const prompt = createPredictionPrompt(formData);
  
  // レート制限対応: 最大3回のリトライを実行
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🔄 Gemini API呼び出し（試行${attempt}/3）`);
      
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

      if (response.status === 429) {
        // レート制限の場合は指数バックオフで待機
        const waitTime = Math.pow(2, attempt) * 1000; // 2秒, 4秒, 8秒
        console.log(`⏳ レート制限エラー。${waitTime/1000}秒待機後にリトライ...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      console.log('✅ Gemini API呼び出し成功');
      return parseGeminiResponse(result);
      
    } catch (error) {
      console.error(`❌ Gemini API試行${attempt}失敗:`, error);
      
      if (attempt === 3) {
        throw error; // 最後の試行で失敗した場合はエラーを投げる
      }
      
      // 次の試行前に少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// 画像生成用プロンプト生成（レート制限対応）
async function generateImagePrompt(formData: DogFormData, predictedWeight: number): Promise<string> {
  const prompt = createImagePromptGenerationPrompt(formData, predictedWeight);
  
  // レート制限対応: 最大3回のリトライを実行
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🎨 画像プロンプト生成（試行${attempt}/3）`);
      
      // 前のAPI呼び出しから1秒待機してレート制限を回避
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ レート制限エラー。${waitTime/1000}秒待機後にリトライ...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(`Image prompt generation failed: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('✅ 画像プロンプト生成成功');
      return data.candidates[0].content.parts[0].text.trim();
      
    } catch (error) {
      console.error(`❌ 画像プロンプト生成試行${attempt}失敗:`, error);
      
      if (attempt === 3) {
        // 最後の試行で失敗した場合はフォールバックプロンプトを返す
        console.log('⚠️ フォールバック画像プロンプトを使用');
        return `A realistic photo of an adult ${formData.gender === 'male' ? 'male' : 'female'} ${formData.breed} dog weighing approximately ${predictedWeight}kg, full body shot, high quality, professional photography.`;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // この行は実際には到達しないが、TypeScriptの型チェック用
  return `A realistic photo of an adult ${formData.gender === 'male' ? 'male' : 'female'} ${formData.breed} dog weighing approximately ${predictedWeight}kg, full body shot, high quality, professional photography.`;
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
  "predictedWeight": [成犬時の予測体重（数値・kg）],
  "predictedLength": [成犬時の予測体長（数値・cm）],
  "predictedHeight": [成犬時の予測体高（数値・cm）],
  "healthAdvice": "[健康管理に関する具体的なアドバイス（200-300文字）]",
  "trainingAdvice": "[しつけに関する具体的なアドバイス（200-300文字）]",
  "costAdvice": "[費用に関する追加アドバイス（100-150文字）]"
}

## 注意事項
- 予測体重・体長・体高は犬種、現在の体重、月齢、両親の体重を考慮して計算してください
- 体長は鼻先から尻尾の付け根まで、体高は地面から肩甲骨最高点までの高さです
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

// Gemini APIを使って適正体重を取得
async function getAppropriateWeight(formData: DogFormData): Promise<number> {
  const birthDate = new Date(formData.birthDate);
  const today = new Date();
  const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const ageInMonths = Math.floor(ageInDays / 30);

  const prompt = `
あなたは経験豊富な獣医師です。以下の犬の情報に基づいて、現在の月齢における適正体重を算出してください。

## 犬の情報
- 犬種: ${formData.breed || '不明'}
- 性別: ${formData.gender === 'male' ? 'オス' : 'メス'}
- 生まれてからの日数: ${ageInDays}日
- 現在の月齢: ${ageInMonths}ヶ月
${formData.motherAdultWeight ? `- 母親の成犬時体重: ${formData.motherAdultWeight}kg` : ''}
${formData.fatherAdultWeight ? `- 父親の成犬時体重: ${formData.fatherAdultWeight}kg` : ''}

## 出力形式（必ずこの形式で回答してください）
JSON形式で以下の情報を提供してください：

{
  "appropriateWeight": [現在の月齢における適正体重（数値・kg）]
}

## 注意事項
- 犬種の標準的な成長曲線を考慮してください
- 性別による体格差を反映してください
- 生まれてからの日数と現在の月齢に適した体重を算出してください
- 両親の体重情報がある場合は参考にしてください
- 現在の体重は参考にせず、犬種・性別・月齢のみから適正体重を算出してください
- 実数値のみを返してください（単位は含めない）
`;

  try {
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
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Appropriate weight API request failed: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const result = data.candidates[0].content.parts[0].text;
    
    // JSONの開始と終了を見つけて抽出
    const jsonStart = result.indexOf('{');
    const jsonEnd = result.lastIndexOf('}') + 1;
    const jsonStr = result.substring(jsonStart, jsonEnd);
    
    const parsed = JSON.parse(jsonStr);
    
    return Number(parsed.appropriateWeight) || 2.0; // フォールバック値
  } catch (error) {
    console.error('Failed to get appropriate weight:', error);
    // フォールバック: 犬種と月齢に基づく簡易計算
    const ageInMonths = Math.floor(ageInDays / 30);
    if (ageInMonths < 3) return 1.5;
    if (ageInMonths < 6) return 3.0;
    if (ageInMonths < 12) return 5.0;
    return 8.0; // 成犬の平均的な体重
  }
}

// 現在の適正体重評価を計算（Gemini APIベース）
async function calculateWeightEvaluation(formData: DogFormData, _predictedWeight: number): Promise<WeightEvaluation> {
  const currentWeight = Number(formData.currentWeight);
  
  // Gemini APIから適正体重を取得
  const appropriateWeight = await getAppropriateWeight(formData);
  
  if (!currentWeight) {
    return {
      category: 'ideal',
      grade: 'C',
      description: '適正範囲内',
      advice: '現在の体重は一般的な範囲内にあります。このまま成長を見守りましょう。',
      appropriateWeight
    };
  }

  // 現在体重と適正体重を比較して評価
  const weightRatio = currentWeight / appropriateWeight;
  const deviationPercent = Math.abs(weightRatio - 1) * 100;
  
  // 体重評価の基準
  if (weightRatio < 0.8) {
    // 適正体重の80%未満
    return {
      category: 'underweight',
      grade: 'E',
      description: '痩せすぎ',
      advice: `適正体重(${appropriateWeight.toFixed(1)}kg)を大きく下回っています。栄養状態や健康状態について至急獣医師にご相談ください。`,
      appropriateWeight
    };
  } else if (weightRatio < 0.9) {
    // 適正体重の80-90%
    return {
      category: 'slightly_underweight',
      grade: 'D',
      description: 'やや痩せ',
      advice: `適正体重(${appropriateWeight.toFixed(1)}kg)をやや下回っています。食事量の調整について獣医師にご相談ください。`,
      appropriateWeight
    };
  } else if (weightRatio > 1.2) {
    // 適正体重の120%超
    return {
      category: 'overweight',
      grade: 'E',
      description: '太りすぎ',
      advice: `適正体重(${appropriateWeight.toFixed(1)}kg)を大きく上回っています。食事管理と運動について至急獣医師にご相談ください。`,
      appropriateWeight
    };
  } else if (weightRatio > 1.1) {
    // 適正体重の110-120%
    return {
      category: 'slightly_overweight',
      grade: 'D',
      description: 'やや太り',
      advice: `適正体重(${appropriateWeight.toFixed(1)}kg)をやや上回っています。食事量と運動量の調整について獣医師にご相談ください。`,
      appropriateWeight
    };
  } else {
    // 適正体重の90-110%（理想範囲）
    const grade = deviationPercent < 5 ? 'A' : deviationPercent < 10 ? 'B' : 'C';
    
    return {
      category: 'ideal',
      grade,
      description: '適正範囲内',
      advice: grade === 'A' 
        ? `体重は適正体重(${appropriateWeight.toFixed(1)}kg)に非常に近く理想的です。現在の食事と運動を継続してください。`
        : `体重は適正体重(${appropriateWeight.toFixed(1)}kg)の範囲内にあります。より理想的な体重に近づけるため、食事と運動のバランスを見直してみてください。`,
      appropriateWeight
    };
  }
}

// Geminiのレスポンスをパース
function parseGeminiResponse(response: string): {
  predictedWeight: number;
  predictedLength: number;
  predictedHeight: number;
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
      predictedLength: Number(parsed.predictedLength) || 40.0,
      predictedHeight: Number(parsed.predictedHeight) || 25.0,
      healthAdvice: parsed.healthAdvice || '健康管理について専門医にご相談ください。',
      trainingAdvice: parsed.trainingAdvice || 'しつけについては専門のトレーナーにご相談ください。',
      costAdvice: parsed.costAdvice || '費用については獣医師にご相談ください。'
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    // フォールバック値を返す
    return {
      predictedWeight: 5.0,
      predictedLength: 40.0,
      predictedHeight: 25.0,
      healthAdvice: '健康管理について専門医にご相談ください。レスポンスの解析に失敗しました。',
      trainingAdvice: 'しつけについては専門のトレーナーにご相談ください。レスポンスの解析に失敗しました。',
      costAdvice: '費用については獣医師にご相談ください。'
    };
  }
}