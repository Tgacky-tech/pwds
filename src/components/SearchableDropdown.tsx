import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { filterBreeds } from '../data/dogBreeds';

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  value,
  onChange,
  placeholder = "犬種を検索または選択してください",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 検索結果の更新
  useEffect(() => {
    const filtered = filterBreeds(searchTerm);
    setFilteredBreeds(filtered.slice(0, 50)); // パフォーマンスのため最大50件に制限
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleBreedSelect = (breed: string) => {
    onChange(breed);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (searchTerm.trim()) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isOpen ? (
            <Search className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && searchTerm.trim() && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredBreeds.length > 0 ? (
            <ul className="py-1">
              {filteredBreeds.map((breed, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleBreedSelect(breed)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  >
                    <span className="block text-sm text-gray-900">{breed}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              「{searchTerm}」に一致する犬種が見つかりません
            </div>
          )}
          
          {searchTerm && filteredBreeds.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600">
                {filteredBreeds.length}件の犬種が見つかりました
                {filteredBreeds.length === 50 && ' (最大50件まで表示)'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;