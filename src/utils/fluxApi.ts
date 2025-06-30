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
    
    // 一時的にAPIを無効化してテスト用画像を返す
    console.log('⚠️ テストモード: プレースホルダー画像を使用');
    
    // 犬種に応じたサンプル画像URLを返す（実際の画像生成の代わり）
    const sampleImages = {
      'チワワ': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
      'トイプードル': 'https://images.unsplash.com/photo-1616190260687-b7d8af9ee7d1?w=400&h=300&fit=crop',
      'ゴールデンレトリバー': 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'
    };
    
    const imageUrl = sampleImages[breed as keyof typeof sampleImages] || 
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop';
    
    console.log('✅ テスト画像URL:', imageUrl);
    return imageUrl;
    
    // APIコールは一時的にコメントアウト
    /*
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
      console.error('❌ エラー詳細:', result);
      return null;
    }
    */
    
  } catch (error) {
    console.error('❌ FLUX.1 画像生成エラー:', error);
    return null;
  }
};

export default generateDogImage;