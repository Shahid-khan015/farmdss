import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getLatestFeeds, type FeedReading } from '../services/iotService';
import {
  IOT_FEED_KEYS,
  type IoTFeedKey,
  type IoTFeedsMap,
} from '../types/iot';

const POLL_MS = 10000;
const UPDATE_COUNTER_MS = 1000;

function toFeedsMap(feeds: FeedReading[]): IoTFeedsMap {
  const map: IoTFeedsMap = {};
  for (const row of feeds) {
    const key = row.feed_key as IoTFeedKey;
    if (IOT_FEED_KEYS.includes(key)) {
      map[key] = row;
    }
  }
  return map;
}

function getOverallStatus(feeds: FeedReading[]): 'normal' | 'warning' | 'critical' {
  if (feeds.some((feed) => feed.status_label === 'critical')) return 'critical';
  if (feeds.some((feed) => feed.status_label === 'warning')) return 'warning';
  return 'normal';
}

export function useIoTDashboard(deviceId: string = 'default', pollMs: number = POLL_MS) {
  const mountedRef = useRef(true);
  const lastUpdatedRef = useRef<Date | null>(null);
  const [feeds, setFeeds] = useState<FeedReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

  const refresh = useCallback(async () => {
    const initialLoad = lastUpdatedRef.current === null && feeds.length === 0;
    if (initialLoad) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const data = await getLatestFeeds(deviceId);
      if (!mountedRef.current) return;
      setFeeds(data.feeds);
      setError(null);
      const updatedAt = new Date();
      lastUpdatedRef.current = updatedAt;
      setLastUpdatedAt(updatedAt);
      setSecondsSinceUpdate(0);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load IoT dashboard');
    } finally {
      if (!mountedRef.current) return;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [deviceId, feeds.length]);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();

    const pollTimer = setInterval(() => {
      if (mountedRef.current) {
        void refresh();
      }
    }, pollMs);

    const counterTimer = setInterval(() => {
      if (!mountedRef.current) return;
      if (!lastUpdatedRef.current) {
        setSecondsSinceUpdate(0);
        return;
      }
      setSecondsSinceUpdate(
        Math.max(0, Math.floor((Date.now() - lastUpdatedRef.current.getTime()) / 1000))
      );
    }, UPDATE_COUNTER_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(pollTimer);
      clearInterval(counterTimer);
    };
  }, [pollMs, refresh]);

  const feedsMap = useMemo(() => toFeedsMap(feeds), [feeds]);
  const overallStatus = useMemo(() => getOverallStatus(feeds), [feeds]);

  return {
    feedsMap,
    feeds,
    isLoading,
    isRefreshing,
    isFetching: isRefreshing,
    error,
    lastUpdatedAt,
    secondsSinceUpdate,
    overallStatus,
    refresh,
    refetch: refresh,
    deviceId,
    keyedFeeds: feedsMap,
  };
}
