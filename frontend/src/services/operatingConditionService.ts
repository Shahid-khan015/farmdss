import { api } from './api';
import type { PaginatedResponse, DeleteResponse } from '../types/api';
import type { OperatingConditionPreset } from '../types/operatingCondition';

export const operatingConditionService = {
  list: async (params?: { q?: string; limit?: number; offset?: number }) => {
    const { data } = await api.get<PaginatedResponse<OperatingConditionPreset>>(
      '/operating-conditions',
      { params }
    );
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get<OperatingConditionPreset>(`/operating-conditions/${id}`);
    return data;
  },
  create: async (payload: Omit<OperatingConditionPreset, 'id' | 'created_at' | 'updated_at'>) => {
    const { data } = await api.post<OperatingConditionPreset>('/operating-conditions', payload);
    return data;
  },
  update: async (
    id: string,
    payload: Partial<Omit<OperatingConditionPreset, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    const { data } = await api.put<OperatingConditionPreset>(`/operating-conditions/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete<DeleteResponse>(`/operating-conditions/${id}`);
    return data;
  },
};

