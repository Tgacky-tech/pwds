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
    
    // FLUX.1 API経由で画像生成を試行
    console.log('🚀 実際のFLUX.1 API呼び出し開始...');
    
    try {
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
      
      if (response.ok) {
        const result: ApiResponse = await response.json();
        
        if (result.imageUrl) {
          console.log('✅ FLUX.1 画像生成完了:', result.imageUrl);
          return result.imageUrl;
        }
      }
      
      console.log('⚠️ FLUX.1 API失敗、フォールバック画像を使用');
    } catch (apiError) {
      console.log('⚠️ FLUX.1 API エラー、フォールバック画像を使用:', apiError);
    }
    
    // フォールバック: Base64 SVG画像を生成
    const dogMessages = {
      'チワワ': 'チワワの成犬予想',
      'トイプードル': 'トイプードルの成犬予想', 
      'ゴールデンレトリバー': 'ゴールデンレトリバーの成犬予想',
      'ミックス': 'ミックス犬の成犬予想'
    };
    
    const message = dogMessages[breed as keyof typeof dogMessages] || `${breed}の成犬予想`;
    
    // SVGを動的に生成
    const svgContent = `
      <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f3f4f6"/>
        <path d="M200 80C180 80 165 95 165 115C165 125 155 130 150 135C145 140 140 150 140 165C140 180 150 190 165 190L235 190C250 190 260 180 260 165C260 150 255 140 250 135C245 130 235 125 235 115C235 95 220 80 200 80Z" fill="#3b82f6"/>
        <circle cx="185" cy="110" r="5" fill="#1f2937"/>
        <circle cx="215" cy="110" r="5" fill="#1f2937"/>
        <ellipse cx="200" cy="125" rx="3" ry="2" fill="#1f2937"/>
        <ellipse cx="200" cy="180" rx="50" ry="30" fill="#3582f6"/>
        <rect x="170" y="200" width="8" height="25" fill="#3582f6"/>
        <rect x="185" y="200" width="8" height="25" fill="#3582f6"/>
        <rect x="207" y="200" width="8" height="25" fill="#3582f6"/>
        <rect x="222" y="200" width="8" height="25" fill="#3582f6"/>
        <ellipse cx="260" cy="170" rx="8" ry="15" fill="#3582f6" transform="rotate(30 260 170)"/>
        <text x="200" y="260" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
          ${message}
        </text>
        <text x="200" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
          予測体重: ${predictedWeight}kg
        </text>
      </svg>
    `;
    
    const imageUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
    
    console.log('✅ フォールバック画像生成完了');
    return imageUrl;
    
  } catch (error) {
    console.error('❌ 画像生成エラー:', error);
    
    // 最終フォールバック
    return '/default-dog.svg';
  }
};

export default generateDogImage;