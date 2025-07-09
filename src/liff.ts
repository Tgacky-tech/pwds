import liff from '@line/liff';

const liffId = '2007620617-XvEYqgoO'; // LINE Developersで発行したLIFF IDを入れる

export const initializeLiff = async () => {
  try {
    console.log('🔄 LIFF初期化開始, ID:', liffId);
    await liff.init({ liffId });
    console.log('✅ LIFF初期化成功');
    console.log('📊 LIFF情報:', {
      isLoggedIn: liff.isLoggedIn(),
      isInClient: liff.isInClient(),
      context: liff.getContext(),
      version: liff.getVersion(),
      isApiAvailable: {
        shareTargetPicker: liff.isApiAvailable('shareTargetPicker'),
        scanCode: liff.isApiAvailable('scanCode'),
        bluetooth: liff.isApiAvailable('bluetooth')
      },
      os: liff.getOS(),
      language: liff.getLanguage(),
      lineVersion: liff.getLineVersion()
    });
  } catch (error) {
    console.error('❌ LIFF initialization failed', error);
    throw error;
  }
};

export const isLoggedIn = () => liff.isLoggedIn();

export const login = () => {
  if (!liff.isLoggedIn()) {
    console.log('🔐 LINEログイン開始...');
    liff.login();
  } else {
    console.log('✅ 既にログイン済み');
  }
};

export const logout = () => {
  if (liff.isLoggedIn()) {
    liff.logout();
  }
};

export const getProfile = async () => {
  if (liff.isLoggedIn()) {
    try {
      console.log('👤 プロフィール取得開始...');
      const profile = await liff.getProfile();
      console.log('✅ プロフィール取得成功:', profile);
      return profile;
    } catch (error) {
      console.error('❌ プロフィール取得失敗:', error);
      return null;
    }
  } else {
    console.log('❌ ログインしていないためプロフィール取得不可');
    return null;
  }
};