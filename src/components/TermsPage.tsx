import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
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
            <h1 className="text-xl font-bold text-white">利用規約</h1>
          </div>

          <div className="p-6 prose prose-sm max-w-none">
            <h2>第1条（適用）</h2>
            <p>
              本規約は、当社が提供する子犬の成犬時サイズ予測サービス（以下「本サービス」）の利用条件を定めるものです。
              ユーザーは本規約に同意の上、本サービスをご利用ください。
            </p>

            <h2>第2条（利用登録）</h2>
            <p>
              本サービスの利用にはLINEアカウントによる認証が必要です。
              利用登録時に提供された情報に虚偽があった場合、当社は利用を停止することがあります。
            </p>

            <h2>第3条（サービス内容）</h2>
            <p>
              本サービスは、ユーザーが入力した犬の情報を基に、AIによる成長予測を提供します。
              予測結果は参考情報であり、実際の成長を保証するものではありません。
            </p>

            <h2>第4条（個人情報の取扱い）</h2>
            <p>
              当社は、ユーザーの個人情報を適切に管理し、プライバシーポリシーに従って取り扱います。
              入力された犬の情報は、サービス向上のために利用される場合があります。
            </p>

            <h2>第5条（禁止事項）</h2>
            <p>ユーザーは以下の行為を行ってはなりません：</p>
            <ul>
              <li>虚偽の情報を入力すること</li>
              <li>本サービスの運営を妨害すること</li>
              <li>他のユーザーに迷惑をかける行為</li>
              <li>法令に違反する行為</li>
            </ul>

            <h2>第6条（免責事項）</h2>
            <p>
              当社は、本サービスの予測結果の正確性について保証いたしません。
              本サービスの利用により生じた損害について、当社は責任を負いません。
            </p>

            <h2>第7条（サービスの変更・停止）</h2>
            <p>
              当社は、事前の通知なく本サービスの内容を変更、または停止することがあります。
            </p>

            <h2>第8条（規約の変更）</h2>
            <p>
              当社は、必要に応じて本規約を変更することがあります。
              変更後の規約は、本サービス上での掲示により効力を生じます。
            </p>

            <h2>第9条（準拠法・管轄裁判所）</h2>
            <p>
              本規約は日本法に準拠し、本サービスに関する紛争については、
              当社所在地を管轄する裁判所を専属的合意管轄とします。
            </p>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                制定日：2025年1月1日<br />
                最終更新日：2025年1月1日
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;