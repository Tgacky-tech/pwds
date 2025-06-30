import React, { useEffect, useState } from 'react';

const ProcessingScreen: React.FC = () => {
  const [progressText, setProgressText] = useState('AIがあなたの愛犬の未来を予測中です...');
  
  useEffect(() => {
    const textMessages = [
      { time: 0, text: 'AIがあなたの愛犬の未来を予測中です...' },
      { time: 3000, text: '犬種データベースを参照しています...' },
      { time: 6000, text: '成長パターンを分析中...' },
      { time: 9000, text: 'AI画像生成を開始しています...' },
      { time: 15000, text: 'FLUX.1で愛犬の成犬姿を生成中...' },
      { time: 30000, text: '高品質な画像を作成中です...' },
      { time: 60000, text: 'もう少しお待ちください...' },
      { time: 90000, text: '最終調整を行っています...' }
    ];
    
    const timers = textMessages.map(({ time, text }) => 
      setTimeout(() => setProgressText(text), time)
    );
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        {/* Modern loading animation */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-32 h-32">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            {/* Animated ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-green-500 border-r-blue-500 rounded-full animate-spin"></div>
            {/* Inner ring */}
            <div className="absolute inset-4 border-4 border-gray-100 rounded-full"></div>
            {/* Inner animated ring */}
            <div className="absolute inset-4 border-4 border-transparent border-b-green-400 border-l-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          予測処理中
        </h2>
        
        <p className="text-gray-600 text-lg mb-6 min-h-[1.5rem] max-w-md mx-auto">
          {progressText}
        </p>
        
        <div className="w-80 bg-gray-200 rounded-full h-4 mb-4 overflow-hidden mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 h-4 rounded-full animate-progress-fast"></div>
        </div>
        
        <p className="text-sm text-gray-500">
          画像生成完了まで約2-3分お待ちください
        </p>
      </div>
    </div>
  );
};

export default ProcessingScreen;