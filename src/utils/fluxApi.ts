interface FluxGenerationInput {
  prompt: string;
  breed: string;
  gender: string;
  predictedWeight: number;
}

interface ApiResponse {
  imageUrl?: string;
  error?: string;
}

export const generateDogImage = async ({
  prompt,
  breed,
  gender,
  predictedWeight
}: FluxGenerationInput): Promise<string | null> => {
  try {
    console.log('🎨 FLUX.1 画像生成開始:', { breed, gender, predictedWeight });
    
    // バックエンドAPI経由で画像生成
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        breed,
        gender,
        predictedWeight
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const result: ApiResponse = await response.json();
    
    if (result.imageUrl) {
      console.log('✅ FLUX.1 画像生成完了:', result.imageUrl);
      return result.imageUrl;
    } else {
      console.error('❌ 画像生成失敗:', result.error);
      return null;
    }
    
  } catch (error) {
    console.error('❌ FLUX.1 画像生成エラー:', error);
    return null;
  }
};

export default generateDogImage;