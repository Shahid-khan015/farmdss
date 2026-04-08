import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { LoginRequest, RegisterRequest, UserResponse } from '../types/auth';
import { queryClient } from '../hooks/queryClient';
import * as authService from '../services/authService';
import { clearSession, loadPersistedSession } from '../services/authStorage';

type AuthContextValue = {
  user: UserResponse | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => ReturnType<typeof authService.login>;
  register: (body: RegisterRequest) => ReturnType<typeof authService.register>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { accessToken, user: storedUser } = await loadPersistedSession();
        if (cancelled) return;
        if (accessToken && storedUser) {
          setUser(storedUser);
        } else if (accessToken || storedUser) {
          await clearSession();
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    return authService.register(body);
  }, []);

  const logout = useCallback(async () => {
    await authService.logoutRemote();
    queryClient.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isReady, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
