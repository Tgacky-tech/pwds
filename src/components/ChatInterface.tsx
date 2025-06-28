import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, SkipForward, Plus, X } from 'lucide-react';
import { Message, DogData } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSubmit: (data: DogData) => void;
  isProcessing: boolean;
  hasStarted: boolean;
  onStart: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSubmit, 
  isProcessing, 
  hasStarted,
  onStart 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<DogData>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [breedInput, setBreedInput] = useState('');
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSkip = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleInput = (value: string | number | File | null) => {
    if (!isProcessing) {
      switch (currentStep) {
        case 0: // 犬種
          if (typeof value === 'string' && value.trim()) {
            setFormData(prev => ({ ...prev, breed: value.trim() }));
            setCurrentStep(1);
          }
          break;
        case 1: // 性別
          setFormData(prev => ({ ...prev, gender: value as 'male' | 'female' }));
          setCurrentStep(2);
          break;
        case 2: // 月齢
          setFormData(prev => ({ ...prev, ageMonths: Number(value) }));
          setCurrentStep(3);
          break;
        case 3: // 体重
          setFormData(prev => ({ ...prev, currentWeight: Number(value) }));
          setCurrentStep(4);
          break;
        case 4: // 写真
          if (value instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const photoUrl = e.target?.result as string;
              setPhotoPreview(photoUrl);
              setFormData(prev => ({ ...prev, photoUrl }));
              setCurrentStep(5);
            };
            reader.readAsDataURL(value);
          }
          break;
        case 5: // 追加情報
          if (typeof value === 'string') {
            setFormData(prev => ({ 
              ...prev, 
              additionalInfo: value,
              photoUrl: prev.photoUrl || null 
            }));
            
            // Submit the complete form
            if (formData.breed && formData.gender && formData.ageMonths && formData.currentWeight) {
              onSubmit({
                ...formData,
                breed: formData.breed,
                gender: formData.gender,
                ageMonths: formData.ageMonths,
                currentWeight: formData.currentWeight,
                photoUrl: formData.photoUrl || null,
                additionalInfo: value
              });
            }
          }
          break;
      }
    }
  };

  const getCurrentPrompt = () => {
    if (!hasStarted) {
      return (
        <button
          onClick={onStart}
          className="w-full bg-[#06C755] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#05b64a] transition-colors"
        >
          予測を始める
        </button>
      );
    }

    const renderSkipButton = (step: number) => (
      <button
        onClick={handleSkip}
        className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center space-x-1"
      >
        <SkipForward className="w-4 h-4" />
        <span>スキップ</span>
      </button>
    );

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={breedInput}
                onChange={(e) => setBreedInput(e.target.value)}
                placeholder="犬種を入力"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200"
                onKeyDown={e => {
                  if (e.key === 'Enter' && breedInput.trim()) {
                    handleInput(breedInput);
                  }
                }}
              />
              <button
                onClick={() => handleInput(breedInput)}
                disabled={!breedInput.trim()}
                className="px-4 py-2 rounded-lg bg-[#06C755] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <button
                onClick={() => handleInput('male')}
                className="flex-1 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200"
              >
                オス
              </button>
              <button
                onClick={() => handleInput('female')}
                className="flex-1 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200"
              >
                メス
              </button>
            </div>
            {renderSkipButton(1)}
          </div>
        );
      case 2:
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <button
                  key={month}
                  onClick={() => handleInput(month)}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200"
                >
                  {month}ヶ月
                </button>
              ))}
            </div>
            {renderSkipButton(2)}
          </div>
        );
      case 3:
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="体重を入力"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    handleInput(input.value);
                  }
                }}
              />
              <span>kg</span>
            </div>
            {renderSkipButton(3)}
          </div>
        );
      case 4:
        return (
          <div className="space-y-2">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer p-4 rounded-lg border-2 border-dashed border-gray-200 hover:bg-gray-50 text-center"
            >
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">クリックして写真をアップロード</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleInput(file);
                }}
              />
            </div>
            {renderSkipButton(4)}
          </div>
        );
      case 5:
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">追加情報（任意）</span>
              {!showAdditionalInfo && (
                <button
                  onClick={() => setShowAdditionalInfo(true)}
                  className="flex items-center space-x-1 text-[#06C755] hover:text-[#05b64a]"
                >
                  <Plus className="w-4 h-4" />
                  <span>追加</span>
                </button>
              )}
              {showAdditionalInfo && (
                <button
                  onClick={() => {
                    setShowAdditionalInfo(false);
                    setAdditionalInfo('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {showAdditionalInfo && (
              <div className="flex space-x-2">
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="その他の情報を入力（食事、運動量、既往歴など）"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 min-h-[100px]"
                />
              </div>
            )}
            <button
              onClick={() => handleInput(additionalInfo)}
              className="w-full bg-[#06C755] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#05b64a] transition-colors"
            >
              予測する
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-[#06C755] text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="メッセージ画像"
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
              )}
              <p className="whitespace-pre-line">{message.content}</p>
              {message.isProcessing && (
                <div className="mt-2 flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        {!isProcessing && getCurrentPrompt()}
      </div>
    </div>
  );
};

export default ChatInterface;