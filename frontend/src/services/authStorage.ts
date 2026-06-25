import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LoginResponse, UserResponse } from '../types/auth';

const KEY_ACCESS = 'auth_access_token';
const KEY_REFRESH = 'auth_refresh_token';
const KEY_USER = 'auth_user_json';

export async function persistSession(data: LoginResponse): Promise<void> {
  await AsyncStorage.multiSet([
    [KEY_ACCESS, data.access_token],
    [KEY_REFRESH, data.refresh_token],
    [KEY_USER, JSON.stringify(data.user)],
  ]);
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([KEY_ACCESS, KEY_REFRESH, KEY_USER]);
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_ACCESS);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_REFRESH);
}

export async function getStoredUser(): Promise<UserResponse | null> {
  const raw = await AsyncStorage.getItem(KEY_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
}

export async function loadPersistedSession(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
}> {
  const [[, accessToken], [, refreshToken], [, userRaw]] = await AsyncStorage.multiGet([
    KEY_ACCESS,
    KEY_REFRESH,
    KEY_USER,
  ]);
  let user: UserResponse | null = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as UserResponse;
    } catch {
      user = null;
    }
  }
  return { accessToken, refreshToken, user };
}
