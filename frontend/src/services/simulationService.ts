import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { api } from './api';
import { getAccessToken } from './authStorage';
import { showSessionExpiredDialog } from './sessionExpired';
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

export async function downloadSimulationExport(
  simulationId: string,
  format: 'csv' | 'pdf',
): Promise<void> {
  const token = await getAccessToken();
  const baseUrl = api.defaults.baseURL ?? 'http://localhost:8000/api/v1';
  const url = `${baseUrl}/simulations/${simulationId}/export?format=${format}`;

  const ext = format === 'pdf' ? 'pdf' : 'csv';
  const filename = `simulation_${simulationId.slice(0, 8)}.${ext}`;
  const localUri = `${FileSystem.cacheDirectory}${filename}`;

  const downloadResult = await FileSystem.downloadAsync(url, localUri, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (downloadResult.status === 401) {
    showSessionExpiredDialog();
    throw new Error('Session expired. Please sign in again.');
  }
  if (downloadResult.status !== 200) {
    throw new Error(`Export failed (status ${downloadResult.status})`);
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(downloadResult.uri, {
    mimeType: format === 'pdf' ? 'application/pdf' : 'text/csv',
    dialogTitle: `Simulation Report - ${format.toUpperCase()}`,
    UTI: format === 'pdf' ? 'com.adobe.pdf' : 'public.comma-separated-values-text',
  });
}

