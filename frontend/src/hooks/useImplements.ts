import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { implementService } from '../services/implementService';
import type { ImplementCreate, ImplementUpdate } from '../types/implement';

export function useImplements(params?: {
  q?: string;
  implement_type?: string;
  manufacturer?: string;
  sort?: 'name' | 'weight';
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['implements', params ?? {}],
    queryFn: () => implementService.list(params),
  });
}

export function useImplement(id: string) {
  return useQuery({
    queryKey: ['implement', id],
    queryFn: () => implementService.get(id),
    enabled: !!id,
  });
}

export function useUpsertImplement() {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: (payload: ImplementCreate) => implementService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['implements'] }),
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ImplementUpdate }) =>
      implementService.update(id, payload),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['implements'] });
      qc.invalidateQueries({ queryKey: ['implement', v.id] });
    },
  });
  return { create, update };
}

export function useDeleteImplement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => implementService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['implements'] }),
  });
}

