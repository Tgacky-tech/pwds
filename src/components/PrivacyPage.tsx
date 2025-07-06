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

          <div className="p-6 prose prose-sm max-w-none text-sm leading-relaxed">
            <h2 className="text-lg font-bold mt-6 mb-3">プライバシーポリシー</h2>
            <p className="mb-4">
              株式会社ペットウィズデジタル（以下「当社」といいます）は、当社が提供するLINE公式アカウントを通じたペット（犬）の成長時のサイズの予測、アドバイス（健康管理、しつけ）、費用のシミュレーション、現在の体重チェックの各サービス（以下「本サービス」）において取得する情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
            </p>

            <h3 className="text-md font-bold mt-5 mb-2">第１条（個人情報）</h3>
            <p className="mb-3">
              「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
            </p>

            <h3 className="text-md font-bold mt-5 mb-2">第２条（取得する情報）</h3>
            <p className="mb-2">当社は、本サービスの提供に際し、以下の情報を取得します。</p>
            <ol className="list-decimal list-inside mb-3 space-y-1">
              <li>LINEログインによる情報
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>LINEユーザーID</li>
                  <li>表示名</li>
                </ul>
              </li>
              <li>利用者が入力する情報
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>犬種</li>
                  <li>犬の生年月日</li>
                  <li>性別</li>
                  <li>体重</li>
                  <li>犬の画像</li>
                </ul>
              </li>
              <li>利用状況に関する情報
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>予測ボタンを押した時刻および操作ログ</li>
                  <li>結果に対する評価（「はい」「いいえ」）</li>
                </ul>
              </li>
            </ol>

            <h3 className="text-md font-bold mt-5 mb-2">第３条（利用目的）</h3>
            <p className="mb-2">当社は、取得した情報を以下の目的で利用します。</p>
            <ol className="list-decimal list-inside mb-3 space-y-1">
              <li>本サービスの提供、運営、改善のため</li>
              <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
              <li>ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等および当社が提供する他のサービスの案内やアンケート・お知らせ等をLINEまたはメールで送付するため</li>
              <li>メンテナンス、重要なお知らせなど必要に応じたご連絡を行うため</li>
              <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーを特定し、ご利用をお断りするため</li>
              <li>ユーザーがご自身の登録情報の閲覧、変更、削除、ご利用状況の確認を行えるようにするため</li>
              <li>サービスのアルゴリズムの精度向上等、研究開発・統計分析のため（個人が特定されない形に加工して利用します）</li>
              <li>利用者の利用傾向分析やマーケティング施策検討のため（個人が特定されない形に加工して利用します）</li>
              <li>上記の利用目的に付随する目的</li>
              <li>法令で認められる範囲でのその他正当な目的のため</li>
            </ol>

            <h3 className="text-md font-bold mt-5 mb-2">第４条（利用目的の変更）</h3>
            <ol className="list-decimal list-inside mb-3 space-y-1">
              <li>当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。</li>
              <li>利用目的の変更を行った場合には、変更後の目的について、当社所定の方法により、ユーザーに通知し、または本ウェブサイト上に公表するものとします。</li>
            </ol>

            <h3 className="text-md font-bold mt-5 mb-2">第５条（個人情報の第三者提供）</h3>
            <ol className="list-decimal list-inside mb-3 space-y-1">
              <li>当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
                <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                  <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                  <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                  <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
                  <li>予め次の事項を告知あるいは公表し、かつ当社が個人情報保護委員会に届出をしたとき
                    <ol className="list-decimal list-inside ml-4 mt-1">
                      <li>利用目的に第三者への提供を含むこと</li>
                      <li>第三者に提供されるデータの項目</li>
                      <li>第三者への提供の手段または方法</li>
                      <li>本人の求めに応じて個人情報の第三者への提供を停止すること</li>
                      <li>本人の求めを受け付ける方法</li>
                    </ol>
                  </li>
                </ol>
              </li>
              <li>前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします。
                <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                  <li>当社が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合</li>
                  <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合</li>
                  <li>個人情報を特定の者との間で共同して利用する場合であって、その旨並びに共同して利用される個人情報の項目、共同して利用する者の範囲、利用する者の利用目的および当該個人情報の管理について責任を有する者の氏名または名称について、あらかじめ本人に通知し、または本人が容易に知り得る状態に置いた場合</li>
                </ol>
              </li>
            </ol>

            <h3 className="text-md font-bold mt-5 mb-2">第6条（個人情報の開示）</h3>
            <ol className="list-decimal list-inside mb-3 space-y-1">
              <li>当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。なお、個人情報の開示に際しては、1件あたり1、000円の手数料を申し受けます。
                <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                  <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
                  <li>当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                  <li>その他法令に違反することとなる場合</li>
                </ol>
              </li>
              <li>前項の定めにかかわらず、履歴情報および特性情報などの個人情報以外の情報については、原則として開示いたしません。</li>
            </ol>

            <h3 className="text-md font-bold mt-5 mb-2">第７条（個人情報の訂正および削除）</h3>
            <ol className="list-decimal list-inside mb-3 space-y-1">
              <li>ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、当社に対して個人情報の訂正、追加または削除（以下、「訂正等」といいます。）を請求することができます。</li>
              <li>当社は、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。</li>
              <li>当社は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは遅滞なく、これをユーザーに通知します。</li>
            </ol>

            <h3 className="text-md font-bold mt-5 mb-2">第８条（個人情報の利用停止等）</h3>
            <ol className="list-decimal list-inside mb-3 space-y-1">
              <li>当社は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下、「利用停止等」といいます。）を求められた場合には、遅滞なく必要な調査を行います。</li>
              <li>前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。</li>
              <li>当社は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、遅滞なく、これをユーザーに通知します。</li>
              <li>前３項にかかわらず、利用停止等に多額の費用を有する場合その他利用停止等を行うことが困難な場合であって、ユーザーの権利利益を保護するために必要なこれに代わるべき措置をとれる場合は、この代替策を講じるものとします。</li>
            </ol>

            <h3 className="text-md font-bold mt-5 mb-2">第９条（安全管理措置）</h3>
            <p className="mb-3">
              当社は、取得した情報の漏えい、滅失、毀損等を防止するため、適切な安全管理措置を講じます。
            </p>

            <h3 className="text-md font-bold mt-5 mb-2">第１０条（プライバシーポリシーの変更）</h3>
            <p className="mb-3">
              当社は、必要に応じて本ポリシーを変更することがあります。変更後の内容は本サービス上に掲示し、掲示後に効力を生じるものとします。
            </p>

            <h3 className="text-md font-bold mt-5 mb-2">第１１条（お問い合わせ）</h3>
            <p className="mb-2">本ポリシーや取得した情報の取扱いに関するお問い合わせは、以下の窓口までご連絡ください。</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm">
                株式会社ペットウィズデジタル<br />
                住所：〒651-0018 兵庫県神戸市中央区磯辺通1-1-18 707<br />
                メールアドレス：support@pet-with-digital.com
              </p>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                制定日：2025年1月1日<br />
                最終更新日：2025年1月7日<br />
                株式会社ペットウィズデジタル
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;