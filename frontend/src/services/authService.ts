import type {
  FarmerOptionResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types/auth';
import { api } from './api';
import { clearSession, getRefreshToken, persistSession, setAccessToken } from './authStorage';

/**
 * In-flight refresh, shared by every caller.
 *
 * Without this, a WebSocket reconnect and a concurrent 401 interceptor would each POST
 * to /auth/refresh. The backend rotates `user_sessions.access_token` on every refresh,
 * so the second response invalidates the first — one caller ends up holding a token the
 * server has already replaced. Coalescing to a single request removes that race.
 */
let inFlightRefresh: Promise<string | null> | null = null;

/**
 * Exchange the stored refresh token for a fresh access token.
 *
 * Returns the new access token, or `null` when the refresh token is itself expired or
 * missing — that is the only case where the user genuinely has to log in again, and the
 * only one a caller should surface.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    try {
      const refresh_token = await getRefreshToken();
      if (!refresh_token) return null;
      const { data } = await api.post<{ access_token: string }>('/auth/refresh', {
        refresh_token,
      });
      if (!data?.access_token) return null;
      await setAccessToken(data.access_token);
      return data.access_token;
    } catch {
      // A failed refresh is not itself an error worth surfacing; the caller decides.
      return null;
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials);
  await persistSession(data);
  return data;
}

export async function register(body: RegisterRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/register', body);
  return data;
}

export async function logoutRemote(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Still clear local session if the network fails.
  } finally {
    await clearSession();
  }
}

export function logoutLocalOnly(): Promise<void> {
  return clearSession();
}

export async function getFarmers(): Promise<FarmerOptionResponse[]> {
  const { data } = await api.get<FarmerOptionResponse[]>('/auth/farmers');
  return data;
}
