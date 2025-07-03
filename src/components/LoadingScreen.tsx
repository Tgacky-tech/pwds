import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC = () => {
  const [progressText, setProgressText] = useState('AIが子犬の未来を予測中です…');
  const [showFireworks, setShowFireworks] = useState(false);
  
  useEffect(() => {
    const textMessages = [
      { time: 0, text: 'AIが子犬の未来を予測中です…' },
      { time: 2000, text: '成長パターンを分析中…' },
      { time: 4000, text: 'AIの結果を出力中…' },
      { time: 6000, text: '予測完了！' }
    ];
    
    const timers = textMessages.map(({ time, text }) => 
      setTimeout(() => {
        setProgressText(text);
        if (text === '予測完了！') {
          setShowFireworks(true);
        }
      }, time)
    );
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);
  
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Fireworks effect */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="firework firework-1"></div>
          <div className="firework firework-2"></div>
          <div className="firework firework-3"></div>
        </div>
      )}
      
      {/* Extra large paw print loading animation - centered */}
      <div className="flex items-center justify-center mb-8">
        <div className="paw-loader-extra-large">
          <div className="paw-print-extra-large paw-1">🐾</div>
          <div className="paw-print-extra-large paw-2">🐾</div>
          <div className="paw-print-extra-large paw-3">🐾</div>
          <div className="paw-print-extra-large paw-4">🐾</div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        処理中
      </h2>
      
      <p className="text-gray-600 text-center mb-6 min-h-[1.5rem] text-lg">
        {progressText}
      </p>
      
      <div className="w-80 bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full animate-progress-fast"></div>
      </div>
      
      <p className="text-sm text-gray-500 text-center">
        少々お待ちください（約10〜15秒）
      </p>
    </div>
  );
};

export default LoadingScreen;