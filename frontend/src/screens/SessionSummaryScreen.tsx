import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { useIoTDashboard } from '../hooks/useIoTDashboard';
import { useSessionDetail } from '../hooks/useSession';
import { useImplements } from '../hooks/useImplements';
import { useTractors } from '../hooks/useTractors';
import { downloadSessionExport, getAreaSummary, getSessionReport, type SessionSummaryReport } from '../services/SessionService';
import { borderRadius, spacing, typography } from '../theme';

function fmtDate(v?: string) {
  if (!v) return '-';
  return new Date(v).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function fmtDateTime(v?: string) {
  if (!v) return '-';
  return new Date(v).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtTime(v?: string) {
  if (!v) return '-';
  return new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDurationMinutes(total?: number | null): string {
  if (total == null || !Number.isFinite(total)) return '-';
  const mins = Math.max(0, Math.floor(total));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtArea(area?: number | null): string {
  if (area == null || !Number.isFinite(area)) return '--';
  return `${area.toFixed(2)} ha`;
}

function fmtDistance(metres?: number | null): string {
  if (metres == null || !Number.isFinite(metres)) return '--';
  if (metres >= 1000) return `${(metres / 1000).toFixed(2)} km`;
  return `${Math.round(metres)} m`;
}

function fmtMetricValue(value?: number | null, unit?: string): string {
  if (value == null || !Number.isFinite(value)) return '--';
  const precision = Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2;
  return `${value.toFixed(precision)}${unit ? ` ${unit}` : ''}`;
}

function fmtCurrencyInr(value?: number | null | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return '--';
  return `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toNum(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isBillingPerHour(operationType?: string | null): boolean {
  const o = (operationType ?? '').trim().toLowerCase();
  return o === 'threshing' || o === 'grading';
}

function fmtBillableHours(hours: number | null): string {
  if (hours == null || !Number.isFinite(hours)) return '--';
  return `${hours.toFixed(2)} h`;
}

function statusBadgeStyles(status: string) {
  if (status === 'completed') {
    return {
      backgroundColor: '#E9F8EE',
      textColor: colors.success,
      label: 'Completed',
    };
  }
  if (status === 'aborted') {
    return {
      backgroundColor: '#FDECEC',
      textColor: colors.danger,
      label: 'Aborted',
    };
  }
  if (status === 'paused') {
    return {
      backgroundColor: '#FFF3E0',
      textColor: colors.warning,
      label: 'Paused',
    };
  }
  return {
    backgroundColor: '#EEF2FF',
    textColor: colors.accent,
    label: status,
  };
}

function observationVisual(type?: string) {
  const normalized = (type ?? '').toLowerCase();
  if (normalized.includes('soil')) {
    return {
      icon: 'droplet' as const,
      backgroundColor: '#DBEAFE',
      iconColor: '#185FA5',
    };
  }
  return {
    icon: 'bar-chart-2' as const,
    backgroundColor: '#FEF3C7',
    iconColor: '#C55A11',
  };
}

/** Stable list row key for alerts (id from report; fallback for older payloads). */
function alertRowKey(alert: { id?: string; feed_key: string; created_at: string }): string {
  return alert.id ?? `${alert.feed_key}|${alert.created_at}`;
}

export function SessionSummaryScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const sessionId = route.params?.sessionId as string;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { session, isLoading, error } = useSessionDetail(sessionId);
  const iot = useIoTDashboard();
  const tractorsQ = useTractors({ limit: 100, offset: 0 });
  const implementsQ = useImplements({ limit: 100, offset: 0 });

  const [areaHa, setAreaHa] = useState<number | null>(null);
  const [implementWidthM, setImplementWidthM] = useState<number | null>(null);
  const [areaLoading, setAreaLoading] = useState(false);
  const [areaUnavailable, setAreaUnavailable] = useState(false);
  const [report, setReport] = useState<SessionSummaryReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'pdf' | null>(null);
  const reportFirstLoadRef = useRef(true);

  useEffect(() => {
    let alive = true;
    let elapsed = 0;
    let id: ReturnType<typeof setInterval> | null = null;

    const fetchArea = async () => {
      try {
        const sum = await getAreaSummary(sessionId);
        if (!alive) return;
        setAreaHa(sum.area_ha ?? null);
        setImplementWidthM(sum.implement_width_m ?? null);
        if (sum.area_ha != null && id) {
          clearInterval(id);
          id = null;
          setAreaLoading(false);
        }
      } catch {
        // keep polling window
      }
    };

    if (session?.area_ha != null) {
      setAreaHa(session.area_ha);
      setImplementWidthM(session.implement_width_m ?? null);
      setAreaLoading(false);
      return () => {};
    }

    setAreaLoading(true);
    setAreaUnavailable(false);
    void fetchArea();
    id = setInterval(() => {
      elapsed += 5000;
      if (elapsed >= 30000) {
        if (id) clearInterval(id);
        id = null;
        if (alive && areaHa == null) {
          setAreaUnavailable(true);
          setAreaLoading(false);
        }
        return;
      }
      void fetchArea();
    }, 5000);

    return () => {
      alive = false;
      if (id) clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, session?.area_ha]);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let attempts = 0;
    reportFirstLoadRef.current = true;

    const loadReport = async () => {
      const showLoading = reportFirstLoadRef.current;
      try {
        if (showLoading) setReportLoading(true);
        setReportError(null);
        const data = await getSessionReport(sessionId);
        if (!mounted) return;
        setReport(data);

        const hasMeaningfulSummary =
          (data.metrics?.length ?? 0) > 0 ||
          data.area_ha != null ||
          data.total_distance_m != null ||
          data.duration_minutes != null ||
          data.total_cost_inr != null ||
          (data.alerts?.length ?? 0) > 0 ||
          (data.field_observations?.length ?? 0) > 0;
        const liveSession = session?.status === 'active' || session?.status === 'paused';
        const completedSession = data.status === 'completed' || session?.status === 'completed';
        const hasCompletedCoreSummary =
          data.duration_minutes != null &&
          (data.area_ha != null || data.total_distance_m != null);
        const hasCompletedChargeSummary =
          data.total_cost_inr != null ||
          data.charge_per_ha_applied != null ||
          (data.cost_note != null && data.cost_note.trim().length > 0);

        attempts += 1;
        if (
          (liveSession && hasMeaningfulSummary) ||
          (!liveSession &&
            ((completedSession && ((hasCompletedCoreSummary && hasCompletedChargeSummary) || attempts >= 12)) ||
              (!completedSession && (hasMeaningfulSummary || attempts >= 6))))
        ) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (loadError) {
        if (!mounted) return;
        setReportError(loadError instanceof Error ? loadError.message : 'Failed to load session report');
      } finally {
        if (mounted) {
          if (reportFirstLoadRef.current) {
            setReportLoading(false);
            reportFirstLoadRef.current = false;
          }
        }
      }
    };

    void loadReport();
    intervalId = setInterval(() => {
      void loadReport();
    }, 5000);
    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionId, session?.status]);

  const tractorName = useMemo(() => {
    const tractor = tractorsQ.data?.items?.find((x) => x.id === session?.tractor_id);
    return tractor?.name ?? session?.tractor_id ?? '-';
  }, [tractorsQ.data?.items, session?.tractor_id]);

  const implementName = useMemo(() => {
    if (!session?.implement_id) return 'None';
    const implement = implementsQ.data?.items?.find((x) => x.id === session.implement_id);
    return implement?.name ?? session.implement_id;
  }, [implementsQ.data?.items, session?.implement_id]);

  const operatorName = useMemo(() => {
    const sessionAny = session as any;
    const reportAny = report as any;
    if (reportAny?.operator_name) return reportAny.operator_name;
    if (sessionAny?.operator_name) return sessionAny.operator_name;
    if (user?.id === session?.operator_id && user?.name) return user.name;
    return 'Assigned operator';
  }, [report, session, user?.id, user?.name]);

  const alerts = report?.alerts ?? session?.alerts ?? [];
  const warningCount = alerts.filter((a) => a.alert_status === 'warning').length;
  const criticalCount = alerts.filter((a) => a.alert_status === 'critical').length;
  const observations = report?.field_observations ?? session?.field_observations ?? [];
  const badge = statusBadgeStyles(session?.status ?? 'unknown');

  const presetRows = useMemo(() => {
    if (report?.preset_summaries?.length) {
      return report.preset_summaries.map((preset) => ({
        preset: {
          id: `${preset.parameter_name}-${preset.unit}`,
          parameter_name: preset.parameter_name,
          required_value: preset.target_value ?? null,
        },
        actual: preset.actual_value ?? null,
        status: preset.status,
      }));
    }
    if (!session?.preset_values?.length) return [];
    return session.preset_values.map((p) => ({
      preset: p,
      actual: null,
      status: 'unknown',
    }));
  }, [report?.preset_summaries, session?.preset_values]);

  const metricsByFeed = useMemo(
    () => Object.fromEntries((report?.metrics ?? []).map((metric) => [metric.feed_key, metric])),
    [report?.metrics],
  );

  const sessionStartedMs = useMemo(() => {
    if (!session?.started_at) return null;
    const parsed = new Date(session.started_at).getTime();
    return Number.isFinite(parsed) ? parsed : null;
  }, [session?.started_at]);

  const sessionFeedsMap = useMemo(() => {
    if (!sessionStartedMs) return iot.feedsMap;
    return Object.fromEntries(
      Object.entries(iot.feedsMap).map(([feedKey, reading]) => {
        if (!reading?.device_timestamp) return [feedKey, undefined];
        const readingMs = new Date(reading.device_timestamp).getTime();
        if (!Number.isFinite(readingMs) || readingMs < sessionStartedMs) return [feedKey, undefined];
        return [feedKey, reading];
      }),
    ) as typeof iot.feedsMap;
  }, [iot.feedsMap, sessionStartedMs]);

  const fallbackAvgSpeedValue =
    metricsByFeed.forward_speed?.avg_value ?? toNum(sessionFeedsMap.forward_speed?.numeric_value);
  const fallbackAvgSpeedUnit =
    metricsByFeed.forward_speed?.unit ?? sessionFeedsMap.forward_speed?.unit ?? 'km/h';

  /** Prefer API totals; derive rate × area (ha) or rate × hours (Threshing/Grading) when total missing. */
  const resolvedOperationBilling = useMemo(() => {
    const rate =
      toNum(report?.charge_per_ha_applied) ?? toNum(session?.charge_per_ha_applied);
    const area = toNum(areaHa) ?? toNum(report?.area_ha) ?? toNum(session?.area_ha);
    const apiTotal = toNum(report?.total_cost_inr) ?? toNum(session?.total_cost_inr);
    const perHour = isBillingPerHour(session?.operation_type);

    let durationMinutes: number | null =
      toNum(report?.duration_minutes) ?? toNum(session?.total_duration_minutes) ?? null;
    if (durationMinutes == null && session?.ended_at && session?.started_at) {
      const ms = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
      durationMinutes = Number.isFinite(ms) && ms >= 0 ? ms / 60000 : null;
    }
    const hours =
      durationMinutes != null && Number.isFinite(durationMinutes) ? durationMinutes / 60 : null;

    if (apiTotal != null) {
      return { rate, area, hours, perHour, total: apiTotal };
    }
    if (perHour && rate != null && hours != null) {
      return { rate, area, hours, perHour, total: Math.round(rate * hours * 100) / 100 };
    }
    if (!perHour && rate != null && area != null) {
      return { rate, area, hours, perHour, total: Math.round(rate * area * 100) / 100 };
    }
    return { rate, area, hours, perHour, total: null as number | null };
  }, [report, session, areaHa]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!session) return <ErrorMessage message="Session not found." />;

  const durationText =
    report?.duration_minutes != null
      ? fmtDurationMinutes(report.duration_minutes)
      : session.total_duration_minutes != null
        ? fmtDurationMinutes(session.total_duration_minutes)
        : (() => {
            const s = new Date(session.started_at).getTime();
            const e = session.ended_at ? new Date(session.ended_at).getTime() : Date.now();
            return fmtDurationMinutes((e - s) / 60000);
          })();

  const summaryCards = [
    { label: 'Duration', value: durationText, icon: 'clock' as const },
    { label: 'Area', value: fmtArea(areaHa ?? report?.area_ha ?? session.area_ha ?? null), icon: 'maximize-2' as const },
    { label: 'Distance', value: fmtDistance(report?.total_distance_m), icon: 'navigation' as const },
    {
      label: 'Avg Speed',
      value: fmtMetricValue(fallbackAvgSpeedValue, fallbackAvgSpeedUnit),
      icon: 'trending-up' as const,
    },
    { label: 'Alerts', value: `${report?.total_alerts ?? alerts.length} total`, icon: 'alert-triangle' as const },
    {
      label: 'Observations',
      value: `${report?.observations_count ?? observations.length} logs`,
      icon: 'eye' as const,
    },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.fixedHeaderShell, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.backButton} onPress={() => nav.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
              <Feather name="arrow-left" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>Session Summary</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 84 }]}
        showsVerticalScrollIndicator={false}
      >

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
          <Text style={[styles.statusBadgeText, { color: badge.textColor }]}>{badge.label}</Text>
        </View>
        <Text style={styles.statusMeta}>{fmtDateTime(session.started_at)}</Text>
      </View>

      <View style={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <View key={card.label} style={styles.summaryCard}>
            <View style={styles.summaryCardHead}>
              <Feather name={card.icon} size={14} color={colors.muted} />
              <Text style={styles.summaryLabel}>{card.label}</Text>
            </View>
            <Text style={styles.summaryValue}>{card.value}</Text>
          </View>
        ))}
      </View>

      <Card variant="elevated" spacing="comfortable" style={styles.areaHeroCard}>
        <Text style={styles.heroLabel}>Field Area Covered</Text>
        {areaLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.metaText}>Calculating field area...</Text>
          </View>
        ) : (areaHa ?? report?.area_ha ?? session.area_ha) != null ? (
          <Text style={styles.heroValue}>{fmtArea(areaHa ?? report?.area_ha ?? session.area_ha ?? null)}</Text>
        ) : (
          <Text style={styles.heroMuted}>{areaUnavailable ? 'Area unavailable' : '--'}</Text>
        )}
        <View style={styles.heroMeta}>
          <Text style={styles.metaText}>
            Implement width: {implementWidthM != null ? `${implementWidthM.toFixed(1)} m` : 'N/A'}
          </Text>
          <Text style={styles.metaText}>Method: GPS path (Shoelace + implement width)</Text>
          <Text style={styles.metaText}>{report?.total_alerts != null ? `${report.total_alerts} alerts in this session` : `${alerts.length} alerts in this session`}</Text>
          <Text style={styles.metaText}>
            {report?.metrics?.length ? `${report.metrics.length} tracked sensor metrics captured` : 'No sensor metrics captured'}
          </Text>
        </View>
      </Card>

      {report?.metrics?.length ? (
        <Card variant="elevated" spacing="default" style={styles.detailCard}>
          <Text style={styles.sectionLabel}>Session Work</Text>
          <View style={styles.metricsSummaryGrid}>
            <View style={styles.metricSummaryTile}>
              <Text style={styles.metricSummaryLabel}>Average Speed</Text>
              <Text style={styles.metricSummaryValue}>
                {fmtMetricValue(metricsByFeed.forward_speed?.avg_value, metricsByFeed.forward_speed?.unit)}
              </Text>
            </View>
            <View style={styles.metricSummaryTile}>
              <Text style={styles.metricSummaryLabel}>Average Depth</Text>
              <Text style={styles.metricSummaryValue}>
                {fmtMetricValue(metricsByFeed.depth_of_operation?.avg_value, metricsByFeed.depth_of_operation?.unit)}
              </Text>
            </View>
            <View style={styles.metricSummaryTile}>
              <Text style={styles.metricSummaryLabel}>Field Capacity</Text>
              <Text style={styles.metricSummaryValue}>
                {fmtMetricValue(metricsByFeed.field_capacity?.avg_value, metricsByFeed.field_capacity?.unit)}
              </Text>
            </View>
            <View style={styles.metricSummaryTile}>
              <Text style={styles.metricSummaryLabel}>Max Temperature</Text>
              <Text style={styles.metricSummaryValue}>
                {fmtMetricValue(metricsByFeed.gearbox_temperature?.max_value, metricsByFeed.gearbox_temperature?.unit)}
              </Text>
            </View>
          </View>

          <View style={styles.metricsList}>
            {report.metrics.map((metric) => (
              <View key={metric.feed_key} style={styles.metricDetailRow}>
                <View style={styles.metricDetailCopy}>
                  <Text style={styles.metricDetailTitle}>{metric.label}</Text>
                  <Text style={styles.metaText}>{metric.samples} samples recorded</Text>
                </View>
                <View style={styles.metricDetailValues}>
                  <Text style={styles.metricDetailValue}>
                    Avg {fmtMetricValue(metric.avg_value, metric.unit)}
                  </Text>
                  <Text style={styles.metaText}>
                    Min {fmtMetricValue(metric.min_value, metric.unit)} | Max {fmtMetricValue(metric.max_value, metric.unit)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <Card variant="elevated" spacing="default" style={styles.detailCard}>
        <Text style={styles.sectionLabel}>Alerts</Text>
        <View style={styles.badges}>
          <View style={[styles.badgePill, { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.badgePillText, { color: colors.warning }]}>Warnings: {warningCount}</Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: '#FDECEC' }]}>
            <Text style={[styles.badgePillText, { color: colors.danger }]}>Critical: {criticalCount}</Text>
          </View>
        </View>
        <View style={styles.listBlock}>
          {alerts.length === 0 ? (
            <Text style={styles.metaText}>No alerts recorded.</Text>
          ) : (
            alerts.slice(0, 3).map((alert) => (
              <View key={alertRowKey(alert)} style={styles.alertItem}>
                <View
                  style={[
                    styles.alertDot,
                    { backgroundColor: alert.alert_status === 'critical' ? colors.danger : colors.warning },
                  ]}
                />
                <View style={styles.alertCopy}>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.metaText}>{fmtTime(alert.created_at)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </Card>

      <Card variant="elevated" spacing="default" style={styles.detailCard}>
        <Text style={styles.sectionLabel}>Field Observations</Text>
        {observations.length === 0 ? (
          <Text style={styles.metaText}>No observations recorded during this session.</Text>
        ) : (
          <View style={styles.listBlock}>
            {observations.map((observation: any) => {
              const visual = observationVisual(observation.obs_type);
              return (
                <View key={observation.id} style={styles.observationItem}>
                  <View style={[styles.observationIconWrap, { backgroundColor: visual.backgroundColor }]}>
                    <Feather name={visual.icon} size={16} color={visual.iconColor} />
                  </View>
                  <View style={styles.observationCopy}>
                    <Text style={styles.observationTitle}>
                      {observation.obs_type} - <Text style={styles.observationValue}>{observation.value}{observation.unit}</Text>
                    </Text>
                    <Text style={styles.metaText}>
                      {observation.lat ?? '-'}, {observation.lon ?? '-'} - {fmtTime(observation.recorded_at)}
                    </Text>
                    {observation.notes ? <Text style={styles.notesText}>{observation.notes}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      <Card variant="elevated" spacing="comfortable" style={styles.costCard}>
        <View style={styles.costHeaderRow}>
          <View style={styles.costHeaderLeft}>
            <Feather name="calculator" size={16} color={colors.success} />
            <Text style={styles.sectionLabel}>Operation Charges</Text>
          </View>
          <View style={styles.operationPill}>
            <Text style={styles.operationPillText}>{session.operation_type}</Text>
          </View>
        </View>

        <View style={styles.detailRows}>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Date</Text>
            <Text style={styles.detailValue}>{fmtDate(session.started_at)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Operator</Text>
            <Text style={styles.detailValue}>{operatorName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Tractor</Text>
            <Text style={styles.detailValue}>{tractorName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Implement</Text>
            <Text style={styles.detailValue}>{implementName}</Text>
          </View>
        </View>

        <View style={styles.calculationBox}>
          <Text style={styles.calcTitle}>Calculation</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Rate</Text>
            <Text style={styles.detailValue}>
              {resolvedOperationBilling.rate != null
                ? `${fmtCurrencyInr(resolvedOperationBilling.rate).replace('.00', '')}${
                    resolvedOperationBilling.perHour ? '/hr' : '/ha'
                  }`
                : '--'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>
              {resolvedOperationBilling.perHour ? 'Billable time' : 'Area Covered'}
            </Text>
            <Text style={styles.detailValue}>
              {resolvedOperationBilling.perHour
                ? fmtBillableHours(resolvedOperationBilling.hours)
                : fmtArea(resolvedOperationBilling.area ?? null)}
            </Text>
          </View>
          <View style={styles.calcDivider} />
          <View style={styles.calcFormulaRow}>
            <Text style={styles.calcFormulaText}>
              {resolvedOperationBilling.perHour
                ? resolvedOperationBilling.rate != null && resolvedOperationBilling.hours != null
                  ? `${fmtCurrencyInr(resolvedOperationBilling.rate).replace('.00', '')} × ${resolvedOperationBilling.hours.toFixed(2)} h`
                  : 'Waiting for session duration / hourly rate'
                : resolvedOperationBilling.rate != null && resolvedOperationBilling.area != null
                  ? `${fmtCurrencyInr(resolvedOperationBilling.rate).replace('.00', '')} × ${resolvedOperationBilling.area.toFixed(2)} ha`
                  : 'Waiting for finalized area/rate'}
            </Text>
            <Text style={styles.calcFormulaText}>=</Text>
          </View>
          <View style={styles.totalChargeBox}>
            <View style={styles.totalChargeHeader}>
              <Text style={styles.totalChargeLabel}>Total Charges</Text>
              <Feather name="lock" size={14} color={colors.muted} />
            </View>
            {reportLoading && resolvedOperationBilling.total == null ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.metaText}>Calculating...</Text>
              </View>
            ) : (
              <Text style={styles.totalChargeValue}>
                {resolvedOperationBilling.total != null
                  ? fmtCurrencyInr(resolvedOperationBilling.total).replace('.00', '')
                  : '--'}
              </Text>
            )}
            <Text style={styles.totalChargeFootnote}>System computed - not editable</Text>
            {report?.cost_note || session.cost_note ? (
              <Text style={styles.metaText}>{report?.cost_note ?? session.cost_note}</Text>
            ) : null}
            {reportError ? <Text style={styles.metaText}>{reportError}</Text> : null}
          </View>
        </View>
      </Card>

      {presetRows.length > 0 ? (
        <Card variant="elevated" spacing="default" style={styles.detailCard}>
          <Text style={styles.sectionLabel}>Preset vs Actual</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { flex: 1.25 }]}>Parameter</Text>
            <Text style={[styles.th, { flex: 0.8 }]}>Target</Text>
            <Text style={[styles.th, { flex: 0.8 }]}>Actual</Text>
            <Text style={[styles.th, { width: 42, textAlign: 'center' }]}>Flag</Text>
          </View>
          {presetRows.map((row) => (
            <View key={row.preset.id} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 1.25 }]}>{row.preset.parameter_name}</Text>
              <Text style={[styles.td, { flex: 0.8 }]}>{row.preset.required_value ?? '-'}</Text>
              <Text style={[styles.td, { flex: 0.8 }]}>
                {typeof row.actual === 'number' ? row.actual.toFixed(2) : '-'}
              </Text>
              <Text style={[styles.td, styles.flagCell]}>
                {row.status === 'ok' ? 'OK' : row.status === 'warning' ? 'WARN' : row.status === 'critical' ? 'CRIT' : '--'}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Card variant="elevated" spacing="comfortable" style={styles.exportCard}>
        <Text style={styles.sectionLabel}>Export Report</Text>
        <View style={styles.exportRow}>
          <Button
            variant="outline"
            style={styles.exportButton}
            onPress={async () => {
              setExportingFormat('csv');
              try {
                await downloadSessionExport(sessionId, 'csv');
              } catch (e: any) {
                Alert.alert('Export Failed', e?.message ?? 'Could not export CSV');
              } finally {
                setExportingFormat(null);
              }
            }}
          >
            <View style={styles.buttonContent}>
              {exportingFormat === 'csv'
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Feather name="file-text" size={15} color={colors.primary} />}
              <Text style={styles.outlineButtonText}>Export CSV</Text>
            </View>
          </Button>
          <Button
            variant="outline"
            style={styles.exportButton}
            onPress={async () => {
              setExportingFormat('pdf');
              try {
                await downloadSessionExport(sessionId, 'pdf');
              } catch (e: any) {
                Alert.alert('Export Failed', e?.message ?? 'Could not export PDF');
              } finally {
                setExportingFormat(null);
              }
            }}
          >
            <View style={styles.buttonContent}>
              {exportingFormat === 'pdf'
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Feather name="file" size={15} color={colors.primary} />}
              <Text style={styles.outlineButtonText}>Export PDF</Text>
            </View>
          </Button>
        </View>
      </Card>

      <View style={styles.bottomButtons}>
        <Button
          variant="outline"
          fullWidth
          style={styles.matchingOutlineButton}
          onPress={() => nav.navigate('FieldMap', { sessionId })}
        >
          <View style={styles.buttonContent}>
            <Feather name="map" size={16} color={colors.primary} />
            <Text style={styles.outlineButtonText}>View on Map</Text>
          </View>
        </Button>
        <Button variant="primary" fullWidth onPress={() => nav.navigate('Main')}>
          Back to Home
        </Button>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fixedHeaderShell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    ...typography.labelSmall,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusMeta: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  summaryValue: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  areaHeroCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#00C896',
    borderRadius: 24,
  },
  heroLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  heroValue: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    color: colors.text,
  },
  heroMuted: {
    ...typography.h3,
    color: colors.muted,
    fontWeight: '600',
  },
  heroMeta: {
    marginTop: spacing.sm,
    gap: 2,
  },
  detailCard: {
    borderRadius: 24,
  },
  metricsSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricSummaryTile: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricSummaryLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metricSummaryValue: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  metricsList: {
    gap: spacing.sm,
  },
  metricDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  metricDetailCopy: {
    flex: 1,
    minWidth: 0,
  },
  metricDetailTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  metricDetailValues: {
    alignItems: 'flex-end',
    maxWidth: '52%',
  },
  metricDetailValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'right',
  },
  sectionLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  detailRows: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailKey: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  detailValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  operationChip: {
    backgroundColor: `${colors.primary}14`,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  operationChipText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  badgePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgePillText: {
    ...typography.labelSmall,
    fontWeight: '700',
  },
  listBlock: {
    gap: spacing.md,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  alertCopy: {
    flex: 1,
  },
  alertMessage: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  observationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  observationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  observationCopy: {
    flex: 1,
  },
  observationTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  observationValue: {
    fontWeight: '700',
  },
  notesText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  costCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DCEDE4',
  },
  costHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  costHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  operationPill: {
    backgroundColor: '#FFF1DA',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  operationPillText: {
    ...typography.labelSmall,
    color: '#B7791F',
    fontWeight: '700',
  },
  calculationBox: {
    marginTop: spacing.sm,
    backgroundColor: '#F5F7F8',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  calcTitle: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  calcDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D9DEE3',
    marginVertical: spacing.xs,
  },
  calcFormulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  calcFormulaText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  totalChargeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#D9DEE3',
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  totalChargeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  totalChargeLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  totalChargeValue: {
    ...typography.h2,
    color: colors.success,
    fontWeight: '700',
  },
  totalChargeFootnote: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  tableHead: {
    flexDirection: 'row',
    paddingBottom: spacing.xs,
  },
  th: {
    ...typography.labelSmall,
    color: colors.muted,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  td: {
    ...typography.bodySmall,
    color: colors.text,
  },
  flagCell: {
    width: 42,
    textAlign: 'center',
    fontWeight: '700',
  },
  bottomButtons: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  matchingOutlineButton: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  outlineButtonText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  exportCard: {
    marginTop: spacing.sm,
  },
  exportRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  exportButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
});
