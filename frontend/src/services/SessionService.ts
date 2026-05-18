import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { api } from './api';
import { getAccessToken } from './authStorage';
import { showSessionExpiredDialog } from './sessionExpired';

export interface PresetValueCreate {
  parameter_name: string;
  required_value?: number;
  required_min?: number;
  required_max?: number;
  unit: string;
  deviation_pct_warn?: number;
  deviation_pct_crit?: number;
}

export interface PresetValueResponse {
  id: string;
  session_id: string;
  parameter_name: string;
  required_value?: number;
  required_min?: number;
  required_max?: number;
  unit: string;
  deviation_pct_warn: number;
  deviation_pct_crit: number;
}

export interface SessionStartRequest {
  tractor_id: string;
  implement_id?: string;
  operation_type: string;
  client_farmer_id?: string;
  gps_tracking_enabled?: boolean;
  preset_values?: PresetValueCreate[];
}

export interface AlertResponse {
  id: string;
  session_id: string;
  feed_key: string;
  alert_type: string;
  alert_status: string;
  severity_color?: string | null;
  actual_value?: number;
  reference_value?: number;
  message: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  created_at: string;
}

export interface SessionResponse {
  id: string;
  tractor_id: string;
  tractor_name?: string | null;
  implement_id?: string;
  operator_id: string;
  operator_name?: string;
  tractor_owner_id?: string;
  client_farmer_id?: string;
  operation_type: string;
  started_at: string;
  ended_at?: string;
  status: string;
  gps_tracking_enabled: boolean;
  area_ha?: number;
  implement_width_m?: number;
  alerts_count?: number;
  unacknowledged_alerts?: number;
  total_cost_inr?: number;
  charge_per_ha_applied?: number;
  cost_note?: string;
  created_at: string;
}

export interface SessionDetailResponse extends SessionResponse {
  preset_values: PresetValueResponse[];
  alerts: AlertResponse[];
  field_observations: FieldObservationResponse[];
  total_duration_minutes?: number;
}

export interface GPSPathResponse {
  session_id: string;
  points: Array<{ lat: number; lon: number; timestamp: string }>;
  total_points: number;
  area_ha?: number;
  implement_width_m?: number;
}

export interface AreaSummaryResponse {
  session_id: string;
  area_ha?: number;
  implement_width_m?: number;
  total_gps_points: number;
  session_duration_minutes?: number;
  operation_type: string;
  status: string;
}

export interface AlertSummaryItem {
  id?: string;
  feed_key: string;
  alert_type: string;
  alert_status: string;
  severity_color?: string | null;
  actual_value?: number | null;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export interface SessionMetricSummary {
  feed_key: string;
  label: string;
  unit: string;
  samples: number;
  last_value?: number | null;
  avg_value?: number | null;
  min_value?: number | null;
  max_value?: number | null;
}

export interface PresetSummaryItem {
  parameter_name: string;
  target_value?: number | null;
  actual_value?: number | null;
  unit: string;
  deviation_pct?: number | null;
  status: string;
}

export interface SessionSummaryReport {
  session_id: string;
  operation_type: string;
  status: string;
  tractor_id: string;
  implement_id?: string | null;
  operator_id: string;
  operator_name?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_minutes?: number | null;
  area_ha?: number | null;
  total_distance_m?: number | null;
  total_cost_inr?: number | null;
  charge_per_ha_applied?: number | null;
  cost_note?: string | null;
  alerts: AlertSummaryItem[];
  field_observations: FieldObservationResponse[];
  observations_count: number;
  metrics: SessionMetricSummary[];
  preset_summaries: PresetSummaryItem[];
  total_alerts: number;
  unacknowledged_alerts: number;
}

export interface OperationChargeRead {
  id: string;
  owner_id: string;
  operation_type: string;
  charge_per_ha: number;
  charge_per_hour?: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface OperationChargeCreateInput {
  operation_type: string;
  charge_per_ha?: number;
  charge_per_hour?: number | null;
}

export interface OperationChargeUpdateInput {
  charge_per_ha?: number;
  charge_per_hour?: number | null;
}

export interface FieldObservationCreate {
  obs_type: 'soil_moisture' | 'cone_index';
  value: number;
  unit: string;
  lat?: number;
  lon?: number;
  notes?: string;
}

export async function startSession(data: SessionStartRequest): Promise<SessionResponse> {
  const { data: res } = await api.post<SessionResponse>('/sessions/start', data);
  return res;
}

export async function stopSession(sessionId: string): Promise<SessionResponse> {
  const { data } = await api.post<SessionResponse>(`/sessions/${sessionId}/stop`, {});
  return data;
}

export async function pauseSession(sessionId: string): Promise<SessionResponse> {
  const { data } = await api.patch<SessionResponse>(`/sessions/${sessionId}/pause`);
  return data;
}

export async function resumeSession(sessionId: string): Promise<SessionResponse> {
  const { data } = await api.patch<SessionResponse>(`/sessions/${sessionId}/resume`);
  return data;
}

export async function getActiveSessions(): Promise<SessionResponse[]> {
  const { data } = await api.get<SessionResponse[]>('/sessions/active');
  return data;
}

export async function getSessionDetail(sessionId: string): Promise<SessionDetailResponse> {
  const { data } = await api.get<SessionDetailResponse>(`/sessions/${sessionId}`);
  return data;
}

export async function getSessions(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<SessionResponse[]> {
  const { data } = await api.get<SessionResponse[]>('/sessions/', { params });
  return data;
}

export async function getGPSPath(sessionId: string): Promise<GPSPathResponse> {
  const { data } = await api.get<GPSPathResponse>(`/sessions/${sessionId}/gps-path`);
  return data;
}

export async function getAreaSummary(sessionId: string): Promise<AreaSummaryResponse> {
  const { data } = await api.get<AreaSummaryResponse>(`/sessions/${sessionId}/area-summary`);
  return data;
}

function parseReportNumber(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Normalize report JSON (snake/camel, numeric strings) so cost fields always wire to the UI. */
function normalizeSessionSummaryReport(raw: SessionSummaryReport): SessionSummaryReport {
  const r = raw as unknown as Record<string, unknown>;
  const total = parseReportNumber(r.total_cost_inr ?? r.totalCostInr);
  const rate = parseReportNumber(r.charge_per_ha_applied ?? r.chargePerHaApplied);
  const area = parseReportNumber(r.area_ha ?? r.areaHa);
  const dist = parseReportNumber(r.total_distance_m ?? r.totalDistanceM);
  const duration = parseReportNumber(r.duration_minutes ?? r.durationMinutes);
  return {
    ...raw,
    area_ha: area ?? raw.area_ha ?? null,
    total_distance_m: dist ?? raw.total_distance_m ?? null,
    duration_minutes: duration ?? raw.duration_minutes ?? null,
    total_cost_inr: total ?? raw.total_cost_inr ?? null,
    charge_per_ha_applied: rate ?? raw.charge_per_ha_applied ?? null,
  };
}

export async function getSessionReport(sessionId: string): Promise<SessionSummaryReport> {
  const { data } = await api.get<SessionSummaryReport>(`/reports/session/${sessionId}`);
  return normalizeSessionSummaryReport(data);
}

export async function getOperationCharges(): Promise<OperationChargeRead[]> {
  const { data } = await api.get<OperationChargeRead[]>('/operation-charges');
  return data;
}

export async function createOperationCharge(
  payload: OperationChargeCreateInput,
): Promise<OperationChargeRead> {
  const { data } = await api.post<OperationChargeRead>('/operation-charges', payload);
  return data;
}

export async function updateOperationCharge(
  chargeId: string,
  payload: OperationChargeUpdateInput,
): Promise<OperationChargeRead> {
  const { data } = await api.patch<OperationChargeRead>(`/operation-charges/${chargeId}`, payload);
  return data;
}

export async function addObservation(sessionId: string, data: FieldObservationCreate): Promise<any> {
  const { data: res } = await api.post(`/sessions/${sessionId}/observations`, data);
  return res;
}

export async function acknowledgeAlert(alertId: string): Promise<AlertResponse> {
  const { data } = await api.patch<AlertResponse>(`/alerts/${alertId}/acknowledge`);
  return data;
}

/**
 * Download a session report (CSV or PDF) and open the system share dialog.
 * Uses expo-file-system to write to cache, then expo-sharing to open.
 */
export async function downloadSessionExport(
  sessionId: string,
  format: 'csv' | 'pdf',
): Promise<void> {
  const token = await getAccessToken();
  const baseUrl = api.defaults.baseURL ?? 'http://localhost:8000/api/v1';
  const url = `${baseUrl}/reports/session/${sessionId}/export?format=${format}`;

  const ext = format === 'pdf' ? 'pdf' : 'csv';
  const filename = `session_${sessionId.slice(0, 8)}.${ext}`;
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
    dialogTitle: `Session Report — ${format.toUpperCase()}`,
    UTI: format === 'pdf' ? 'com.adobe.pdf' : 'public.comma-separated-values-text',
  });
}
