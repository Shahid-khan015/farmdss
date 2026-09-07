import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { api } from '../services/api';
import { refreshAccessToken } from '../services/authService';
import { clearSession, getAccessToken } from '../services/authStorage';
import { showSessionExpiredDialog } from '../services/sessionExpired';
import type { FeedReading } from '../services/iotService';
import { IOT_FEED_KEYS, type IoTFeedKey, type IoTFeedsMap } from '../types/iot';

/** Server close codes. Mirrors `backend/app/api/v1/routes/live.py`. */
const WS_UNAUTHORIZED = 4401; // token expired/invalid -> refresh and reconnect, silently
const WS_FORBIDDEN = 4403; // not allowed here -> stop and tell the user

const BACKOFF_START_MS = 1000;
const BACKOFF_MAX_MS = 30000;
/** Client ping, purely so the server's read loop sees traffic and detects drops. */
const PING_MS = 15000;
/**
 * How long the socket may be down before the UI is allowed to call itself degraded.
 * Comfortably longer than the 10 s polling fallback, so an ordinary reconnect — including
 * a token refresh — is never visible to the operator.
 */
const DEGRADED_AFTER_MS = 25000;

export interface LiveAlertFrame {
  id: string;
  feed_key: string;
  alert_type: string;
  alert_status: string;
  severity_color: string | null;
  message: string;
  acknowledged: boolean;
  created_at: string | null;
}

/** `http(s)://host/api/v1` -> `ws(s)://host/api/v1`. */
function toWebSocketBase(httpBase: string): string {
  if (httpBase.startsWith('https://')) return `wss://${httpBase.slice('https://'.length)}`;
  if (httpBase.startsWith('http://')) return `ws://${httpBase.slice('http://'.length)}`;
  return httpBase;
}

/**
 * Live telemetry for one session over a WebSocket, with silent recovery.
 *
 * Deliberately depends only on `[sessionId, enabled]`. `useIoTDashboard`'s effect depends
 * on `refresh`, which depends on `feeds.length` — harmless for a `setInterval`, fatal
 * here, because the socket would be torn down and reopened on every single frame.
 *
 * The caller keeps polling `/iot/latest` as a fallback; this hook only ever *adds* fresher
 * data. That is also what covers a cold start on a spun-down free-tier instance: the first
 * connect fails, the backoff retries, and the polling request is what wakes the container.
 */
export function useSessionLiveTelemetry(sessionId: string | null | undefined, enabled = true) {
  const [feedsMap, setFeedsMap] = useState<IoTFeedsMap>({});
  const [alerts, setAlerts] = useState<LiveAlertFrame[]>([]);
  const [connected, setConnected] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const [lastFrameAt, setLastFrameAt] = useState<Date | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const degradedRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(BACKOFF_START_MS);
  const closedByUsRef = useRef(false);
  const aliveRef = useRef(true);

  const clearTimers = useCallback(() => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    if (pingRef.current) {
      clearInterval(pingRef.current);
      pingRef.current = null;
    }
    if (degradedRef.current) {
      clearTimeout(degradedRef.current);
      degradedRef.current = null;
    }
  }, []);

  /** Close deliberately — call before navigating away so we do not race the server. */
  const close = useCallback(() => {
    closedByUsRef.current = true;
    clearTimers();
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket) {
      try {
        socket.close(1000, 'client done');
      } catch {
        // Already closing; nothing useful to do.
      }
    }
    setConnected(false);
  }, [clearTimers]);

  useEffect(() => {
    aliveRef.current = true;
    closedByUsRef.current = false;
    backoffRef.current = BACKOFF_START_MS;

    if (!sessionId || !enabled) {
      return () => {
        aliveRef.current = false;
      };
    }

    const scheduleReconnect = (immediate = false) => {
      if (!aliveRef.current || closedByUsRef.current) return;
      const delay = immediate ? 0 : backoffRef.current;
      backoffRef.current = Math.min(backoffRef.current * 2, BACKOFF_MAX_MS);
      reconnectRef.current = setTimeout(() => {
        void connect();
      }, delay);
    };

    const armDegraded = () => {
      if (degradedRef.current) return;
      degradedRef.current = setTimeout(() => {
        if (aliveRef.current) setDegraded(true);
      }, DEGRADED_AFTER_MS);
    };

    const connect = async (): Promise<void> => {
      if (!aliveRef.current || closedByUsRef.current) return;

      const token = await getAccessToken();
      if (!token) {
        // No credentials at all: nothing to retry with.
        return;
      }
      // baseURL, not EXPO_PUBLIC_API_URL: api.ts already downgraded a stale
      // `https://localhost` to http, and we want that same resolved value.
      const base = toWebSocketBase(String(api.defaults.baseURL ?? ''));
      const url = `${base}/sessions/${sessionId}/live`;

      let socket: WebSocket;
      try {
        socket = new WebSocket(url);
      } catch {
        armDegraded();
        scheduleReconnect();
        return;
      }
      socketRef.current = socket;

      socket.onopen = () => {
        // Auth by first message: React Native cannot set headers on web, and a token in
        // a query string ends up in access logs.
        try {
          socket.send(JSON.stringify({ token }));
        } catch {
          // The close handler will pick this up.
        }
      };

      socket.onmessage = (event: WebSocketMessageEvent) => {
        if (!aliveRef.current) return;
        let frame: any;
        try {
          frame = JSON.parse(String(event.data));
        } catch {
          return;
        }

        if (frame?.type === 'ready') {
          backoffRef.current = BACKOFF_START_MS;
          setConnected(true);
          setDegraded(false);
          if (degradedRef.current) {
            clearTimeout(degradedRef.current);
            degradedRef.current = null;
          }
          return;
        }

        if (frame?.type === 'reading') {
          const key = frame.feed_key as IoTFeedKey;
          if (!IOT_FEED_KEYS.includes(key)) return;
          const reading: FeedReading = {
            feed_key: frame.feed_key,
            raw_value: frame.raw_value ?? null,
            numeric_value: frame.numeric_value ?? null,
            unit: frame.unit ?? '',
            device_timestamp: frame.device_timestamp ?? null,
            lat: frame.lat ?? null,
            lon: frame.lon ?? null,
            status_label: frame.status_label ?? 'normal',
          };
          // Last write wins per feed. A provisional frame (pushed pre-persistence for
          // latency) is simply overwritten by the committed one that follows.
          setFeedsMap((prev) => ({ ...prev, [key]: reading }));
          setLastFrameAt(new Date());
          return;
        }

        if (frame?.type === 'alert') {
          setAlerts((prev) => [
            frame as LiveAlertFrame,
            ...prev.filter((a) => a.id !== frame.id),
          ]);
        }
      };

      socket.onerror = () => {
        // `onclose` always follows; handle it there so there is one recovery path.
      };

      socket.onclose = async (event: WebSocketCloseEvent) => {
        if (!aliveRef.current || closedByUsRef.current) return;
        setConnected(false);
        socketRef.current = null;
        if (pingRef.current) {
          clearInterval(pingRef.current);
          pingRef.current = null;
        }

        if (event?.code === WS_FORBIDDEN) {
          // Terminal: refreshing would not help and retrying would loop.
          setDegraded(true);
          return;
        }

        if (event?.code === WS_UNAUTHORIZED) {
          // The whole point of the requirement: recover without the operator noticing.
          // No error state is set on this path.
          const fresh = await refreshAccessToken();
          if (fresh) {
            backoffRef.current = BACKOFF_START_MS;
            scheduleReconnect(true);
            return;
          }
          // Only a dead refresh token reaches the user.
          await clearSession();
          showSessionExpiredDialog();
          return;
        }

        armDegraded();
        scheduleReconnect();
      };

      pingRef.current = setInterval(() => {
        const active = socketRef.current;
        if (active && active.readyState === 1) {
          try {
            active.send('ping');
          } catch {
            // The close handler will take it from here.
          }
        }
      }, PING_MS);
    };

    void connect();

    return () => {
      aliveRef.current = false;
      closedByUsRef.current = true;
      clearTimers();
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket) {
        try {
          socket.close(1000, 'unmount');
        } catch {
          // Nothing useful to do on teardown.
        }
      }
    };
    // Only these two. See the note on the hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, enabled]);

  const feeds = useMemo(() => Object.values(feedsMap).filter(Boolean) as FeedReading[], [feedsMap]);

  return { feedsMap, feeds, alerts, connected, degraded, lastFrameAt, close };
}
