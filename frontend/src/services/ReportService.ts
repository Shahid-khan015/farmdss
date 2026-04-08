import { api } from './api';

export interface SessionSummaryRow {
  id: string;
  started_at: string;
  ended_at: string | null;
  operation_type: string;
  area_ha: number | null;
  operator_name: string;
  wage_total: number | null;
}

export interface ReportSummary {
  total_sessions: number;
  total_area_ha: number;
  total_duration_hours: number;
  total_wages_paid: number;
  total_fuel_litres: number;
  total_fuel_cost: number;
  alert_counts: { warning: number; critical: number };
  sessions: SessionSummaryRow[];
}

type ReportSummaryApi = Omit<ReportSummary, 'sessions'> & {
  sessions: Array<Omit<SessionSummaryRow, 'wage_total'> & { wage_total_amount?: number | null }>;
};

export async function getReportSummary(params: {
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  operation_type?: string;
  tractor_id?: string;
}): Promise<ReportSummary> {
  const { data } = await api.get<ReportSummaryApi>('/reports/summary', { params });
  return {
    ...data,
    sessions: (data.sessions ?? []).map((s) => ({
      id: s.id,
      started_at: s.started_at,
      ended_at: s.ended_at,
      operation_type: s.operation_type,
      area_ha: s.area_ha,
      operator_name: s.operator_name,
      wage_total: s.wage_total_amount ?? null,
    })),
  };
}
