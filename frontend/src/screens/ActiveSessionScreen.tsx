import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Picker } from '../components/common/Picker';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { AlertsPanel } from '../components/iot/AlertsPanel';
import { GPSInfoPanel } from '../components/iot/GPSInfoPanel';
import { IoTMetricCard } from '../components/iot/IoTMetricCard';
import { colors } from '../constants/colors';
import { useIoTDashboard } from '../hooks/useIoTDashboard';
import { useSessionActions, useSessionDetail } from '../hooks/useSession';
import { useImplements } from '../hooks/useImplements';
import { useTractors } from '../hooks/useTractors';
import { acknowledgeAlert, fetchAlerts, type AlertResponse } from '../services/AlertService';
import { addObservation } from '../services/SessionService';
import { borderRadius, spacing, typography } from '../theme';

function formatElapsed(startedAt?: string): string {
  if (!startedAt) return '0h 00m 00s';
  const startMs = new Date(startedAt).getTime();
  const delta = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const h = Math.floor(delta / 3600);
  const m = Math.floor((delta % 3600) / 60);
  const s = delta % 60;
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function alertAccent(severityColor?: string | null): string {
  if (severityColor === 'red') return '#C00000';
  if (severityColor === 'orange') return '#C55A11';
  if (severityColor === 'yellow') return '#C5A300';
  return '#888888';
}

export function ActiveSessionScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const sessionId = route.params?.sessionId as string;
  const { width } = useWindowDimensions();

  const { session, isLoading, error, refetch } = useSessionDetail(sessionId);
  const { pauseSession, resumeSession, stopSession, isLoading: actionLoading } = useSessionActions();
  const iot = useIoTDashboard();
  const tractorsQ = useTractors({ limit: 100, offset: 0 });
  const implementsQ = useImplements({ limit: 100, offset: 0 });

  const [elapsed, setElapsed] = useState('0h 00m 00s');
  const [obsVisible, setObsVisible] = useState(false);
  const [obsType, setObsType] = useState<'soil_moisture' | 'cone_index'>('soil_moisture');
  const [obsValue, setObsValue] = useState('');
  const [obsNotes, setObsNotes] = useState('');
  const [obsSubmitting, setObsSubmitting] = useState(false);
  const [obsError, setObsError] = useState<string | null>(null);
  const [ackLoadingId, setAckLoadingId] = useState<string | null>(null);
  const [sessionAlerts, setSessionAlerts] = useState<AlertResponse[]>([]);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [stopConfirmVisible, setStopConfirmVisible] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);

  const displayStatus = optimisticStatus ?? session?.status ?? 'active';
  const isCompactScreen = width < 430;

  useEffect(() => {
    setOptimisticStatus(null);
  }, [session?.status]);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(formatElapsed(session?.started_at));
    }, 1000);
    setElapsed(formatElapsed(session?.started_at));
    return () => clearInterval(id);
  }, [session?.started_at]);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadAlerts = async () => {
      try {
        setAlertsError(null);
        const data = await fetchAlerts({ session_id: sessionId });
        if (!mounted) return;
        setSessionAlerts(data.items);
      } catch (loadError) {
        if (!mounted) return;
        setAlertsError(loadError instanceof Error ? loadError.message : 'Failed to fetch alerts');
      }
    };

    void loadAlerts();
    intervalId = setInterval(() => {
      void loadAlerts();
    }, 8000);
    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionId]);

  const tractorName = useMemo(() => {
    const id = session?.tractor_id;
    if (!id) return '-';
    const row = (tractorsQ.data?.items ?? []).find((tractor) => tractor.id === id);
    return row ? row.name : id;
  }, [session?.tractor_id, tractorsQ.data?.items]);

  const implementName = useMemo(() => {
    const id = session?.implement_id;
    if (!id) return 'None';
    const row = (implementsQ.data?.items ?? []).find((implement) => implement.id === id);
    return row ? row.name : id;
  }, [session?.implement_id, implementsQ.data?.items]);

  const presetsMap = useMemo(() => {
    const map: Record<string, any> = {};
    (session?.preset_values ?? []).forEach((preset) => {
      map[preset.parameter_name] = preset;
    });
    return map;
  }, [session?.preset_values]);
  const sessionStartedMs = useMemo(() => {
    if (!session?.started_at) return null;
    const parsed = new Date(session.started_at).getTime();
    return Number.isFinite(parsed) ? parsed : null;
  }, [session?.started_at]);
  const sessionFeedsMap = useMemo(() => {
    if (!sessionStartedMs) return iot.feedsMap;
    return Object.fromEntries(
      Object.entries(iot.feedsMap).map(([feedKey, reading]) => {
        if (!reading?.device_timestamp) {
          return [feedKey, undefined];
        }
        const readingMs = new Date(reading.device_timestamp).getTime();
        if (!Number.isFinite(readingMs) || readingMs < sessionStartedMs) {
          return [feedKey, undefined];
        }
        return [feedKey, reading];
      }),
    ) as typeof iot.feedsMap;
  }, [iot.feedsMap, sessionStartedMs]);
  const machineStatusRaw = sessionFeedsMap.machine_status?.raw_value?.toUpperCase() ?? null;
  const machineStatus =
    machineStatusRaw === 'RUNNING' ? 'RUNNING' : machineStatusRaw === 'IDLE' ? 'IDLE' : 'No Signal';
  const machineBg =
    machineStatus === 'RUNNING' ? '#E9F8EE' : machineStatus === 'IDLE' ? '#F3F4F6' : '#F3F4F6';
  const machineColor =
    machineStatus === 'RUNNING' ? colors.success : machineStatus === 'IDLE' ? colors.muted : colors.muted;

  const renderDeviation = (feedKey: string, actual: number | null) => {
    const preset = presetsMap[feedKey];
    if (!preset || actual == null || preset.required_value == null) return null;
    const target = Number(preset.required_value);
    if (!Number.isFinite(target) || target === 0) return null;
    const diffPct = (Math.abs(actual - target) / Math.abs(target)) * 100;
    if (diffPct >= Number(preset.deviation_pct_crit ?? 25)) {
      const arrow = actual >= target ? '↑' : '↓';
      return (
        <Text style={styles.devCritical}>
          {`${arrow} ${diffPct.toFixed(0)}% ${actual >= target ? 'above' : 'below'} target`}
        </Text>
      );
    }
    if (diffPct >= Number(preset.deviation_pct_warn ?? 10)) {
      const arrow = actual >= target ? '↑' : '↓';
      return (
        <Text style={styles.devWarning}>
          {`${arrow} ${diffPct.toFixed(0)}% ${actual >= target ? 'above' : 'below'} target`}
        </Text>
      );
    }
    return <Text style={styles.devNormal}>{`Target: ${target}${preset.unit ? ` ${preset.unit}` : ''}`}</Text>;
  };

  const topUnacknowledgedAlert = useMemo(
    () => sessionAlerts.find((alert) => !alert.acknowledged) ?? null,
    [sessionAlerts],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!session) return <ErrorMessage message="Session not found." />;

  const handleAck = async (alertId: string) => {
    try {
      setAckLoadingId(alertId);
      await acknowledgeAlert(alertId);
      const alerts = await fetchAlerts({ session_id: sessionId });
      setSessionAlerts(alerts.items);
      await refetch();
    } finally {
      setAckLoadingId(null);
    }
  };

  const handleObservationSubmit = async () => {
    setObsError(null);
    const value = Number(obsValue);
    if (!Number.isFinite(value)) {
      setObsError('Observation value must be a valid number');
      return;
    }
    try {
      setObsSubmitting(true);
      await addObservation(sessionId, {
        obs_type: obsType,
        value,
        unit: obsType === 'soil_moisture' ? 'percent' : 'MPa',
        lat: sessionFeedsMap.position_tracking?.lat ?? undefined,
        lon: sessionFeedsMap.position_tracking?.lon ?? undefined,
        notes: obsNotes.trim() || undefined,
      });
      setObsVisible(false);
      setObsValue('');
      setObsNotes('');
    } catch (submitError) {
      setObsError(submitError instanceof Error ? submitError.message : 'Failed to add observation');
    } finally {
      setObsSubmitting(false);
    }
  };

  const onPauseResume = async () => {
    const nextStatus = displayStatus === 'active' ? 'paused' : 'active';
    try {
      setOptimisticStatus(nextStatus);
      if (displayStatus === 'active') {
        await pauseSession(sessionId);
      } else {
        await resumeSession(sessionId);
      }
      await refetch();
    } catch (actionError) {
      setOptimisticStatus(null);
      Alert.alert(
        'Session Action Failed',
        actionError instanceof Error ? actionError.message : 'Unable to update session status.',
      );
    }
  };

  const confirmStop = async () => {
    try {
      setStopConfirmVisible(false);
      const stopped = await stopSession(sessionId);
      nav.replace('SessionSummary', { sessionId: stopped.id });
    } catch (stopError) {
      Alert.alert(
        'Stop Session Failed',
        stopError instanceof Error ? stopError.message : 'Unable to stop session.',
      );
    }
  };

  const onStop = () => {
    if (Platform.OS === 'web') {
      setStopConfirmVisible(true);
      return;
    }

    Alert.alert('Stop Session?', 'Are you sure? This will end the session and compute field area.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Stop Session',
        style: 'destructive',
        onPress: () => {
          void confirmStop();
        },
      },
    ]);
  };

  const temp = sessionFeedsMap.gearbox_temperature;
  const tempNum = toNum(temp?.numeric_value);
  const tempColor =
    tempNum != null && tempNum >= 100
      ? colors.danger
      : tempNum != null && tempNum >= 85
        ? colors.warning
        : colors.text;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Active Session</Text>
          <Text style={styles.elapsed}>{elapsed}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            displayStatus === 'active' ? styles.statusActive : styles.statusPaused,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              displayStatus === 'active' ? styles.statusTextActive : styles.statusTextPaused,
            ]}
          >
            {displayStatus === 'active' ? 'ACTIVE' : 'PAUSED'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {topUnacknowledgedAlert ? (
          <Card
            variant="filled"
            spacing="default"
            style={[
              styles.inlineAlertCard,
              topUnacknowledgedAlert.alert_status === 'critical'
                ? styles.inlineAlertCritical
                : styles.inlineAlertWarning,
            ]}
          >
            <View style={styles.inlineAlertRow}>
              <Feather
                name={topUnacknowledgedAlert.alert_status === 'critical' ? 'x-circle' : 'alert-triangle'}
                size={18}
                color={topUnacknowledgedAlert.alert_status === 'critical' ? '#C00000' : '#B7791F'}
              />
              <View style={styles.inlineAlertCopy}>
                <Text
                  style={[
                    styles.inlineAlertTitle,
                    { color: topUnacknowledgedAlert.alert_status === 'critical' ? '#C00000' : '#B7791F' },
                  ]}
                >
                  {topUnacknowledgedAlert.alert_status === 'critical' ? 'Error' : 'Warning'}
                </Text>
                <Text style={styles.inlineAlertMessage}>{topUnacknowledgedAlert.message}</Text>
              </View>
            </View>
          </Card>
        ) : null}

        <Card variant="filled" spacing="default" style={[styles.machineBanner, { backgroundColor: machineBg }]}>
          <Text style={[styles.machineText, { color: machineColor }]}>{machineStatus}</Text>
        </Card>

        <Card variant="elevated" spacing="default">
          <Text style={styles.sectionTitle}>Operation Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.k}>Operation Type</Text>
            <Text style={styles.v}>{session.operation_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.k}>Tractor</Text>
            <Text style={styles.v}>{tractorName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.k}>Implement</Text>
            <Text style={styles.v}>{implementName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.k}>Operator</Text>
            <Text style={styles.v}>{session.operator_id}</Text>
          </View>
        </Card>

        <View style={styles.gridRows}>
          <View style={styles.gridRow}>
            <View style={styles.metricWrap}>
              <IoTMetricCard feedKey="forward_speed" reading={sessionFeedsMap.forward_speed} />
              {renderDeviation('forward_speed', toNum(sessionFeedsMap.forward_speed?.numeric_value))}
            </View>
            <View style={styles.metricWrap}>
              <IoTMetricCard feedKey="pto_shaft_speed" reading={sessionFeedsMap.pto_shaft_speed} />
              {renderDeviation('pto_shaft_speed', toNum(sessionFeedsMap.pto_shaft_speed?.numeric_value))}
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.metricWrap}>
              <IoTMetricCard feedKey="depth_of_operation" reading={sessionFeedsMap.depth_of_operation} />
              {renderDeviation('operation_depth', toNum(sessionFeedsMap.depth_of_operation?.numeric_value))}
            </View>
            <View style={styles.metricWrap}>
              <IoTMetricCard feedKey="soil_moisture" reading={sessionFeedsMap.soil_moisture} />
              {renderDeviation('soil_moisture', toNum(sessionFeedsMap.soil_moisture?.numeric_value))}
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.metricWrap}>
              <IoTMetricCard feedKey="field_capacity" reading={sessionFeedsMap.field_capacity} />
              {renderDeviation('field_capacity', toNum(sessionFeedsMap.field_capacity?.numeric_value))}
            </View>
            <View style={styles.metricWrap}>
              <IoTMetricCard feedKey="wheel_slip" reading={sessionFeedsMap.wheel_slip} />
              {renderDeviation('wheel_slip', toNum(sessionFeedsMap.wheel_slip?.numeric_value))}
            </View>
          </View>
        </View>

        <Card variant="elevated" spacing="comfortable">
          <Text style={styles.sectionTitle}>TEMPERATURE</Text>
          <Text style={[styles.tempValue, { color: tempColor }]}>
            {tempNum == null ? '--' : `${tempNum.toFixed(1)}°C`}
          </Text>
          {renderDeviation('gearbox_temperature', tempNum)}
        </Card>

        <AlertsPanel feeds={sessionFeedsMap} />

        <Card variant="elevated" spacing="default">
          <Text style={styles.sectionTitle}>Session Alerts</Text>
          {alertsError ? <Text style={styles.muted}>{alertsError}</Text> : null}
          {sessionAlerts.length === 0 ? (
            <Text style={styles.muted}>No session alerts</Text>
          ) : (
            sessionAlerts.map((alert) => (
              <View key={alert.id} style={[styles.alertRow, { borderLeftColor: alertAccent(alert.severity_color) }]}>
                <View style={[styles.dot, { backgroundColor: alertAccent(alert.severity_color) }]} />
                <View style={styles.alertBody}>
                  <Text style={styles.alertMsg}>{alert.message}</Text>
                </View>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={alert.acknowledged || ackLoadingId === alert.id}
                  onPress={() => handleAck(alert.id)}
                >
                  {alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                </Button>
              </View>
            ))
          )}
        </Card>

        <GPSInfoPanel reading={sessionFeedsMap.position_tracking} />

        <Button
          variant="outline"
          fullWidth
          onPress={() => setObsVisible(true)}
          style={styles.matchingOutlineButton}
        >
          <View style={styles.actionButtonContent}>
            <Feather name="edit-2" size={16} color={colors.primary} />
            <Text style={styles.outlineButtonText}>Log Field Observation</Text>
          </View>
        </Button>
      </ScrollView>

      <View style={[styles.bottomRow, isCompactScreen && styles.bottomRowCompact]}>
        <View style={styles.sessionActionSlot}>
          <Button
            size="lg"
            variant="outline"
            onPress={onPauseResume}
            disabled={actionLoading}
            style={[
              styles.sessionActionButton,
              isCompactScreen && styles.sessionActionButtonCompact,
              displayStatus === 'active' ? styles.pauseBtn : styles.resumeBtn,
            ]}
          >
            <View style={styles.actionButtonContent}>
              <Feather
                name={displayStatus === 'active' ? 'pause' : 'play'}
                size={16}
                color={displayStatus === 'active' ? '#C55A11' : colors.primary}
              />
              <Text
                style={[
                  displayStatus === 'active' ? styles.pauseButtonText : styles.resumeButtonText,
                  isCompactScreen &&
                    (displayStatus === 'active'
                      ? styles.pauseButtonTextCompact
                      : styles.resumeButtonTextCompact),
                ]}
              >
                {displayStatus === 'active' ? 'Pause' : 'Resume'}
              </Text>
            </View>
          </Button>
        </View>
        <View style={styles.sessionActionSlot}>
          <Button
            size="lg"
            variant="outline"
            onPress={onStop}
            disabled={actionLoading}
            style={[styles.sessionActionButton, isCompactScreen && styles.sessionActionButtonCompact, styles.stopBtn]}
          >
            <View style={styles.actionButtonContent}>
              <Feather name="square" size={16} color="#DC2626" />
              <Text style={[styles.stopButtonText, isCompactScreen && styles.stopButtonTextCompact]}>
                Stop Session
              </Text>
            </View>
          </Button>
        </View>
      </View>

      <Modal visible={obsVisible} transparent animationType="slide" onRequestClose={() => setObsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Log Field Observation</Text>
            <Picker
              label="Observation Type"
              value={obsType}
              onValueChange={(value) => setObsType(value as 'soil_moisture' | 'cone_index')}
              items={[
                { label: 'Soil Moisture', value: 'soil_moisture' },
                { label: 'Cone Index', value: 'cone_index' },
              ]}
            />
            <Input
              label="Value"
              value={obsValue}
              onChangeText={setObsValue}
              keyboardType="decimal-pad"
              placeholder={obsType === 'soil_moisture' ? 'percent' : 'MPa'}
            />
            <Input
              label="Notes (Optional)"
              value={obsNotes}
              onChangeText={setObsNotes}
              placeholder="Add notes"
            />
            <Text style={styles.gpsReadOnly}>
              GPS: {sessionFeedsMap.position_tracking?.lat ?? '--'}, {sessionFeedsMap.position_tracking?.lon ?? '--'}
            </Text>
            {obsError ? <Text style={styles.errorInline}>{obsError}</Text> : null}
            <View style={styles.modalActions}>
              <Button variant="outline" fullWidth onPress={() => setObsVisible(false)} disabled={obsSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" fullWidth onPress={handleObservationSubmit} loading={obsSubmitting}>
                Submit
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={stopConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStopConfirmVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Stop Session?</Text>
            <Text style={styles.confirmText}>This will end the session and compute field area.</Text>
            <View style={styles.confirmActions}>
              <Button
                variant="outline"
                fullWidth
                onPress={() => setStopConfirmVisible(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button variant="destructive" fullWidth onPress={confirmStop} loading={actionLoading}>
                Stop Session
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerCenter: { flex: 1, minWidth: 0 },
  headerTitle: { ...typography.h4, color: colors.text, fontWeight: '700' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  statusActive: { backgroundColor: '#E9F8EE' },
  statusPaused: { backgroundColor: '#FFF3E0' },
  statusText: { ...typography.labelSmall, fontWeight: '700' },
  statusTextActive: { color: colors.success },
  statusTextPaused: { color: colors.warning },
  elapsed: { ...typography.labelSmall, color: colors.text, fontWeight: '700', marginTop: spacing.xs },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: 120 },
  machineBanner: { width: '100%' },
  machineText: { ...typography.h5, fontWeight: '700', textAlign: 'center' },
  inlineAlertCard: {
    borderWidth: 1,
    borderRadius: 10,
  },
  inlineAlertWarning: {
    backgroundColor: '#FFF8DB',
    borderColor: '#E9D9A3',
  },
  inlineAlertCritical: {
    backgroundColor: '#FDECEC',
    borderColor: '#E6B8B7',
  },
  inlineAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inlineAlertCopy: {
    flex: 1,
    minWidth: 0,
  },
  inlineAlertTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  inlineAlertMessage: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  sectionTitle: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  k: { ...typography.bodySmall, color: colors.muted },
  v: { ...typography.bodySmall, color: colors.text, fontWeight: '600', maxWidth: '62%', textAlign: 'right' },
  gridRows: { gap: spacing.md },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  metricWrap: { flex: 1, gap: spacing.xs },
  devNormal: { ...typography.bodySmall, color: colors.muted, paddingLeft: spacing.xs },
  devWarning: { ...typography.bodySmall, color: colors.warning, paddingLeft: spacing.xs, fontWeight: '600' },
  devCritical: { ...typography.bodySmall, color: colors.danger, paddingLeft: spacing.xs, fontWeight: '700' },
  tempValue: { ...typography.h2, fontWeight: '700' },
  muted: { ...typography.bodySmall, color: colors.muted },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    borderLeftWidth: 3,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  alertBody: { flex: 1 },
  alertMsg: { ...typography.bodySmall, color: colors.text },
  bottomRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: colors.surface,
  },
  bottomRowCompact: {
    flexDirection: 'column',
    paddingVertical: spacing.sm,
  },
  sessionActionButton: {
    width: '100%',
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 14,
  },
  sessionActionSlot: {
    flex: 1,
    minWidth: 0,
  },
  sessionActionButtonCompact: {
    width: '100%',
    minHeight: 42,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minWidth: 0,
    flexWrap: 'nowrap',
  },
  pauseBtn: {
    borderColor: '#E58A2A',
    backgroundColor: '#FFF8F0',
  },
  resumeBtn: {
    borderColor: colors.primary,
    backgroundColor: '#F5FBF7',
  },
  stopBtn: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  pauseButtonText: {
    ...typography.label,
    color: '#C55A11',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
  resumeButtonText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
  stopButtonText: {
    ...typography.label,
    color: '#DC2626',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
  pauseButtonTextCompact: {
    fontSize: 12,
  },
  resumeButtonTextCompact: {
    fontSize: 12,
  },
  stopButtonTextCompact: {
    fontSize: 12,
  },
  matchingOutlineButton: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  outlineButtonText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  confirmCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  confirmTitle: { ...typography.h5, color: colors.text, fontWeight: '700' },
  confirmText: { ...typography.bodySmall, color: colors.muted },
  confirmActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: { ...typography.h5, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  gpsReadOnly: { ...typography.bodySmall, color: colors.muted, marginTop: spacing.xs },
  errorInline: { ...typography.bodySmall, color: colors.danger },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
