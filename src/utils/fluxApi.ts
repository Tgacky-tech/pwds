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
    
    // Base64エンコードされたテスト画像（確実に動作）
    const base64TestImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmM2Y0ZjYiLz4KICA8cGF0aCBkPSJNMjAwIDgwQzE4MCA4MCAxNjUgOTUgMTY1IDExNUMxNjUgMTI1IDE1NSAxMzAgMTUwIDEzNUMxNDUgMTQwIDE0MCAxNTAgMTQwIDE2NUMxNDAgMTgwIDE1MCAxOTAgMTY1IDE5MEwyMzUgMTkwQzI1MCAxOTAgMjYwIDE4MCAyNjAgMTY1QzI2MCAxNTAgMjU1IDE0MCAyNTAgMTM1QzI0NSAxMzAgMjM1IDEyNSAyMzUgMTE1QzIzNSA5NSAyMjAgODAgMjAwIDgwWiIgZmlsbD0iIzNiODJmNiIvPgogIDxjaXJjbGUgY3g9IjE4NSIgY3k9IjExMCIgcj0iNSIgZmlsbD0iIzFmMjkzNyIvPgogIDxjaXJjbGUgY3g9IjIxNSIgY3k9IjExMCIgcj0iNSIgZmlsbD0iIzFmMjkzNyIvPgogIDxlbGxpcHNlIGN4PSIyMDAiIGN5PSIxMjUiIHJ4PSIzIiByeT0iMiIgZmlsbD0iIzFmMjkzNyIvPgogIDxlbGxpcHNlIGN4PSIyMDAiIGN5PSIxODAiIHJ4PSI1MCIgcnk9IjMwIiBmaWxsPSIjMzU4MmY2Ii8+CiAgPHJlY3QgeD0iMTcwIiB5PSIyMDAiIHdpZHRoPSI4IiBoZWlnaHQ9IjI1IiBmaWxsPSIjMzU4MmY2Ii8+CiAgPHJlY3QgeD0iMTg1IiB5PSIyMDAiIHdpZHRoPSI4IiBoZWlnaHQ9IjI1IiBmaWxsPSIjMzU4MmY2Ii8+CiAgPHJlY3QgeD0iMjA3IiB5PSIyMDAiIHdpZHRoPSI4IiBoZWlnaHQ9IjI1IiBmaWxsPSIjMzU4MmY2Ii8+CiAgPHJlY3QgeD0iMjIyIiB5PSIyMDAiIHdpZHRoPSI4IiBoZWlnaHQ9IjI1IiBmaWxsPSIjMzU4MmY2Ii8+CiAgPGVsbGlwc2UgY3g9IjI2MCIgY3k9IjE3MCIgcng9IjgiIHJ5PSIxNSIgZmlsbD0iIzM1ODJmNiIgdHJhbnNmb3JtPSJyb3RhdGUoMzAgMjYwIDE3MCkiLz4KICA8dGV4dCB4PSIyMDAiIHk9IjI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmI3MjgwIj4KICA8L3RleHQ+Cjwvc3ZnPg==';
    
    // 犬種に応じたメッセージ付きで同じベース画像を使用
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