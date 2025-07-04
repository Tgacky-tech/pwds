import React, { useEffect, useState } from 'react';

const ProcessingScreen: React.FC = () => {
  const [progressText, setProgressText] = useState('AIが子犬の未来を予測中です…');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const textMessages = [
      { time: 0, text: 'AIが子犬の未来を予測中です…' },
      { time: 6000, text: '成長パターンを分析中…' },
      { time: 12000, text: 'AIの結果を出力中…' }
    ];
    
    const timers = textMessages.map(({ time, text }) => 
      setTimeout(() => setProgressText(text), time)
    );
    
    // プログレスバーを20秒で100%まで更新
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (20 * 10)); // 20秒 * 10回/秒 = 200回で100%
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100); // 0.1秒ごとに更新
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      clearInterval(progressInterval);
    };
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
        
        <div className="w-80 bg-gray-200 rounded-full h-4 overflow-hidden mx-auto">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-600 h-4 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;