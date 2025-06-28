# Dog Growth Prediction Service

犬の成長予測サービス - LINE LIFF アプリケーション

## 機能

- 🐕 犬の成長予測（Gemini AI使用）
- 📊 体重評価・健康アドバイス
- 📝 満足度評価システム
- 💾 Supabaseデータベース連携
- 📱 LINE認証対応

## 技術スタック

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: LINE LIFF
- **AI**: Google Gemini API
- **Database**: Supabase
- **Icons**: Lucide React

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、以下の値を設定：

```bash
cp .env.example .env
```

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabaseデータベースセットアップ

`supabase-schema.sql`をSupabaseのSQL Editorで実行してテーブルを作成

### 4. 開発サーバー起動

```bash
npm run dev
```

## デプロイ

### Vercel

1. GitHubリポジトリを作成
2. Vercelでインポート
3. 環境変数を設定
4. デプロイ

### Netlify

1. GitHubリポジトリを作成
2. Netlifyでインポート
3. Build command: `npm run build`
4. Publish directory: `dist`
5. 環境変数を設定

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `VITE_GEMINI_API_KEY` | Google Gemini APIキー |
| `VITE_SUPABASE_URL` | SupabaseプロジェクトURL |
| `VITE_SUPABASE_ANON_KEY` | Supabase匿名キー |

## データベーススキーマ

### prediction_logs テーブル

利用ログと予測結果を保存するメインテーブル：

- ユーザー情報（LINE ID、表示名）
- 予測開始・完了時刻
- インプットデータ（犬種、体重等）
- アウトプットデータ（予測体重のみ）
- 満足度評価

## ライセンス

MIT License