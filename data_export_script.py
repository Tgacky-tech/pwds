# 必要ライブラリのインストール
# !pip install requests pandas
import datetime
import time

# 認証情報とSupabase設定
SUPABASE_URL = "https://sooyxifnzwyfkrkqpafb.supabase.co"
EMAIL = "csv_user@example.com"
PASSWORD = "uD!WiC92*DR$fy6"

# FLUX.1 API設定
REPLICATE_API_TOKEN = "dc_fa920707481072ba99eb280e2f3bd246f04be4e8ffce4c19b45c012fef9964b4149809b3d0ecacdf700de0d5332d25ac975a2851cfd1e23358f0be116c0d284e84e94efe35c30a9beb77f418f29b642917729872c48e05c4f5e65ae01ec4491948186e2bcbc8d1b58048c8086b24b6c4929ae5d9bd5a4e962cd13cbfafcd59f7"

# 認証してaccess_tokenを取得
import requests
import pandas as pd

auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
headers = {
    "Content-Type": "application/json",
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3l4aWZuend5Zmtya3FwYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTE3ODksImV4cCI6MjA2NjUyNzc4OX0.XKWHajV9agHwQv3xz1gL4P4IUtwES5uFykAV06CUb1s"
}

payload = {
    "email": EMAIL,
    "password": PASSWORD
}

try:
    auth_response = requests.post(auth_url, headers=headers, json=payload)
    auth_response.raise_for_status()
    access_token = auth_response.json()["access_token"]
    print("✅ 認証成功")
except Exception as e:
    print(f"❌ 認証エラー: {e}")
    exit()

# REST API経由でprediction_logsテーブルからデータ取得
data_url = f"{SUPABASE_URL}/rest/v1/prediction_logs"
data_headers = {
    "Authorization": f"Bearer {access_token}",
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3l4aWZuend5Zmtya3FwYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTE3ODksImV4cCI6MjA2NjUyNzc4OX0.XKWHajV9agHwQv3xz1gL4P4IUtwES5uFykAV06CUb1s",
    "Content-Type": "application/json"
}

# 必要な列のみを選択
params = {
    "select": "id,prediction_started_at,prediction_completed_at,line_user_id,display_name,purchase_source,has_purchase_experience,breed,gender,birth_date,current_weight,birth_weight,mother_adult_weight,father_adult_weight,predicted_weight,satisfaction_rating,satisfaction_rated_at",
    "order": "prediction_started_at.desc"
}

try:
    data_response = requests.get(data_url, headers=data_headers, params=params)
    data_response.raise_for_status()
    data = data_response.json()
    print(f"✅ データ取得成功: {len(data)}件")
except Exception as e:
    print(f"❌ データ取得エラー: {e}")
    exit()

# データが空でないかチェック
if not data:
    print("⚠️ データが見つかりません")
    exit()

# DataFrameに変換し、列名を日本語に変更
df = pd.DataFrame(data)

# 列名を日本語に変更
column_mapping = {
    "id": "ID",
    "prediction_started_at": "予測開始時刻",
    "prediction_completed_at": "予測完了時刻", 
    "line_user_id": "LINEユーザーID",
    "display_name": "表示名",
    "purchase_source": "購入元",
    "has_purchase_experience": "購入経験",
    "breed": "犬種",
    "gender": "性別",
    "birth_date": "生年月日",
    "current_weight": "現在の体重(kg)",
    "birth_weight": "出生時体重(kg)",
    "mother_adult_weight": "母犬成犬時体重(kg)",
    "father_adult_weight": "父犬成犬時体重(kg)",
    "predicted_weight": "予測体重(kg)",
    "satisfaction_rating": "満足度評価",
    "satisfaction_rated_at": "満足度評価時刻"
}

df = df.rename(columns=column_mapping)

# データの前処理
# 時刻フォーマットの調整（日本時間に変換）
time_columns = ["予測開始時刻", "予測完了時刻", "満足度評価時刻"]
for col in time_columns:
    if col in df.columns and not df[col].isna().all():
        # 時刻データを処理
        datetime_series = pd.to_datetime(df[col])
        if datetime_series.dt.tz is None:
            # タイムゾーン情報がない場合はUTCとして扱い日本時間に変換
            df[col] = datetime_series.dt.tz_localize('UTC').dt.tz_convert('Asia/Tokyo')
        else:
            # 既にタイムゾーン情報がある場合は日本時間に変換
            df[col] = datetime_series.dt.tz_convert('Asia/Tokyo')

# 満足度評価の日本語化
if "満足度評価" in df.columns:
    df["満足度評価"] = df["満足度評価"].map({"yes": "はい", "no": "いいえ"})

# 購入経験の日本語化
if "購入経験" in df.columns:
    df["購入経験"] = df["購入経験"].map({"yes": "はい", "no": "いいえ"})

# 性別の日本語化
if "性別" in df.columns:
    df["性別"] = df["性別"].map({"male": "オス", "female": "メス"})

# 購入元の日本語化
if "購入元" in df.columns:
    df["購入元"] = df["購入元"].map({"petshop": "ペットショップ", "breeder": "ブリーダー", "other": "その他"})

# FLUX.1による画像生成機能
def generate_dog_image(breed, gender, predicted_weight):
    """犬の品種、性別、予測体重から画像を生成"""
    
    # 性別の英語変換
    gender_en = "male" if gender == "オス" else "female"
    
    # プロンプト作成（人と一緒でサイズ感がわかるように）
    prompt = f"A realistic photo of an adult {gender_en} {breed} dog weighing approximately {predicted_weight}kg standing next to a person for size comparison, full body shot, high quality, professional photography"
    
    headers = {
        "Authorization": f"Token {REPLICATE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "version": "black-forest-labs/flux-1.1-pro",
        "input": {
            "prompt": prompt,
            "width": 1024,
            "height": 768,
            "num_outputs": 1,
            "guidance_scale": 3.5,
            "num_inference_steps": 28,
            "seed": None,
            "output_format": "png",
            "output_quality": 80
        }
    }
    
    try:
        # 画像生成リクエスト
        response = requests.post(
            "https://api.replicate.com/v1/predictions",
            headers=headers,
            json=data
        )
        response.raise_for_status()
        
        prediction = response.json()
        prediction_id = prediction["id"]
        
        # 生成完了まで待機
        while True:
            status_response = requests.get(
                f"https://api.replicate.com/v1/predictions/{prediction_id}",
                headers=headers
            )
            status_response.raise_for_status()
            
            result = status_response.json()
            
            if result["status"] == "succeeded":
                # デバッグ情報を表示
                print(f"🔍 API応答: {result}")
                output = result.get("output")
                if output and len(output) > 0:
                    return output[0]
                else:
                    print("❌ 出力が空です")
                    return None
            elif result["status"] == "failed":
                print(f"❌ 画像生成失敗: {result.get('error', 'Unknown error')}")
                return None
            
            time.sleep(2)  # 2秒待機
            
    except Exception as e:
        print(f"❌ 画像生成エラー: {e}")
        return None

# 成犬時サイズ感がわかる画像を1枚生成（最初のレコードのみ）
print("\n🎨 成犬時サイズ感画像生成...")
df["生成画像URL"] = ""

# 最初の有効なレコードのみ処理
for index, row in df.iterrows():
    if pd.notna(row["犬種"]) and pd.notna(row["性別"]) and pd.notna(row["予測体重(kg)"]):
        print(f"画像生成中: {row['犬種']} ({row['性別']}, {row['予測体重(kg)']}kg)")
        
        image_url = generate_dog_image(
            breed=row["犬種"],
            gender=row["性別"], 
            predicted_weight=row["予測体重(kg)"]
        )
        
        if image_url:
            df.at[index, "生成画像URL"] = image_url
            print(f"✅ 生成完了: {image_url}")
            print(f"🖼️ 成犬時サイズ感画像: {image_url}")
            
            # 画像をダウンロードして保存
            try:
                img_response = requests.get(image_url)
                img_response.raise_for_status()
                img_filename = f"dog_size_reference_{row['犬種']}_{predicted_weight}kg.png"
                with open(img_filename, 'wb') as f:
                    f.write(img_response.content)
                print(f"💾 画像保存完了: {img_filename}")
                
                # 画像をBase64エンコードしてHTML表示用に準備
                import base64
                with open(img_filename, 'rb') as f:
                    img_data = base64.b64encode(f.read()).decode()
                
                # HTMLファイルを生成して画像を表示
                html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>成犬時サイズ感画像</title>
    <style>
        body {{ font-family: Arial, sans-serif; text-align: center; padding: 20px; }}
        img {{ max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; }}
        h1 {{ color: #333; }}
        p {{ color: #666; }}
    </style>
</head>
<body>
    <h1>成犬時サイズ感画像</h1>
    <p>犬種: {row['犬種']} | 性別: {row['性別']} | 予測体重: {predicted_weight}kg</p>
    <img src="data:image/png;base64,{img_data}" alt="犬のサイズ感画像">
    <p>画像URL: <a href="{image_url}" target="_blank">{image_url}</a></p>
</body>
</html>
"""
                
                html_filename = f"dog_image_display_{row['犬種']}.html"
                with open(html_filename, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                print(f"🌐 HTML表示ファイル作成: {html_filename}")
                
            except Exception as e:
                print(f"❌ 画像保存エラー: {e}")
        else:
            print("❌ 生成失敗")
        
        break  # 1枚のみ生成

print("📊 データ概要:")
print(f"総レコード数: {len(df)}")
print(f"列数: {len(df.columns)}")
print("\n📝 列名一覧:")
for i, col in enumerate(df.columns, 1):
    print(f"{i:2d}. {col}")

# CSVとして出力
output_filename = "pwds_prediction_logs.csv"
df.to_csv(output_filename, index=False, encoding='utf-8-sig')
print(f"\n✅ CSVファイル作成完了: {output_filename}")

# データのプレビュー表示
print("\n📋 データプレビュー（最新5件）:")
preview_df = df.head()
for col in preview_df.columns:
    if len(str(col)) > 15:
        preview_df = preview_df.rename(columns={col: col[:12] + "..."})

print(preview_df.to_string(index=False))

# Google Colab環境の場合はダウンロード
try:
    from google.colab import files
    files.download(output_filename)
    print(f"\n⬇️ ファイルダウンロード開始: {output_filename}")
except ImportError:
    print(f"\n💾 ローカル環境でファイル保存完了: {output_filename}")