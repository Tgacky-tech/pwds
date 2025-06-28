import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-500 text-xs py-3 px-4 border-t border-gray-200">
      <div className="max-w-md mx-auto">
        <p className="text-center">
          ※予測結果は目安であり、実際の成長と異なる場合があります。
        </p>
        <p className="text-center mt-1">
          ©︎ 2025 わんちゃん成長予測サービス
        </p>
      </div>
    </footer>
  );
};

export default Footer;