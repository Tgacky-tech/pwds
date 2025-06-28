import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, Star, Heart, TrendingUp } from 'lucide-react';

interface PaymentScreenProps {
  selectedFeature: string;
  onBack: () => void;
  onPaymentSuccess: () => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({
  selectedFeature,
  onBack,
  onPaymentSuccess
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !expiryDate || !securityCode) {
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex items-center">
        <button
          onClick={onBack}
          className="mr-3 p-1 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">有料機能パック</h2>
      </div>

      <div className="p-6">
        {/* Price and features */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-800 mb-2">¥980</div>
          <div className="text-sm text-gray-600 mb-4">全ての有料機能が利用可能</div>
          
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-700">体重診断（BCS）機能</span>
            </div>
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="text-sm text-gray-700">追加アドバイス機能</span>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">予測精度向上機能</span>
            </div>
          </div>
        </div>

        {/* Payment form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カード番号
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カード名義
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="TARO YAMADA"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                有効期限
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                セキュリティコード
              </label>
              <input
                type="text"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                placeholder="123"
                maxLength={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Security notice */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
            <Lock className="w-4 h-4 text-green-600" />
            <span>SSL暗号化により安全に決済されます</span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!cardNumber || !cardName || !expiryDate || !securityCode || isProcessing}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>決済処理中...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>¥980 を決済する</span>
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          決済完了後、すぐに全ての有料機能がご利用いただけます
        </p>
      </div>
    </div>
  );
};

export default PaymentScreen;