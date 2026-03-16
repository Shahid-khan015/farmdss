import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { simulationService } from '../services/simulationService';
import type { SimulationRunRequest } from '../types/simulation';

export function useSimulations(params?: { tractor_id?: string; implement_id?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['simulations', params ?? {}],
    queryFn: () => simulationService.list(params),
  });
}

export function useSimulation(id: string) {
  return useQuery({
    queryKey: ['simulation', id],
    queryFn: () => simulationService.get(id),
    enabled: !!id,
  });
}

export function useRunSimulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SimulationRunRequest) => simulationService.run(payload),
    onSuccess: (sim) => {
      qc.invalidateQueries({ queryKey: ['simulations'] });
      qc.setQueryData(['simulation', sim.id], sim);
    },
  });
}

export function useDeleteSimulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => simulationService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['simulations'] }),
  });
}

export function useCompareSimulations(ids: string[]) {
  return useQuery({
    queryKey: ['simulations-compare', ids],
    queryFn: () => simulationService.compare(ids),
    enabled: ids.length > 1,
  });
}

