import { api } from './api';
import type { PaginatedResponse, DeleteResponse } from '../types/api';
import type { Tractor, TractorCreate, TractorUpdate, TireSpecification } from '../types/tractor';

export const tractorService = {
  list: async (params?: {
    q?: string;
    manufacturer?: string;
    drive_mode?: string;
    sort?: 'name' | 'power';
    limit?: number;
    offset?: number;
  }) => {
    const { data } = await api.get<PaginatedResponse<Tractor>>('/tractors', { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get<Tractor>(`/tractors/${id}`);
    return data;
  },
  create: async (payload: TractorCreate) => {
    const { data } = await api.post<Tractor>('/tractors', payload);
    return data;
  },
  update: async (id: string, payload: TractorUpdate) => {
    const { data } = await api.put<Tractor>(`/tractors/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete<DeleteResponse>(`/tractors/${id}`);
    return data;
  },
  listSimulations: async (id: string, params?: { limit?: number; offset?: number }) => {
    const { data } = await api.get(`/tractors/${id}/simulations`, { params });
    return data as any;
  },
  getTires: async (tractorId: string) => {
    const { data } = await api.get<TireSpecification>(`/tractors/${tractorId}/tires`);
    return data;
  },
  upsertTires: async (tractorId: string, payload: Omit<TireSpecification, 'id' | 'tractor_id' | 'created_at' | 'updated_at'>) => {
    const { data } = await api.post<TireSpecification>(`/tractors/${tractorId}/tires`, payload);
    return data;
  },
};

