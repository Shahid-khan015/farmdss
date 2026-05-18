import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { tractorService } from '../services/tractorService';
import type { TractorCreate, TractorUpdate } from '../types/tractor';

export function useTractors(params?: {
  q?: string;
  manufacturer?: string;
  drive_mode?: string;
  sort?: 'name' | 'power';
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['tractors', params ?? {}],
    queryFn: () => tractorService.list(params),
  });
}

export function useTractor(id: string) {
  return useQuery({
    queryKey: ['tractor', id],
    queryFn: () => tractorService.get(id),
    enabled: !!id,
  });
}

export function useUpsertTractor() {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: (payload: TractorCreate) => tractorService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tractors'] }),
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TractorUpdate }) =>
      tractorService.update(id, payload),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['tractors'] });
      qc.invalidateQueries({ queryKey: ['tractor', v.id] });
    },
  });
  return { create, update };
}

export function useDeleteTractor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tractorService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tractors'] }),
  });
}

