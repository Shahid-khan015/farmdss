import { api as apiClient } from './api';

export interface FeedReading {
  feed_key: string;
  raw_value: string | null;
  numeric_value: number | null;
  unit: string;
  device_timestamp: string | null;
  lat: number | null;
  lon: number | null;
  status_label: 'normal' | 'warning' | 'critical';
}

export interface IotLatestResponse {
  device_id: string;
  feeds: FeedReading[];
}

export interface IotHistoryItem {
  id: string;
  feed_key: string;
  device_id: string;
  raw_value: string;
  numeric_value: number | null;
  unit: string;
  latitude: number | null;
  longitude: number | null;
  device_timestamp: string;
  session_id: string | null;
  created_at: string;
}

export interface IotHistoryResponse {
  total: number;
  limit: number;
  offset: number;
  items: IotHistoryItem[];
}

export async function getLatestFeeds(deviceId: string = 'default'): Promise<IotLatestResponse> {
  const response = await apiClient.get<IotLatestResponse>(`/iot/latest?device_id=${deviceId}`);
  return response.data;
}

export async function getFeedHistory(params: {
  feed_key: string;
  device_id?: string;
  session_id?: string;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
}): Promise<IotHistoryResponse> {
  const response = await apiClient.get<IotHistoryResponse>('/iot/history', { params });
  return response.data;
}

export const iotService = {
  getLatest: getLatestFeeds,
  getHistory: getFeedHistory,
};
