interface DataCrunchTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DataCrunchAuthManager {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

class DataCrunchAPI {
  private static instance: DataCrunchAPI;
  private auth: DataCrunchAuthManager = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null
  };

  private readonly CLIENT_ID = 'xnshOwygyzwnfkqXqf5Og';
  private readonly CLIENT_SECRET = 'LD0SBWSC31B5mrXPwq6jnw5g1mxh9ON6d19zKaI6p';
  private readonly BASE_URL = 'https://api.datacrunch.io/v1';

  private constructor() {}

  static getInstance(): DataCrunchAPI {
    if (!DataCrunchAPI.instance) {
      DataCrunchAPI.instance = new DataCrunchAPI();
    }
    return DataCrunchAPI.instance;
  }

  // アクセストークンを取得
  private async getAccessToken(): Promise<string> {
    // 既存のトークンが有効かチェック
    if (this.auth.accessToken && this.auth.expiresAt && Date.now() < this.auth.expiresAt) {
      return this.auth.accessToken;
    }

    // リフレッシュトークンがある場合は使用
    if (this.auth.refreshToken) {
      try {
        await this.refreshAccessToken();
        return this.auth.accessToken!;
      } catch (error) {
        console.warn('リフレッシュトークンでの更新に失敗:', error);
      }
    }

    // 新しいトークンを取得
    await this.generateNewToken();
    return this.auth.accessToken!;
  }

  // 新しいアクセストークンを生成
  private async generateNewToken(): Promise<void> {
    console.log('🔑 DataCrunch.io 新しいアクセストークンを取得中...');
    
    const response = await fetch(`${this.BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DataCrunch.io認証失敗:', response.status, errorText);
      throw new Error(`認証に失敗しました: ${response.status} - ${errorText}`);
    }

    const tokenData: DataCrunchTokenResponse = await response.json();
    
    this.auth.accessToken = tokenData.access_token;
    this.auth.refreshToken = tokenData.refresh_token;
    this.auth.expiresAt = Date.now() + (tokenData.expires_in * 1000) - 60000; // 1分早めに期限切れとする

    console.log('✅ DataCrunch.io アクセストークン取得完了');
  }

  // リフレッシュトークンでアクセストークンを更新
  private async refreshAccessToken(): Promise<void> {
    console.log('🔄 DataCrunch.io アクセストークンをリフレッシュ中...');
    
    const response = await fetch(`${this.BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.auth.refreshToken
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DataCrunch.io トークンリフレッシュ失敗:', response.status, errorText);
      throw new Error(`トークンリフレッシュに失敗しました: ${response.status} - ${errorText}`);
    }

    const tokenData: DataCrunchTokenResponse = await response.json();
    
    this.auth.accessToken = tokenData.access_token;
    this.auth.refreshToken = tokenData.refresh_token;
    this.auth.expiresAt = Date.now() + (tokenData.expires_in * 1000) - 60000;

    console.log('✅ DataCrunch.io アクセストークンリフレッシュ完了');
  }

  // 認証済みAPIリクエストを実行
  private async authenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getAccessToken();
    
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    return response;
  }

  // 残高を取得
  async getBalance(): Promise<{ balance: number; currency: string }> {
    console.log('💰 DataCrunch.io 残高を取得中...');
    
    const response = await this.authenticatedRequest('/balance');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 残高取得失敗:', response.status, errorText);
      throw new Error(`残高取得に失敗しました: ${response.status} - ${errorText}`);
    }

    const balanceData = await response.json();
    console.log('✅ 残高取得完了:', balanceData);
    
    return balanceData;
  }

  // インスタンス一覧を取得
  async getInstances(): Promise<any[]> {
    console.log('🖥️ DataCrunch.io インスタンス一覧を取得中...');
    
    const response = await this.authenticatedRequest('/instances');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ インスタンス一覧取得失敗:', response.status, errorText);
      throw new Error(`インスタンス一覧取得に失敗しました: ${response.status} - ${errorText}`);
    }

    const instancesData = await response.json();
    console.log('✅ インスタンス一覧取得完了:', instancesData);
    
    return instancesData;
  }

  // 利用可能なインスタンス種類を取得
  async getAvailableInstanceTypes(): Promise<any[]> {
    console.log('📋 DataCrunch.io 利用可能インスタンス種類を取得中...');
    
    const response = await this.authenticatedRequest('/instance-types');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ インスタンス種類取得失敗:', response.status, errorText);
      throw new Error(`インスタンス種類取得に失敗しました: ${response.status} - ${errorText}`);
    }

    const typesData = await response.json();
    console.log('✅ インスタンス種類取得完了:', typesData);
    
    return typesData;
  }
}

// シングルトンインスタンスをエクスポート
export const dataCrunchAPI = DataCrunchAPI.getInstance();

// 使用例関数
export const testDataCrunchAPI = async () => {
  try {
    console.log('🧪 DataCrunch.io API テスト開始');
    
    // 残高確認
    const balance = await dataCrunchAPI.getBalance();
    console.log('現在の残高:', balance);
    
    // 利用可能インスタンス種類確認  
    const instanceTypes = await dataCrunchAPI.getAvailableInstanceTypes();
    console.log('利用可能インスタンス種類:', instanceTypes);
    
    // インスタンス一覧確認
    const instances = await dataCrunchAPI.getInstances();
    console.log('現在のインスタンス:', instances);
    
    console.log('✅ DataCrunch.io API テスト完了');
    
  } catch (error) {
    console.error('❌ DataCrunch.io API テスト失敗:', error);
    throw error;
  }
};