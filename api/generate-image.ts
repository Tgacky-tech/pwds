interface FluxApiResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
}

interface GenerateImageRequest {
  prompt: string;
  breed: string;
  gender: string;
  predictedWeight: number;
}

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 API呼び出し開始');
    console.log('📝 リクエストボディ:', req.body);
    console.log('🌍 環境:', { 
      nodeEnv: process.env.NODE_ENV,
      hasToken: !!process.env.REPLICATE_API_TOKEN,
      platform: process.platform 
    });
    
    const { prompt, breed, gender, predictedWeight }: GenerateImageRequest = req.body;

    if (!prompt || !breed || !gender || !predictedWeight) {
      console.log('❌ 必須パラメータ不足:', { prompt: !!prompt, breed: !!breed, gender: !!gender, predictedWeight: !!predictedWeight });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (!REPLICATE_API_TOKEN) {
      console.log('❌ APIトークンが設定されていません');
      return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
    }

    // APIトークンの形式確認
    console.log('🔑 APIトークン確認:', REPLICATE_API_TOKEN ? `${REPLICATE_API_TOKEN.substring(0, 8)}...` : 'なし');

    // 性別の英語変換
    const genderEn = gender === "オス" ? "male" : "female";
    
    // より詳細なプロンプト作成（人とのサイズ比較を含む）
    const enhancedPrompt = `A realistic photo of an adult ${genderEn} ${breed} dog weighing approximately ${predictedWeight}kg standing next to a person for size comparison, full body shot, high quality, professional photography. ${prompt}`;
    
    console.log('🎨 FLUX.1 画像生成開始:', { breed, gender, predictedWeight });
    
    const headers = {
      "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json"
    };
    
    // 高速なFLUXモデルを使用（schnellは最速）
    const data = {
      version: "c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e",
      input: {
        prompt: enhancedPrompt,
        num_outputs: 1,
        aspect_ratio: "16:9",
        go_fast: true
      }
    };
    
    console.log('🎯 送信データ:', JSON.stringify(data, null, 2));
    
    console.log('📤 FLUX.1 APIリクエスト送信...');
    
    // 画像生成リクエスト
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    
    console.log('📥 レスポンスステータス:', response.status, response.statusText);
    console.log('📥 レスポンスヘッダー:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API リクエスト失敗:', errorText);
      console.log('❌ ステータス詳細:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // 具体的なエラーメッセージを解析
      try {
        const errorObj = JSON.parse(errorText);
        console.log('❌ エラーオブジェクト:', errorObj);
        return res.status(response.status).json({ 
          error: `Replicate API Error: ${errorObj.detail || errorObj.message || errorText}`,
          status: response.status
        });
      } catch (parseError) {
        console.log('❌ エラーパース失敗:', parseError);
        return res.status(response.status).json({ 
          error: `API request failed: ${response.status} - ${errorText}`,
          status: response.status
        });
      }
    }
    
    const prediction = await response.json() as FluxApiResponse;
    const predictionId = prediction.id;
    
    console.log('📝 予測ID:', predictionId);
    
    // 生成完了まで待機（最大4分）
    let attempts = 0;
    const maxAttempts = 120; // 4分 (2秒 × 120回)
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        { headers }
      );
      
      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }
      
      const result = await statusResponse.json() as FluxApiResponse;
      
      console.log(`🔄 生成状況 (${attempts + 1}/${maxAttempts}):`, result.status);
      
      if (result.status === "succeeded") {
        const imageUrl = result.output?.[0];
        if (imageUrl) {
          console.log('✅ FLUX.1 画像生成完了:', imageUrl);
          return res.status(200).json({ imageUrl });
        } else {
          console.error('❌ 出力が空です:', result);
          return res.status(500).json({ error: 'Empty output from FLUX.1' });
        }
      } else if (result.status === "failed") {
        console.error('❌ FLUX.1 画像生成失敗:', result.error);
        return res.status(500).json({ error: result.error || 'Image generation failed' });
      }
      
      attempts++;
    }
    
    console.error('⏰ FLUX.1 画像生成タイムアウト');
    return res.status(408).json({ error: 'Image generation timeout' });
    
  } catch (error) {
    console.error('❌ FLUX.1 画像生成エラー:', error);
    console.error('エラースタック:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : 'No details available'
    });
  }
}