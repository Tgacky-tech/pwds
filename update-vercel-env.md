# Vercel環境変数の更新手順

## Supabase設定の確認

**現在の正しい値:**
- **VITE_SUPABASE_URL**: `https://sooyxifnzwyfkrkqpafb.supabase.co`
- **VITE_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3l4aWZuend5Zmtya3FwYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTE3ODksImV4cCI6MjA2NjUyNzc4OX0.XKWHajV9agHwQv3xz1gL4P4IUtwES5uFykAV06CUb1s`

## Vercel環境変数の更新方法

### 方法1: Vercel Web UI
1. https://vercel.com/dashboard にアクセス
2. プロジェクト (pwds) を選択
3. **Settings** → **Environment Variables**
4. 以下の環境変数を確認・更新:

```
VITE_SUPABASE_URL = https://sooyxifnzwyfkrkqpafb.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3l4aWZuend5Zmtya3FwYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTE3ODksImV4cCI6MjA2NjUyNzc4OX0.XKWHajV9agHwQv3xz1gL4P4IUtwES5uFykAV06CUb1s
```

5. **Save** をクリック
6. **Redeploy** で本番環境を再デプロイ

### 方法2: Vercel CLI
```bash
# ローカルでVercel CLIを使用
vercel env add VITE_SUPABASE_URL
# 値: https://sooyxifnzwyfkrkqpafb.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY  
# 値: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3l4aWZuend5Zmtya3FwYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTE3ODksImV4cCI6MjA2NjUyNzc4OX0.XKWHajV9agHwQv3xz1gL4P4IUtwES5uFykAV06CUb1s

# 再デプロイ
vercel --prod
```

## 重要な注意点

1. **APIキーの改行除去**: JWTトークンは1行で設定
2. **スペース除去**: 前後のスペースを削除
3. **再デプロイ必須**: 環境変数変更後は必ず再デプロイ
4. **全環境設定**: Production, Preview, Development全てに設定

## 確認方法

更新後、以下で確認:
```bash
# 本番環境の環境変数確認
vercel env ls
```

## トラブルシューティング

もしまだエラーが続く場合:
1. ブラウザのキャッシュクリア
2. Vercelでの強制再デプロイ
3. 環境変数の値を再度確認