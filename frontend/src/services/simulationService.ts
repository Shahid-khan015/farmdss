import { api } from './api';
import type { PaginatedResponse, DeleteResponse } from '../types/api';
import type { Simulation, SimulationRunRequest } from '../types/simulation';

export const simulationService = {
  list: async (params?: { tractor_id?: string; implement_id?: string; limit?: number; offset?: number }) => {
    const { data } = await api.get<PaginatedResponse<Simulation>>('/simulations', { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get<Simulation>(`/simulations/${id}`);
    return data;
  },
  run: async (payload: SimulationRunRequest) => {
    const { data } = await api.post<Simulation>('/simulations/run', payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete<DeleteResponse>(`/simulations/${id}`);
    return data;
  },
  compare: async (ids: string[]) => {
    const params = new URLSearchParams();
    ids.forEach((id) => params.append('ids', id));
    const { data } = await api.get<Simulation[]>('/simulations/compare', { params });
    return data;
  },
};

