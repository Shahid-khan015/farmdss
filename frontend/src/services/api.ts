import axios, { isAxiosError } from 'axios';
import { Platform } from 'react-native';

import { getAccessToken } from './authStorage';
import { showSessionExpiredDialog } from './sessionExpired';

const DEFAULT_LOCAL_API_URL = 'http://localhost:8000/api/v1';
const USE_ADB_REVERSE =
  process.env.EXPO_PUBLIC_ANDROID_USE_ADB_REVERSE?.trim().toLowerCase() === 'true';

function mapLocalhostForAndroid(url: string): string {
  if (Platform.OS !== 'android') return url;
  if (USE_ADB_REVERSE) return url;
  // Android emulator: localhost/127.0.0.1 is the emulator itself, not the dev machine.
  return url.replace(/\/\/localhost(?=:)/i, '//10.0.2.2').replace(/\/\/127\.0\.0\.1(?=:)/, '//10.0.2.2');
}

function resolveBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();

  let base = configured || DEFAULT_LOCAL_API_URL;

  // Local dev commonly runs FastAPI over plain HTTP, so recover from a stale HTTPS env.
  base = base.replace(/^https:\/\/localhost(?=[:/]|$)/i, 'http://localhost');

  return mapLocalhostForAndroid(base);
}

const baseURL = resolveBaseUrl();

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

/** 401 on protected routes — expired/invalid access token. Skip auth endpoints (wrong password is also 401). */
function isSessionExpiredUnauthorized(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  if (error.response?.status !== 401) return false;
  const url = String(error.config?.url ?? '');
  if (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/logout')
  ) {
    return false;
  }
  return true;
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (isSessionExpiredUnauthorized(err)) {
      showSessionExpiredDialog();
    }

    const detail = err?.response?.data?.detail;
    const fallback = err?.message ?? 'Request failed';

    // FastAPI validation errors are often an array of objects with loc/msg/type.
    let message: string;
    if (Array.isArray(detail)) {
      const parts = detail.map((item: any) => {
        if (item && typeof item === 'object') {
          const loc = Array.isArray(item.loc) ? item.loc.join('.') : '';
          const msg = item.msg ? String(item.msg) : JSON.stringify(item);
          return loc ? `${loc}: ${msg}` : msg;
        }
        return String(item);
      });
      message = parts.join('\n');
    } else if (detail && typeof detail === 'object') {
      const validationErrors = Array.isArray((detail as any).errors) ? (detail as any).errors : null;
      if ((detail as any).status === 'validation_failed' && validationErrors) {
        message = validationErrors
          .map((item: any) => item?.message ?? JSON.stringify(item))
          .join('\n');
      } else {
        message = JSON.stringify(detail);
      }
    } else if (detail != null) {
      message = String(detail);
    } else {
      message = fallback;
    }

    return Promise.reject(new Error(message));
  }
);
