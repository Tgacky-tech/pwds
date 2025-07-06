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
              <p className="text-sm font-medium text-gray-800">子犬の成犬時サイズ予測サービス(体重・体長・体高を画像とともに)</p>
              <p className="text-xs text-gray-600">標準的な餌の量・運動でのサイズを表示します</p>
            </div>
          </div>
        </div>

        {/* Terms of Service */}
        <div className="mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-40 overflow-y-auto mb-4">
            <h3 className="font-bold text-sm mb-2">利用規約</h3>
            <div className="text-xs text-gray-700 space-y-2">
              <p>本利用規約（以下「本規約」）は、株式会社ペットウィズデジタル（以下「当社」）がLINE公式アカウントを通じて提供する成犬時のサイズ予測、アドバイス（健康管理、しつけ）、費用のシミュレーション、現在の体重チェックのサービス（以下「本サービス」）の利用条件を定めるものです。</p>
              <p><strong>第1条（適用）</strong><br />本規約は、本サービスの利用に関する当社と利用者との間のすべての関係に適用されます。また、利用者は、LINE株式会社が提供するLINEサービスの利用規約にも従うものとし、LINEプラットフォームに起因する問題について当社は責任を負いません。</p>
              <p><strong>第2条（サービスの内容）</strong><br />本サービスは、ペット（犬）の成犬時のサイズ予測、アドバイス（健康管理、しつけ）、費用のシミュレーション、現在の体重チェックの各サービスをLINE公式アカウントを通じて提供するものです。本サービスが提供する情報は、一般的な参考情報であり、医学的・獣医学的助言や診断・治療行為に代わるものではありません。</p>
              <p><strong>第3条（予測・アドバイス・シミュレーションに関する免責事項）</strong><br />本サービスの予測やアドバイス、シミュレーションは、過去の統計やアルゴリズム等に基づいており、個体差、飼育環境、遺伝的要因などにより実際の結果とは異なる可能性があります。本サービスの情報を参考にした判断や行動により利用者に損害が生じた場合でも、当社は一切の責任を負いません。</p>
              <p><strong>第4条（LINE通知と同意）</strong><br />本サービスは、LINEトークやリッチメニュー等を通じて情報提供や通知を行います。利用者はこれに同意の上、サービスを利用するものとします。</p>
              <p><strong>第5条（個人情報および提供データの取扱い）</strong><br />当社は、利用者から提供された情報を、株式会社ペットウィズデジタル プライバシーポリシーに基づき適切に取り扱います。利用者は、当社が本サービスの提供、運営、改善のため、これらの情報を利用することに同意するものとします。</p>
              <p><strong>第6条（禁止事項）</strong><br />利用者は、以下の行為をしてはなりません：<br />・法令または公序良俗に反する行為<br />・当社または第三者の権利を侵害する行為<br />・虚偽の情報を提供する行為<br />・LINEアカウントを不正に利用する行為<br />・本サービスの運営を妨げる行為</p>
              <p><strong>第7条（知的財産権）</strong><br />本サービスおよび本LINEアカウント上に表示されるコンテンツに関する著作権・商標権その他の知的財産権は、当社または正当な権利者に帰属します。</p>
              <p><strong>第8条（サービスの変更・停止・終了）</strong><br />当社は、事前の通知なく本サービスの全部または一部を変更・停止・終了することができます。これにより利用者に損害が生じた場合であっても、当社は一切の責任を負いません。</p>
              <p><strong>第9条（規約の変更）</strong><br />当社は、必要と判断した場合には、利用者への事前の通知なく本規約を変更することができます。</p>
              <p><strong>第10条（準拠法および合意管轄）</strong><br />本規約は日本法に準拠します。本サービスに関連して利用者と当社の間で生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
              <p><strong>第11条（未成年者の利用）</strong><br />未成年者が本サービスを利用する場合は、必ず保護者または法定代理人の同意を得たうえで利用してください。</p>
              <p><strong>第12条（商用利用および模倣の禁止）</strong><br />本サービスで提供される情報は、当社または正当な権利者に帰属するものです。利用者は、本サービスの内容を転載、複製、再配布、改変等により、自らまたは第三者のサービスとして展開する行為を行ってはなりません。</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-40 overflow-y-auto mb-4">
            <h3 className="font-bold text-sm mb-2">プライバシーポリシー</h3>
            <div className="text-xs text-gray-700 space-y-2">
              <p>株式会社ペットウィズデジタル（以下「当社」）は、当社が提供するLINE公式アカウントを通じたペット（犬）の成長時のサイズの予測、アドバイス（健康管理、しつけ）、費用のシミュレーション、現在の体重チェックの各サービス（以下「本サービス」）において取得する情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。</p>
              <p><strong>第１条（個人情報）</strong><br />「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。</p>
              <p><strong>第２条（取得する情報）</strong><br />当社は、本サービスの提供に際し、以下の情報を取得します：<br />・LINEログインによる情報（LINEユーザーID、表示名）<br />・利用者が入力する情報（犬種、犬の生年月日、性別、体重、犬の画像）<br />・利用状況に関する情報（予測ボタンを押した時刻および操作ログ、結果に対する評価）</p>
              <p><strong>第３条（利用目的）</strong><br />当社は、取得した情報を以下の目的で利用します：<br />・本サービスの提供、運営、改善のため<br />・ユーザーからのお問い合わせに回答するため<br />・新機能、更新情報、キャンペーン等の案内のため<br />・メンテナンス、重要なお知らせ等の連絡のため<br />・不正利用の防止のため<br />・研究開発・統計分析のため（個人が特定されない形に加工）</p>
              <p><strong>第４条（利用目的の変更）</strong><br />当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。</p>
              <p><strong>第５条（個人情報の第三者提供）</strong><br />当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。</p>
              <p><strong>第6条（個人情報の開示）</strong><br />当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。なお、個人情報の開示に際しては、1件あたり1、000円の手数料を申し受けます。</p>
              <p><strong>第７条（個人情報の訂正および削除）</strong><br />ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、当社に対して個人情報の訂正、追加または削除を請求することができます。</p>
              <p><strong>第８条（個人情報の利用停止等）</strong><br />当社は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去を求められた場合には、遅滞なく必要な調査を行います。</p>
              <p><strong>第９条（安全管理措置）</strong><br />当社は、取得した情報の漏えい、滅失、毀損等を防止するため、適切な安全管理措置を講じます。</p>
              <p><strong>第１０条（プライバシーポリシーの変更）</strong><br />当社は、必要に応じて本ポリシーを変更することがあります。変更後の内容は本サービス上に掲示し、掲示後に効力を生じるものとします。</p>
              <p><strong>第１１条（お問い合わせ）</strong><br />本ポリシーや取得した情報の取扱いに関するお問い合わせは、以下の窓口までご連絡ください：<br />株式会社ペットウィズデジタル<br />住所：〒651-0018 兵庫県神戸市中央区磯辺通1-1-18 707<br />メールアドレス：support@pet-with-digital.com</p>
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
              利用規約およびプライバシーポリシーに同意します
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
