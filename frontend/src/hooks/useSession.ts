import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getActiveSessions,
  getGPSPath,
  getSessionDetail,
  getSessions as fetchSessions,
  pauseSession as pauseSessionApi,
  resumeSession as resumeSessionApi,
  startSession as startSessionApi,
  stopSession as stopSessionApi,
  type FieldObservationCreate,
  type GPSPathResponse,
  type SessionDetailResponse,
  type SessionResponse,
  type SessionStartRequest,
} from '../services/SessionService';

type GPSPoint = { lat: number; lon: number; timestamp: string };

export function useActiveSession() {
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const data = await getActiveSessions();
      if (!mountedRef.current) return;
      setSessions(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch active sessions');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refetch();
    intervalRef.current = setInterval(() => {
      void refetch();
    }, 30000);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refetch]);

  const activeSession =
    sessions.find((s) => s.status === 'active') ??
    sessions.find((s) => s.status === 'paused') ??
    null;

  return { sessions, activeSession, isLoading, error, refetch };
}

export function useSessionActions() {
  const mountedRef = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    if (mountedRef.current) {
      setIsLoading(true);
      setError(null);
    }
    try {
      return await fn();
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Session action failed');
      }
      throw err;
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  const startSession = useCallback((data: SessionStartRequest) => run(() => startSessionApi(data)), [run]);
  const stopSession = useCallback((sessionId: string) => run(() => stopSessionApi(sessionId)), [run]);
  const pauseSession = useCallback((sessionId: string) => run(() => pauseSessionApi(sessionId)), [run]);
  const resumeSession = useCallback((sessionId: string) => run(() => resumeSessionApi(sessionId)), [run]);

  return { startSession, stopSession, pauseSession, resumeSession, isLoading, error };
}

export function useSessionDetail(sessionId: string | null) {
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [session, setSession] = useState<SessionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!sessionId) {
      if (mountedRef.current) {
        setSession(null);
        setIsLoading(false);
        setError(null);
      }
      return;
    }
    const shouldShowLoading = !session;
    if (mountedRef.current && shouldShowLoading) {
      setIsLoading(true);
    }
    if (mountedRef.current) setError(null);
    try {
      const data = await getSessionDetail(sessionId);
      if (!mountedRef.current) return;
      setSession(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch session detail');
    } finally {
      if (mountedRef.current && shouldShowLoading) setIsLoading(false);
    }
  }, [sessionId, session]);

  useEffect(() => {
    mountedRef.current = true;
    void refetch();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (sessionId) {
      intervalRef.current = setInterval(() => {
        void refetch();
      }, 10000);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refetch, sessionId]);

  if (!sessionId) {
    return { session: null, isLoading: false, error: null as string | null, refetch };
  }
  return { session, isLoading, error, refetch };
}

export function useSessions(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const mountedRef = useRef(true);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (mountedRef.current) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data = await fetchSessions({
        status: filters?.status,
        limit: filters?.limit,
        offset: filters?.offset,
      });
      if (!mountedRef.current) return;
      setSessions(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [filters?.status, filters?.limit, filters?.offset]);

  useEffect(() => {
    mountedRef.current = true;
    void refetch();
    return () => {
      mountedRef.current = false;
    };
  }, [refetch]);

  return { sessions, isLoading, error, refetch };
}

export function useGPSPath(sessionId: string | null) {
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [points, setPoints] = useState<GPSPoint[]>([]);
  const [areaHa, setAreaHa] = useState<number | null>(null);
  const [implementWidthM, setImplementWidthM] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session } = useSessionDetail(sessionId);

  const fetchPath = useCallback(async () => {
    if (!sessionId) {
      if (mountedRef.current) {
        setPoints([]);
        setAreaHa(null);
        setImplementWidthM(null);
        setTotalPoints(0);
        setIsLoading(false);
        setError(null);
      }
      return;
    }

    if (mountedRef.current) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data: GPSPathResponse = await getGPSPath(sessionId);
      if (!mountedRef.current) return;
      setPoints(data.points ?? []);
      setAreaHa(data.area_ha ?? null);
      setImplementWidthM(data.implement_width_m ?? null);
      setTotalPoints(data.total_points ?? 0);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch GPS path');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    mountedRef.current = true;
    void fetchPath();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (sessionId && session?.status === 'active') {
      intervalRef.current = setInterval(() => {
        void fetchPath();
      }, 30000);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId, session?.status, fetchPath]);

  return { points, areaHa, implementWidthM, totalPoints, isLoading, error };
}
