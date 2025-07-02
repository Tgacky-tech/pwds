interface DataCrunchResponse {
  output: {
    images?: string[];
    message?: string;
  };
  error?: string;
}

interface GenerateImageRequest {
  prompt: string;
  breed: string;
  gender: string;
  predictedWeight: number;
}

const DATACRUNCH_API_KEY = process.env.DATACRUNCH_API_KEY;

module.exports = async function handler(req: any, res: any) {
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
      hasDataCrunchKey: !!process.env.DATACRUNCH_API_KEY,
      platform: process.platform 
    });
    
    const { prompt, breed, gender, predictedWeight }: GenerateImageRequest = req.body;

    if (!prompt || !breed || !gender || !predictedWeight) {
      console.log('❌ 必須パラメータ不足:', { prompt: !!prompt, breed: !!breed, gender: !!gender, predictedWeight: !!predictedWeight });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (!DATACRUNCH_API_KEY) {
      console.log('❌ APIキーが設定されていません');
      return res.status(500).json({ error: 'DATACRUNCH_API_KEY not configured' });
    }

    // APIキーの形式確認
    console.log('🔑 APIキー確認:', DATACRUNCH_API_KEY ? `${DATACRUNCH_API_KEY.substring(0, 8)}...` : 'なし');

    // 性別の英語変換
    const genderEn = gender === "オス" ? "male" : "female";
    
    // より詳細なプロンプト作成（人とのサイズ比較を含む）
    const enhancedPrompt = `A realistic photo of an adult ${genderEn} ${breed} dog weighing approximately ${predictedWeight}kg, full body shot, high quality, professional photography. ${prompt}`;
    
    console.log('🎨 FLUX Kontext 画像生成開始:', { breed, gender, predictedWeight });
    
    const headers = {
      "Authorization": `Bearer ${DATACRUNCH_API_KEY}`,
      "Content-Type": "application/json"
    };
    
    // DataCrunch FLUX Kontext API用のデータ
    const data = {
      input: {
        prompt: enhancedPrompt,
        size: "1024*1024",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_base64_output: false
      }
    };
    
    console.log('🎯 送信データ:', JSON.stringify(data, null, 2));
    
    console.log('📤 FLUX Kontext APIリクエスト送信...');
    
    // 画像生成リクエスト
    const response = await fetch("https://inference.datacrunch.io/flux-kontext-dev/predict", {
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
          error: `DataCrunch API Error: ${errorObj.detail || errorObj.message || errorText}`,
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
    
    const result = await response.json() as DataCrunchResponse;
    
    console.log('📝 レスポンス結果:', result);
    
    // DataCrunch APIは即座に結果を返すため、非同期処理は不要
    if (result.output?.images && result.output.images.length > 0) {
      const imageUrl = result.output.images[0];
      console.log('✅ FLUX Kontext 画像生成完了:', imageUrl);
      return res.status(200).json({ imageUrl });
    } else if (result.error) {
      console.error('❌ FLUX Kontext 画像生成失敗:', result.error);
      return res.status(500).json({ error: result.error });
    } else {
      console.error('❌ 予期しない応答形式:', result);
      return res.status(500).json({ error: 'Unexpected response format from FLUX Kontext' });
    }
    
  } catch (error) {
    console.error('❌ FLUX Kontext 画像生成エラー:', error);
    console.error('エラースタック:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : 'No details available'
    });
  }
};

// デフォルトエクスポートも追加
module.exports.default = module.exports;