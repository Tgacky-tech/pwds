import React from 'react';
import { Dog } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#06C755] text-white py-4 px-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Dog className="w-6 h-6" />
          <h1 className="text-lg font-bold">わんちゃん成長予測</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white">
            <span className="text-xs">？</span>
          </div>
          <div className="w-6 h-6 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full mx-1"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;