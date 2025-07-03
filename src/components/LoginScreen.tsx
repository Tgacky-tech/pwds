import React, { useEffect, useState } from 'react';
import { Heart, Shield } from 'lucide-react';
import { initializeLiff, isLoggedIn, login, getProfile } from '../liff';

interface LoginScreenProps {
  onLogin: () => void;
  onNavigateToForm: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigateToForm }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  useEffect(() => {
    const init = async () => {
      await initializeLiff();

      if (isLoggedIn()) {
        // ログイン済みならプロフィール取得してonLogin呼び出し
        const profile = await getProfile();
        console.log('Logged in user:', profile);
        onLogin();
      }
    };
    init();
  }, [onLogin]);

  const handleLineLogin = () => {
    if (!agreedToTerms) return;
    
    if (!isLoggedIn()) {
      login();
      // login()はリダイレクトするため、この後の処理は通常不要
    } else {
      // すでにログイン済みならonLogin呼び出し
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            子犬の成犬時サイズ予測サービス
          </h1>
          <p className="text-gray-600 text-sm">
            AIが予測対象の子犬の未来を予測します
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">AI</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">成犬時サイズ予測サービス(体重・体長・体高を画像とともに)</p>
              <p className="text-xs text-gray-600">標準的な餌の量・運動でのサイズを表示します</p>
            </div>
          </div>
        </div>

        {/* Terms of Service */}
        <div className="mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-40 overflow-y-auto mb-4">
            <h3 className="font-bold text-sm mb-2">利用規約</h3>
            <div className="text-xs text-gray-700 space-y-2">
              <p>本サービス「犬成長予測サービス」（以下「本サービス」）をご利用いただくにあたり、以下の利用規約（以下「本規約」）にご同意いただく必要があります。</p>
              <p><strong>第1条（適用）</strong><br />本規約は、本サービスの利用に関して、当社と利用者との間の権利義務関係を定めるものとし、利用者による本サービスの利用に適用されます。</p>
              <p><strong>第2条（利用登録）</strong><br />本サービスの利用を希望する方は、本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。</p>
              <p><strong>第3条（サービス内容）</strong><br />本サービスは、AIを活用して犬の成長予測を行うサービスです。予測結果は参考情報であり、実際の成長を保証するものではありません。</p>
              <p><strong>第4条（個人情報の取扱い）</strong><br />当社は、利用者の個人情報を適切に管理し、法令に従って取り扱います。詳細はプライバシーポリシーをご確認ください。</p>
              <p><strong>第5条（禁止事項）</strong><br />利用者は、本サービスの利用にあたり、以下の行為をしてはなりません：<br />・法令または公序良俗に違反する行為<br />・犯罪行為に関連する行為<br />・本サービスの運営を妨害する行為</p>
              <p><strong>第6条（免責事項）</strong><br />当社は、本サービスに関して、利用者に発生した損害について一切の責任を負いません。</p>
            </div>
          </div>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700">
              利用規約に同意します
            </span>
          </label>
        </div>

        {/* LINE Login Button */}
        <button
          onClick={handleLineLogin}
          disabled={!agreedToTerms}
          className={`w-full font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-3 mb-6 ${
            agreedToTerms 
              ? 'bg-[#06C755] hover:bg-[#05b64a] text-white cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <span className="text-[#06C755] font-bold" style={{fontSize: '8px'}}>LINE</span>
          </div>
          <span>LINEでログイン</span>
        </button>

        {/* Temporary Form Link */}
        <div className="text-center mt-4">
          <button
            onClick={onNavigateToForm}
            className="text-blue-600 hover:underline text-sm"
          >
            フォーム画面へ（開発用）
          </button>
        </div>

        {/* Security Notice */}
        {/* <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-gray-600" />
            <p className="text-xs text-gray-600">
              お客様の情報は安全に保護されます
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default LoginScreen;
