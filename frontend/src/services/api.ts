import axios, { isAxiosError } from 'axios';
import { Platform } from 'react-native';

import { NormalizedApiError, normalizeError } from './apiError';
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

    // Preserve the backend's error structure rather than flattening it to a string:
    // range-validation errors must reach the form fields they belong to, and engine
    // diagnostics must stay intact for the explainer. `NormalizedApiError` still
    // extends Error, so existing `.message` call sites are unaffected.
    return Promise.reject(new NormalizedApiError(normalizeError(err)));
  }
);
