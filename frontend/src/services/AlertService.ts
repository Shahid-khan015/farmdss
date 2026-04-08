import { api } from './api';
import { getSessionDetail } from './SessionService';

export interface AlertResponse {
  id: string;
  session_id: string | null;
  feed_key: string;
  alert_type: string;
  alert_status: string;
  severity_color: string | null;
  actual_value: number | null;
  reference_value?: number | null;
  message: string;
  acknowledged: boolean;
  acknowledged_at?: string | null;
  created_at: string;
}

function fallbackSeverityColor(alertStatus: string): string | null {
  if (alertStatus === 'critical') return 'red';
  if (alertStatus === 'warning') return 'orange';
  if (alertStatus === 'normal') return 'yellow';
  return null;
}

function normalizeAlert(alert: Partial<AlertResponse> & { id: string; feed_key: string; alert_type: string; alert_status: string; message: string; acknowledged: boolean; created_at: string }): AlertResponse {
  return {
    id: alert.id,
    session_id: alert.session_id ?? null,
    feed_key: alert.feed_key,
    alert_type: alert.alert_type,
    alert_status: alert.alert_status,
    severity_color: alert.severity_color ?? fallbackSeverityColor(alert.alert_status),
    actual_value: alert.actual_value ?? null,
    reference_value: alert.reference_value ?? null,
    message: alert.message,
    acknowledged: alert.acknowledged,
    acknowledged_at: alert.acknowledged_at ?? null,
    created_at: alert.created_at,
  };
}

export async function fetchAlerts(params: {
  session_id?: string;
  acknowledged?: boolean;
  severity_color?: string;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; items: AlertResponse[] }> {
  try {
    const { data } = await api.get<{ total?: number; items?: AlertResponse[] }>('/alerts', { params });
    const items = (data.items ?? []).map(normalizeAlert);
    return {
      total: data.total ?? items.length,
      items,
    };
  } catch (error) {
    if (!params.session_id) throw error;

    const detail = await getSessionDetail(params.session_id);
    let items = (detail.alerts ?? []).map(normalizeAlert);

    if (typeof params.acknowledged === 'boolean') {
      items = items.filter((item) => item.acknowledged === params.acknowledged);
    }
    if (params.severity_color) {
      items = items.filter((item) => item.severity_color === params.severity_color);
    }
    if (typeof params.offset === 'number' && params.offset > 0) {
      items = items.slice(params.offset);
    }
    if (typeof params.limit === 'number') {
      items = items.slice(0, params.limit);
    }

    return {
      total: items.length,
      items,
    };
  }
}

export async function acknowledgeAlert(alertId: string): Promise<AlertResponse> {
  const { data } = await api.patch<AlertResponse>(`/alerts/${alertId}/acknowledge`);
  return normalizeAlert(data);
}
