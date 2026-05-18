import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { iotService } from '../services/iotService';
import type { IoTFeedsMap } from '../types/iot';
import { useIoTDashboard } from './useIoTDashboard';

export type GPSCoordinate = { latitude: number; longitude: number };

/**
 * GPS from `position_tracking`: latest point from dashboard + optional path from history.
 * Map UI should use `coordinate` / `pathCoordinates`; do not call the API here outside this hook.
 */
export function useGPSPath(deviceId: string = 'default') {
  const { feedsMap, isLoading: latestLoading, error: latestError, refetch: refetchLatest } =
    useIoTDashboard(deviceId);

  const pos = feedsMap.position_tracking;

  const historyQ = useQuery({
    queryKey: ['iot', 'history', 'position_tracking', deviceId],
    queryFn: () =>
      iotService.getHistory({
        feed_key: 'position_tracking',
        device_id: deviceId,
        limit: 300,
        offset: 0,
      }),
    staleTime: 10_000,
  });

  const coordinate: GPSCoordinate | null = useMemo(() => {
    if (pos?.lat != null && pos?.lon != null && !Number.isNaN(pos.lat) && !Number.isNaN(pos.lon)) {
      return { latitude: pos.lat, longitude: pos.lon };
    }
    return null;
  }, [pos?.lat, pos?.lon]);

  const pathCoordinates: GPSCoordinate[] = useMemo(() => {
    const items = historyQ.data?.items ?? [];
    const out: GPSCoordinate[] = [];
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (it.latitude != null && it.longitude != null) {
        out.push({ latitude: it.latitude, longitude: it.longitude });
      }
    }
    return out;
  }, [historyQ.data?.items]);

  const lastUpdated = pos?.device_timestamp ?? null;

  return {
    feeds: feedsMap as IoTFeedsMap,
    coordinate,
    pathCoordinates,
    lastUpdated,
    isLoading: latestLoading || historyQ.isLoading,
    error: latestError ?? historyQ.error,
    refetch: async () => {
      await Promise.all([refetchLatest(), historyQ.refetch()]);
    },
  };
}
