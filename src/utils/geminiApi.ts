import { DogFormData, PredictionResult, WeightEvaluation, CostSimulation } from '../types';
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
    
    // 2. 画像生成用プロンプトを生成（テキストのみ）
    const imagePrompt = await generateSimpleImagePrompt(formData, predictionData.predictedWeight, predictionData.predictedLength, predictionData.predictedHeight);
    
    // 3. FLUX.1で画像を生成（入力画像を参考画像として使用）
    console.log('🎨 FLUX.1画像生成開始...');
    const generatedImageUrl = await generateDogImage({
      prompt: imagePrompt,
      breed: formData.breed || 'ミックス',
      gender: formData.gender === 'male' ? 'オス' : 'メス',
      predictedWeight: predictionData.predictedWeight,
      predictedLength: predictionData.predictedLength,
      predictedHeight: predictionData.predictedHeight,
      referenceImages: formData.photos // 入力画像を参考画像として渡す
    });
    
    // 4. 体重評価を生成
    console.log('📊 体重評価算出開始...');
    const weightEvaluation = await calculateWeightEvaluation(formData, predictionData.predictedWeight);

    // 5. コストシミュレーションを生成
    console.log('💰 コストシミュレーション算出開始...');
    const costSimulation = await generateCostSimulation(formData, predictionData.predictedWeight);

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
      weightEvaluation,
      costSimulation
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

// シンプルな画像プロンプト生成（入力画像を参考にするため特徴抽出は不要）
async function generateSimpleImagePrompt(formData: DogFormData, predictedWeight: number, predictedLength: number, predictedHeight: number): Promise<string> {
  const genderEn = formData.gender === 'male' ? 'male' : 'female';
  const genderJa = formData.gender === 'male' ? 'オス' : 'メス';
  
  // サイズ情報
  const sizeInfo = predictedLength && predictedHeight 
    ? `body length ${predictedLength}cm, height ${predictedHeight}cm, `
    : '';
    
  // 基本的なプロンプト（入力画像の特徴は参考画像から自動で取得される）
  const prompt = `A realistic photo of an adult ${genderEn} ${formData.breed || 'mixed breed'} dog weighing approximately ${predictedWeight}kg, ${sizeInfo}standing next to a human person for size comparison, full body shot of both dog and human, high quality, professional photography, natural lighting, outdoor setting`;
  
  console.log('✅ シンプル画像プロンプト生成完了:', prompt);
  return prompt;
}

// 画像生成用プロンプト生成（レート制限対応）- 廃止予定
async function generateImagePrompt(formData: DogFormData, predictedWeight: number, predictedLength: number, predictedHeight: number): Promise<string> {
  // 子犬の画像から特徴を抽出
  const imageFeatures = await extractPuppyFeatures(formData);
  const prompt = createImagePromptGenerationPrompt(formData, predictedWeight, predictedLength, predictedHeight, imageFeatures);
  
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
function createImagePromptGenerationPrompt(formData: DogFormData, predictedWeight: number, predictedLength: number, predictedHeight: number, imageFeatures?: string): string {
  return `
犬種「${formData.breed}」の成犬時の画像を生成するための詳細なプロンプトを作成してください。

## 情報
- 犬種: ${formData.breed}
- 性別: ${formData.gender === 'male' ? 'オス' : 'メス'}
- 予測体重: ${predictedWeight}kg
- 予測体長: ${predictedLength}cm (鼻先から尻尾の付け根まで)
- 予測体高: ${predictedHeight}cm (地面から肩甲骨の頂点まで)
${imageFeatures ? `- 子犬時の外見特徴: ${imageFeatures}` : ''}

## 要求事項
- 画像生成AI（DALL-E、Midjourney等）用の英語プロンプトを作成
- 犬種の特徴を正確に反映
- 成犬らしい堂々とした姿勢
- 横向きの全身写真
- 白背景
- 高品質で自然な写真調
- 予測された体長と体高の比率を正確に反映
${imageFeatures ? '- 子犬時の毛色や模様などの外見特徴を成犬時に反映' : ''}

プロンプトのみを出力してください（説明文は不要）。
`;
}

// 子犬の画像から特徴を抽出する関数
async function extractPuppyFeatures(formData: DogFormData): Promise<string> {
  if (!formData.photos || formData.photos.length === 0) {
    return '';
  }

  try {
    // 最初の画像をBase64に変換
    const imageFile = formData.photos[0];
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `
この子犬の写真を分析して、以下の外見特徴を簡潔に英語で記述してください：

## 分析対象
- 毛色（具体的な色名）
- 毛の模様やマーキング
- 耳の形状と色
- 体の特徴的な部分の色分け

## 出力形式
英語で簡潔に特徴をカンマ区切りで記述してください。
例: "golden coat, white chest marking, dark ears, brown eyes"

特徴のみを出力してください（説明文は不要）。
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: imageFile.type,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      console.error('画像特徴抽出API失敗:', response.status);
      return '';
    }

    const data: GeminiResponse = await response.json();
    const features = data.candidates[0].content.parts[0].text.trim();
    
    console.log('抽出された画像特徴:', features);
    return features;
  } catch (error) {
    console.error('画像特徴抽出エラー:', error);
    return '';
  }
}

// ファイルをBase64に変換するヘルパー関数
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/jpeg;base64, の部分を除去
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Gemini APIを使って適正体重範囲を取得
async function getAppropriateWeightRange(formData: DogFormData): Promise<{min: number, max: number, center: number, ranges: {A: {threshold: number}, B: {min: number, max: number}, C: {min: number, max: number}, D: {min: number, max: number}, E: {threshold: number}}}> {
  const birthDate = new Date(formData.birthDate);
  const today = new Date();
  const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const ageInMonths = Math.floor(ageInDays / 30);

  const prompt = `
あなたは経験豊富な獣医師です。以下の犬の情報に基づいて、現在の月齢における体重評価の5段階範囲（A～E）を算出してください。

## 犬の情報
- 犬種: ${formData.breed || '不明'}
- 性別: ${formData.gender === 'male' ? 'オス' : 'メス'}
- 生まれてからの日数: ${ageInDays}日
- 現在の月齢: ${ageInMonths}ヶ月
${formData.motherAdultWeight ? `- 母親の成犬時体重: ${formData.motherAdultWeight}kg` : ''}
${formData.fatherAdultWeight ? `- 父親の成犬時体重: ${formData.fatherAdultWeight}kg` : ''}

## 評価基準
- A: 痩せすぎ
- B: やや痩せ気味
- C: 適正範囲内
- D: やや重め
- E: 太り気味

## 出力形式（必ずこの形式で回答してください）
JSON形式で以下の情報を提供してください：

{
  "minWeight": [適正体重範囲の最小値（数値・kg）],
  "maxWeight": [適正体重範囲の最大値（数値・kg）],
  "centerWeight": [適正体重範囲の中央値（数値・kg）],
  "ranges": {
    "A": {"threshold": [痩せすぎの上限値（この値以下がA判定）]},
    "B": {"min": [やや痩せ気味の最小値], "max": [やや痩せ気味の最大値]},
    "C": {"min": [適正範囲内の最小値], "max": [適正範囲内の最大値]},
    "D": {"min": [やや重めの最小値], "max": [やや重めの最大値]},
    "E": {"threshold": [太り気味の下限値（この値以上がE判定）]}
  }
}

## 注意事項
- 犬種の標準的な成長曲線を考慮してください
- 性別による体格差を反映してください
- 生まれてからの日数と現在の月齢に適した体重範囲を算出してください
- 両親の体重情報がある場合は参考にしてください
- A評価は上限値以下の全ての体重（下限なし）
- E評価は下限値以上の全ての体重（上限なし）
- B,C,Dの範囲は連続的で重複しないように設定してください
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
      throw new Error(`Appropriate weight range API request failed: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const result = data.candidates[0].content.parts[0].text;
    
    // JSONの開始と終了を見つけて抽出
    const jsonStart = result.indexOf('{');
    const jsonEnd = result.lastIndexOf('}') + 1;
    const jsonStr = result.substring(jsonStart, jsonEnd);
    
    const parsed = JSON.parse(jsonStr);
    
    const min = Number(parsed.minWeight) || 1.5;
    const max = Number(parsed.maxWeight) || 3.0;
    const center = Number(parsed.centerWeight) || (min + max) / 2;
    
    // A～Eの範囲を取得
    const ranges = {
      A: {
        threshold: Number(parsed.ranges?.A?.threshold) || min * 0.8
      },
      B: {
        min: Number(parsed.ranges?.B?.min) || min * 0.8,
        max: Number(parsed.ranges?.B?.max) || min
      },
      C: {
        min: Number(parsed.ranges?.C?.min) || min,
        max: Number(parsed.ranges?.C?.max) || max
      },
      D: {
        min: Number(parsed.ranges?.D?.min) || max,
        max: Number(parsed.ranges?.D?.max) || max * 1.2
      },
      E: {
        threshold: Number(parsed.ranges?.E?.threshold) || max * 1.2
      }
    };
    
    return { min, max, center, ranges };
  } catch (error) {
    console.error('Failed to get appropriate weight range:', error);
    // フォールバック: 犬種と月齢に基づく簡易計算
    const ageInMonths = Math.floor(ageInDays / 30);
    let center: number;
    if (ageInMonths < 3) center = 1.5;
    else if (ageInMonths < 6) center = 3.0;
    else if (ageInMonths < 12) center = 5.0;
    else center = 8.0;
    
    const min = center * 0.85;
    const max = center * 1.15;
    
    // フォールバック時のA～E範囲
    const ranges = {
      A: { threshold: min * 0.8 },
      B: { min: min * 0.8, max: min },
      C: { min: min, max: max },
      D: { min: max, max: max * 1.2 },
      E: { threshold: max * 1.2 }
    };
    
    return { min, max, center, ranges };
  }
}

// 現在の適正体重評価を計算（Gemini APIベース）
async function calculateWeightEvaluation(formData: DogFormData, _predictedWeight: number): Promise<WeightEvaluation> {
  const currentWeight = Number(formData.currentWeight);
  
  // Gemini APIから適正体重範囲を取得
  const appropriateWeightRange = await getAppropriateWeightRange(formData);
  
  if (!currentWeight) {
    return {
      category: 'ideal',
      grade: 'C',
      description: '適正範囲内',
      advice: '現在の体重は一般的な範囲内にあります。このまま成長を見守りましょう。',
      appropriateWeightRange
    };
  }

  const { min, max, center, ranges } = appropriateWeightRange;
  
  // APIから取得したA～E範囲を使って評価
  if (currentWeight <= ranges.A.threshold) {
    // A: 痩せすぎ（下限なし、閾値以下）
    return {
      category: 'underweight',
      grade: 'A',
      description: '痩せすぎ',
      advice: '体重は平均より軽めの傾向があります。体調や食事内容について気になる点がある場合は、かかりつけの獣医師にご相談ください。',
      appropriateWeightRange
    };
  } else if (currentWeight >= ranges.E.threshold) {
    // E: 太り気味（上限なし、閾値以上）
    return {
      category: 'overweight',
      grade: 'E',
      description: '太り気味',
      advice: '体重は平均より重めの傾向があります。フードの量や生活環境の見直しを検討される際は、獣医師に相談されることをおすすめします。',
      appropriateWeightRange
    };
  } else if (currentWeight <= ranges.B.max) {
    // B: やや痩せ気味
    return {
      category: 'slightly_underweight',
      grade: 'B',
      description: 'やや痩せ気味',
      advice: 'やや軽めの傾向がありますが、成長途中の個体差もあります。継続して様子を見てあげてください。',
      appropriateWeightRange
    };
  } else if (currentWeight <= ranges.C.max) {
    // C: 適正範囲内
    return {
      category: 'ideal',
      grade: 'C',
      description: '適正範囲内',
      advice: '現在の体重は一般的な範囲内にあります。このまま成長を見守りましょう。',
      appropriateWeightRange
    };
  } else {
    // D: やや重め
    return {
      category: 'slightly_overweight',
      grade: 'D',
      description: 'やや重め',
      advice: 'やや重めの傾向があります。体型の変化や運動量なども参考にしながら観察を続けてください。',
      appropriateWeightRange
    };
  }
}

// Gemini APIを使ってコストシミュレーションを生成
async function generateCostSimulation(formData: DogFormData, predictedWeight: number): Promise<CostSimulation> {
  const birthDate = new Date(formData.birthDate);
  const today = new Date();
  const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const ageInMonths = Math.floor(ageInDays / 30);

  const prompt = `
あなたは経験豊富な獣医師兼ペット用品専門家です。以下の犬の情報に基づいて、具体的で実用的な費用シミュレーションを作成してください。

## 犬の情報
- 犬種: ${formData.breed || '不明'}
- 性別: ${formData.gender === 'male' ? 'オス' : 'メス'}
- 現在の月齢: ${ageInMonths}ヶ月
- 現在の体重: ${formData.currentWeight}kg
- 予測成犬時体重: ${predictedWeight}kg

## 出力形式（必ずこの形式で回答してください）
JSON形式で以下の情報を提供してください：

{
  "categories": [
    {
      "id": "initial",
      "title": "初期費用（お迎え時）",
      "description": "犬を迎える際に必要な基本的な用品",
      "icon": "1",
      "items": [
        {"name": "項目名", "cost": "¥XX,XXX - ¥XX,XXX"},
        ...
      ],
      "total": "¥XX,XXX - ¥XX,XXX"
    },
    {
      "id": "monthly",
      "title": "毎月の費用",
      "description": "継続的にかかる月額費用",
      "icon": "2",
      "items": [...],
      "total": "¥XX,XXX - ¥XX,XXX"
    },
    {
      "id": "health",
      "title": "年間健康管理費用",
      "description": "予防接種や健康診断など",
      "icon": "3",
      "items": [...],
      "total": "¥XX,XXX - ¥XX,XXX"
    },
    {
      "id": "medical",
      "title": "医療費（不定期）",
      "description": "病気や怪我の際の治療費",
      "icon": "4",
      "items": [...],
      "total": "参考価格"
    }
  ]
}

## 注意事項
- 犬種のサイズ（小型犬、中型犬、大型犬）に応じた費用を算出してください
- 性別による違い（去勢・避妊手術費用など）を考慮してください
- 現在の体重と予測体重から必要な用品サイズを判断してください
- 日本の一般的な価格帯を参考にしてください
- 各カテゴリに4-6個程度の具体的な項目を含めてください
- 費用は幅を持たせて「¥X,XXX - ¥X,XXX」形式で表示してください
- 実用的で参考になる内容にしてください
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
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Cost simulation API request failed: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const result = data.candidates[0].content.parts[0].text;
    
    // JSONの開始と終了を見つけて抽出
    const jsonStart = result.indexOf('{');
    const jsonEnd = result.lastIndexOf('}') + 1;
    const jsonStr = result.substring(jsonStart, jsonEnd);
    
    const parsed = JSON.parse(jsonStr);
    
    return parsed;
  } catch (error) {
    console.error('Failed to generate cost simulation:', error);
    // フォールバック: デフォルトのコストシミュレーション
    return {
      categories: [
        {
          id: "initial",
          title: "初期費用（お迎え時）",
          description: "犬を迎える際に必要な基本的な用品",
          icon: "1",
          items: [
            { name: "ケージ・サークル", cost: "¥8,000 - ¥20,000" },
            { name: "食器・水入れ", cost: "¥2,000 - ¥5,000" },
            { name: "トイレ・トレー", cost: "¥3,000 - ¥8,000" },
            { name: "ベッド・クッション", cost: "¥3,000 - ¥10,000" },
            { name: "首輪・リード", cost: "¥2,000 - ¥6,000" },
            { name: "おもちゃ", cost: "¥2,000 - ¥5,000" }
          ],
          total: "¥20,000 - ¥54,000"
        },
        {
          id: "monthly",
          title: "毎月の費用",
          description: "継続的にかかる月額費用",
          icon: "2",
          items: [
            { name: "フード", cost: "¥3,000 - ¥8,000" },
            { name: "おやつ", cost: "¥1,000 - ¥3,000" },
            { name: "ペットシーツ", cost: "¥1,500 - ¥3,000" },
            { name: "ペット保険", cost: "¥2,000 - ¥5,000" }
          ],
          total: "¥7,500 - ¥19,000"
        },
        {
          id: "health",
          title: "年間健康管理費用",
          description: "予防接種や健康診断など",
          icon: "3",
          items: [
            { name: "混合ワクチン（年1回）", cost: "¥5,000 - ¥8,000" },
            { name: "狂犬病ワクチン（年1回）", cost: "¥3,000 - ¥4,000" },
            { name: "健康診断（年1-2回）", cost: "¥5,000 - ¥15,000" },
            { name: "フィラリア予防（年間）", cost: "¥8,000 - ¥15,000" }
          ],
          total: "¥21,000 - ¥42,000"
        },
        {
          id: "medical",
          title: "医療費（不定期）",
          description: "病気や怪我の際の治療費",
          icon: "4",
          items: [
            { name: "一般的な診察", cost: "¥2,000 - ¥5,000" },
            { name: "去勢・避妊手術", cost: "¥20,000 - ¥50,000" },
            { name: "歯科治療", cost: "¥10,000 - ¥30,000" },
            { name: "緊急治療・手術", cost: "¥50,000 - ¥200,000+" }
          ],
          total: "参考価格"
        }
      ]
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