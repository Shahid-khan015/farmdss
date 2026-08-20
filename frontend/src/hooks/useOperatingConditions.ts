import { useQuery } from '@tanstack/react-query';

import { operatingConditionService } from '../services/operatingConditionService';

/** Saved operating-condition presets, cached alongside the other resource queries. */
export function useOperatingConditions(params?: { q?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['operating-conditions', params ?? {}],
    queryFn: () => operatingConditionService.list(params),
  });
}
