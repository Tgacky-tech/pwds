import liff from '@line/liff';

const liffId = '2007620617-XvEYqgoO'; // LINE Developersで発行したLIFF IDを入れる

export const initializeLiff = async () => {
  try {
    await liff.init({ liffId });
  } catch (error) {
    console.error('LIFF initialization failed', error);
  }
};

export const isLoggedIn = () => liff.isLoggedIn();

export const login = () => {
  if (!liff.isLoggedIn()) {
    liff.login();
  }
};

export const logout = () => {
  if (liff.isLoggedIn()) {
    liff.logout();
  }
};

export const getProfile = async () => {
  if (liff.isLoggedIn()) {
    return await liff.getProfile();
  }
  return null;
};