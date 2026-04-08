import type {
  FarmerOptionResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types/auth';
import { api } from './api';
import { clearSession, persistSession } from './authStorage';

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
