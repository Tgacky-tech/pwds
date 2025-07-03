import React, { useState } from 'react';
import { DogFormData, FormErrors } from '../types';
import { DOG_BREEDS } from '../data/dogBreeds';
import { validateForm, hasErrors } from '../utils/validation';
import { Camera, ChevronDown, ChevronUp, AlertCircle, Plus, X } from 'lucide-react';

interface FormScreenProps {
  onSubmit: (formData: DogFormData) => void;
}

const FormScreen: React.FC<FormScreenProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<DogFormData>({
    purchaseSource: '',
    hasPurchaseExperience: '',
    breed: '',
    fatherBreed: '',
    motherBreed: '',
    gender: '',
    birthDate: '',
    currentWeight: '',
    photos: [],
    birthWeight: '',
    pastWeights: [],
    motherAdultWeight: '',
    fatherAdultWeight: '',
    currentWeightVerified: false,
    motherWeightVerified: false,
    fatherWeightVerified: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showAccuracySection, setShowAccuracySection] = useState(false);
  const [breedSearch, setBreedSearch] = useState('');
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);

  const filteredBreeds = DOG_BREEDS.filter(breed =>
    breed.toLowerCase().includes(breedSearch.toLowerCase())
  );

  const handleInputChange = (field: keyof DogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.photos.length + files.length <= 2) {
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const addPastWeight = () => {
    setFormData(prev => ({
      ...prev,
      pastWeights: [...(prev.pastWeights || []), { date: '', weight: '' as any }]
    }));
  };

  const updatePastWeight = (index: number, field: 'date' | 'weight', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      pastWeights: (prev.pastWeights || []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePastWeight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pastWeights: (prev.pastWeights || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData, showAccuracySection);
    
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorElement = document.querySelector('.border-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    onSubmit(formData);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 px-6 py-4">
            <h1 className="text-xl font-bold text-white">予測する子犬の情報を入力してください</h1>
            <p className="text-green-100 text-sm mt-1">すべての必須項目を入力してください</p>
          </div>

          {/* Error Message */}
          {hasErrors(errors) && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-700 text-sm">
                  必須項目が入力されていないか、内容に誤りがあります。
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Purchase Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                購入元 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'petshop', label: 'ペットショップ' },
                  { value: 'breeder', label: 'ブリーダー' },
                  { value: 'other', label: 'その他' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="purchaseSource"
                      value={option.value}
                      checked={formData.purchaseSource === option.value}
                      onChange={(e) => handleInputChange('purchaseSource', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.purchaseSource && (
                <p className="text-red-500 text-xs mt-1">{errors.purchaseSource}</p>
              )}
            </div>

            {/* Purchase Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                購入経験の有無 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'yes', label: 'あり' },
                  { value: 'no', label: 'なし' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="hasPurchaseExperience"
                      value={option.value}
                      checked={formData.hasPurchaseExperience === option.value}
                      onChange={(e) => handleInputChange('hasPurchaseExperience', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.hasPurchaseExperience && (
                <p className="text-red-500 text-xs mt-1">{errors.hasPurchaseExperience}</p>
              )}
            </div>

            {/* Breed Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                犬種選択 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={breedSearch}
                  onChange={(e) => {
                    setBreedSearch(e.target.value);
                    setShowBreedDropdown(true);
                  }}
                  onFocus={() => setShowBreedDropdown(true)}
                  placeholder="犬種を入力または選択"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.breed ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {showBreedDropdown && filteredBreeds.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredBreeds.map((breed, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setBreedSearch(breed);
                          handleInputChange('breed', breed);
                          setShowBreedDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                      >
                        {breed}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.breed && (
                <p className="text-red-500 text-xs mt-1">{errors.breed}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                性別 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'male', label: 'オス' },
                  { value: 'female', label: 'メス' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                生年月日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.birthDate}
                max={today}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.birthDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.birthDate && (
                <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
              )}
            </div>

            {/* Current Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                現在の体重 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.currentWeight}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      handleInputChange('currentWeight', value);
                    }
                  }}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.currentWeight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 2.5"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">kg</span>
              </div>
              {errors.currentWeight && (
                <p className="text-red-500 text-xs mt-1">{errors.currentWeight}</p>
              )}
              {/* Weight verification checkbox */}
              <div className="mt-3">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.currentWeightVerified || false}
                    onChange={(e) => handleInputChange('currentWeightVerified', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span>入力している体重は自分で確認したものです</span>
                </label>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                現在の写真 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`アップロード済み写真 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.photos.length < 2 && (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">写真を追加</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        multiple
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                  顔と体型全体がわかる画像のアップロードをお勧めします。アップロードされた写真は予測精度向上のために利用しますが、「顔つき」「毛の色や模様」といった個別の特徴を、生成される成犬の画像へ忠実に反映させることはできません。
                </p>
              </div>
              {errors.photos && (
                <p className="text-red-500 text-xs mt-1">{errors.photos}</p>
              )}
            </div>

            {/* Accuracy Improvement Section */}
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowAccuracySection(!showAccuracySection)}
                className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors"
              >
                <span className="font-medium text-gray-800">さらに予測精度を上げたい方はこちら</span>
                {showAccuracySection ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {showAccuracySection && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                  {/* Birth Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      出生時の体重 (kg)
                    </label>
                    <input
                      type="text"
                      value={formData.birthWeight}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          handleInputChange('birthWeight', value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: 0.15"
                    />
                  </div>

                  {/* Past Weights */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        過去の体重記録 {showAccuracySection && <span className="text-red-500">*</span>}
                      </label>
                      <button
                        type="button"
                        onClick={addPastWeight}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">追加</span>
                      </button>
                    </div>
                    {(formData.pastWeights || []).map((record, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="date"
                          value={record.date}
                          min={formData.birthDate}
                          max={today}
                          onChange={(e) => updatePastWeight(index, 'date', e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`pastWeight_${index}_date`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <input
                          type="text"
                          value={record.weight}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              updatePastWeight(index, 'weight', value);
                            }
                          }}
                          className={`w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`pastWeight_${index}_weight`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="例: 1.2"
                        />
                        <button
                          type="button"
                          onClick={() => removePastWeight(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {errors.pastWeights && (
                      <p className="text-red-500 text-xs mt-1">{errors.pastWeights}</p>
                    )}
                    {Object.keys(errors).filter(key => key.startsWith('pastWeight_')).map(key => (
                      <p key={key} className="text-red-500 text-xs mt-1">{errors[key]}</p>
                    ))}
                  </div>

                  {/* Parent Weights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        母親の成犬時体重 (kg) {showAccuracySection && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.motherAdultWeight}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            handleInputChange('motherAdultWeight', value);
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.motherAdultWeight ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="例: 3.2"
                      />
                      {errors.motherAdultWeight && (
                        <p className="text-red-500 text-xs mt-1">{errors.motherAdultWeight}</p>
                      )}
                      {/* Mother weight verification checkbox */}
                      <div className="mt-2">
                        <label className="flex items-center space-x-2 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={formData.motherWeightVerified || false}
                            onChange={(e) => handleInputChange('motherWeightVerified', e.target.checked)}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                          />
                          <span>入力している体重は自分で確認したものです</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        父親の成犬時体重 (kg) {showAccuracySection && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.fatherAdultWeight}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            handleInputChange('fatherAdultWeight', value);
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.fatherAdultWeight ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="例: 3.8"
                      />
                      {errors.fatherAdultWeight && (
                        <p className="text-red-500 text-xs mt-1">{errors.fatherAdultWeight}</p>
                      )}
                      {/* Father weight verification checkbox */}
                      <div className="mt-2">
                        <label className="flex items-center space-x-2 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={formData.fatherWeightVerified || false}
                            onChange={(e) => handleInputChange('fatherWeightVerified', e.target.checked)}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                          />
                          <span>入力している体重は自分で確認したものです</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                成犬時の予測を見る
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormScreen;