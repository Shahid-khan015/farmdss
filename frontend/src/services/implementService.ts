import { api } from './api';
import type { PaginatedResponse, DeleteResponse } from '../types/api';
import type { Implement, ImplementCreate, ImplementUpdate } from '../types/implement';

export const implementService = {
  list: async (params?: {
    q?: string;
    implement_type?: string;
    manufacturer?: string;
    sort?: 'name' | 'weight';
    limit?: number;
    offset?: number;
  }) => {
    const { data } = await api.get<PaginatedResponse<Implement>>('/implements', { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get<Implement>(`/implements/${id}`);
    return data;
  },
  create: async (payload: ImplementCreate) => {
    const { data } = await api.post<Implement>('/implements', payload);
    return data;
  },
  update: async (id: string, payload: ImplementUpdate) => {
    const { data } = await api.put<Implement>(`/implements/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete<DeleteResponse>(`/implements/${id}`);
    return data;
  },
  listSimulations: async (id: string, params?: { limit?: number; offset?: number }) => {
    const { data } = await api.get(`/implements/${id}/simulations`, { params });
    return data as any;
  },
};

