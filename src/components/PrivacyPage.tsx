import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 px-6 py-4 flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">プライバシーポリシー</h1>
          </div>

          <div className="p-6 prose prose-sm max-w-none">
            <h2>1. 個人情報の収集について</h2>
            <p>
              当社は、本サービスの提供にあたり、以下の個人情報を収集いたします：
            </p>
            <ul>
              <li>LINEアカウント情報（ユーザーID、表示名、プロフィール画像）</li>
              <li>入力された犬の情報（犬種、体重、写真等）</li>
              <li>サービス利用履歴</li>
            </ul>

            <h2>2. 個人情報の利用目的</h2>
            <p>収集した個人情報は、以下の目的で利用いたします：</p>
            <ul>
              <li>本サービスの提供・運営</li>
              <li>ユーザー認証</li>
              <li>サービス向上のための分析</li>
              <li>カスタマーサポート</li>
              <li>新サービスの開発・改善</li>
            </ul>

            <h2>3. 個人情報の第三者提供</h2>
            <p>
              当社は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供いたしません。
              ただし、以下の場合は除きます：
            </p>
            <ul>
              <li>法令に基づく開示要求があった場合</li>
              <li>ユーザーまたは第三者の生命・身体・財産を保護するために必要な場合</li>
              <li>サービス向上のため、統計的データとして利用する場合（個人を特定できない形式）</li>
            </ul>

            <h2>4. 個人情報の管理</h2>
            <p>
              当社は、個人情報の漏洩、滅失、毀損を防止するため、適切な安全管理措置を講じます。
              また、従業員に対して個人情報保護に関する教育を実施いたします。
            </p>

            <h2>5. 個人情報の保存期間</h2>
            <p>
              個人情報は、利用目的達成のために必要な期間保存いたします。
              ユーザーから削除要求があった場合、合理的な期間内に削除いたします。
            </p>

            <h2>6. Cookie等の利用</h2>
            <p>
              本サービスでは、サービス向上のためCookieを使用する場合があります。
              Cookieの使用を希望されない場合は、ブラウザの設定で無効にすることができます。
            </p>

            <h2>7. 個人情報に関するお問い合わせ</h2>
            <p>
              個人情報の開示、訂正、削除等をご希望の場合は、以下までお問い合わせください：
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                お問い合わせ先：support@dog-prediction.com<br />
                受付時間：平日 9:00-18:00
              </p>
            </div>

            <h2>8. プライバシーポリシーの変更</h2>
            <p>
              当社は、法令の変更等に伴い、本プライバシーポリシーを変更することがあります。
              変更後のプライバシーポリシーは、本サービス上での掲示により効力を生じます。
            </p>

            <h2>9. 外部サービスとの連携</h2>
            <p>
              本サービスは、LINE株式会社が提供するLINE Loginサービスを利用しています。
              LINE Loginの利用については、LINE株式会社のプライバシーポリシーも適用されます。
            </p>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                制定日：2025年1月1日<br />
                最終更新日：2025年1月1日<br />
                事業者：株式会社ドッグプレディクション
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;