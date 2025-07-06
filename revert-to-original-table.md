# 元のテーブル名に戻す方法

現在のコードは `prediction_logs_v2` を使用していますが、新しいテーブルが作成されていないため、元の `prediction_logs` テーブルを使用するように戻すことができます。

## 変更が必要なファイル:

1. `src/utils/supabaseApi.ts`
2. `src/utils/supabaseUpdate.ts` 
3. `src/utils/liffCompatibleApi.ts`
4. `src/utils/reliableSupabaseApi.ts`

## 一括置換コマンド:

```bash
# 全ファイルでprediction_logs_v2をprediction_logsに戻す
find src -name "*.ts" -exec sed -i '' 's/prediction_logs_v2/prediction_logs/g' {} \;
```

## または手動で変更:

各ファイルで `prediction_logs_v2` を `prediction_logs` に置換してください。