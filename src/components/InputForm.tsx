import React, { useState, useRef } from 'react';
import { Camera, Search } from 'lucide-react';
import { DogData } from '../types';
import { dogBreeds } from '../data/dogBreeds';

interface InputFormProps {
  onSubmit: (data: DogData) => void;
  isProcessing: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isProcessing }) => {
  const [formData, setFormData] = useState<Partial<DogData>>({});
  const [breedInput, setBreedInput] = useState('');
  const [showBreedSuggestions, setShowBreedSuggestions] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 頭文字検索機能（ひらがな・カタカナ対応）
  const normalizeText = (text: string) => {
    return text
      .replace(/[ぁ-ん]/g, (match) => String.fromCharCode(match.charCodeAt(0) + 0x60))
      .toLowerCase();
  };

  const filteredBreeds = dogBreeds.filter(breed => {
    if (!breedInput.trim()) return false;
    
    const normalizedBreed = normalizeText(breed.name);
    const normalizedInput = normalizeText(breedInput);
    
    // 頭文字検索：入力文字で始まる犬種のみを表示
    return normalizedBreed.startsWith(normalizedInput) || 
           breed.name.toLowerCase().startsWith(breedInput.toLowerCase());
  });

  const calculateAgeInMonths = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    return diffMonths;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!breedInput.trim() || !birthDate || !currentWeight) {
      return;
    }
    
    const ageMonths = calculateAgeInMonths(birthDate);
    
    const data: DogData = {
      breed: breedInput.trim(),
      gender: formData.gender,
      birthDate,
      ageMonths,
      currentWeight: parseFloat(currentWeight),
      photoUrl: photoPreview,
      additionalInfo: formData.additionalInfo
    };
    
    onSubmit(data);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectBreed = (breed: string) => {
    setBreedInput(breed);
    setShowBreedSuggestions(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">犬種</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 犬種入力 */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={breedInput}
              onChange={(e) => {
                setBreedInput(e.target.value);
                setShowBreedSuggestions(true);
              }}
              onFocus={() => setShowBreedSuggestions(true)}
              onBlur={() => setTimeout(() => setShowBreedSuggestions(false), 200)}
              placeholder="▼プルダウン選択"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          {showBreedSuggestions && breedInput && filteredBreeds.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredBreeds.slice(0, 10).map((breed) => (
                <button
                  key={breed.id}
                  type="button"
                  onClick={() => selectBreed(breed.name)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                >
                  {breed.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 性別 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">性別</h3>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                formData.gender === 'male'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              ♂ オス
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                formData.gender === 'female'
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              ♀ メス
            </button>
          </div>
        </div>

        {/* 生年月日 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">生年月日</h3>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* 現在の体重 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">現在点（今日）の体重</h3>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="w-full px-4 py-3 pr-8 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">g</span>
          </div>
        </div>

        {/* 写真アップロード */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">📷 写真（本日のもの）Upload</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          
          {photoPreview ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="アップロード済み"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">写真2</span>
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">写真3</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-4 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors"
              >
                写真を変更
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">写真1</span>
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">写真2</span>
                </div>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">写真3</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-4 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>写真を追加</span>
              </button>
            </div>
          )}
        </div>

        {/* AI予測ボタン */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!breedInput.trim() || !birthDate || !currentWeight || isProcessing}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>AIによる予測</span>
              </div>
            ) : (
              'AIによる予測'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;