import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { Card } from '../../components/common/Card';
import { AlertNotificationPopup } from '../../components/common/AlertNotificationPopup';
import { Button } from '../../components/common/Button';
import { DashboardAuthHeader } from '../../components/common/DashboardAuthHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveSession, useSessionDetail, useSessions } from '../../hooks/useSession';
import { useImplements } from '../../hooks/useImplements';
import { useTractors } from '../../hooks/useTractors';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, typography } from '../../theme';

function fmtDateTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtArea(value?: number | null): string {
  if (value == null) return '--';
  return `${value.toFixed(2)} ha`;
}

function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours <= 0) return `${minutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function statusColor(status: string): string {
  switch (status) {
    case 'active':
      return colors.primary;
    case 'paused':
      return '#C55A11';
    case 'completed':
      return '#2563EB';
    case 'aborted':
      return '#C00000';
    default:
      return '#64748B';
  }
}

function operationLabel(operationType: string): string {
  return operationType.replace(/_/g, ' ');
}

export function OperatorDashboardScreen() {
  const nav = useNavigation<any>();
  const { user, logout } = useAuth();
  const { activeSession } = useActiveSession();
  const { session: activeSessionDetail } = useSessionDetail(activeSession?.id ?? null);
  const { sessions } = useSessions();
  const tractorsQ = useTractors({ limit: 200, offset: 0, sort: 'name' });
  const implementsQ = useImplements({ limit: 200, offset: 0, sort: 'name' });
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [elapsedLabel, setElapsedLabel] = useState('0m');
  const [dismissedPopupAlertId, setDismissedPopupAlertId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSession?.started_at) {
      setElapsedLabel('0m');
      return;
    }

    const update = () => {
      const startedAt = new Date(activeSession.started_at).getTime();
      const diffMinutes = Math.max(0, (Date.now() - startedAt) / 60000);
      setElapsedLabel(formatMinutes(diffMinutes));
    };

    update();
    const intervalId = setInterval(update, 30000);
    return () => clearInterval(intervalId);
  }, [activeSession?.started_at]);

  const activeAlertsCount = useMemo(
    () => (activeSessionDetail?.alerts ?? []).filter((alert) => !alert.acknowledged).length,
    [activeSessionDetail?.alerts],
  );
  const topDashboardAlert = useMemo(
    () =>
      (activeSessionDetail?.alerts ?? []).find(
        (alert) => !alert.acknowledged && alert.id !== dismissedPopupAlertId,
      ) ?? null,
    [activeSessionDetail?.alerts, dismissedPopupAlertId],
  );

  useEffect(() => {
    if ((activeSessionDetail?.alerts?.length ?? 0) === 0) {
      setDismissedPopupAlertId(null);
    }
  }, [activeSessionDetail?.alerts]);

  const tractorMap = useMemo(
    () => Object.fromEntries((tractorsQ.data?.items ?? []).map((tractor) => [tractor.id, tractor])),
    [tractorsQ.data?.items],
  );

  const implementMap = useMemo(
    () => Object.fromEntries((implementsQ.data?.items ?? []).map((implement) => [implement.id, implement])),
    [implementsQ.data?.items],
  );

  const today = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    const todaySessions = sessions.filter((session) => {
      const dt = new Date(session.started_at);
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    });

    const totalMinutes = todaySessions.reduce((sum, session) => {
      const startedAt = new Date(session.started_at).getTime();
      const endedAt = session.ended_at ? new Date(session.ended_at).getTime() : Date.now();
      if (Number.isNaN(startedAt) || Number.isNaN(endedAt) || endedAt < startedAt) return sum;
      return sum + (endedAt - startedAt) / 60000;
    }, 0);

    return {
      count: todaySessions.length,
      area: todaySessions.reduce((sum, session) => sum + (session.area_ha ?? 0), 0),
      durationMinutes: totalMinutes,
    };
  }, [sessions]);

  const recentSessions = useMemo(
    () =>
      sessions
        .filter((session) => session.id !== activeSession?.id)
        .sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at))
        .slice(0, 3),
    [activeSession?.id, sessions],
  );

  const activeTractorName = activeSession?.tractor_id ? tractorMap[activeSession.tractor_id]?.name : null;
  const activeImplementName =
    activeSession?.implement_id ? implementMap[activeSession.implement_id]?.name : null;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <DashboardAuthHeader
          title={`Welcome, ${user?.name?.split(' ')[0] ?? 'Operator'}`}
          subtitle="Operator"
          showMenuButton
          onMenuPress={() => setSidebarVisible(true)}
        />

        <AlertNotificationPopup
          alert={topDashboardAlert}
          subtitle="Operator dashboard"
          onClose={() => setDismissedPopupAlertId(topDashboardAlert?.id ?? null)}
        />

        {activeSession ? (
          <View style={styles.activeBanner}>
            <View style={styles.activeTopRow}>
              <View style={styles.activeBadgeRow}>
                <Text style={styles.activeEyebrow}>
                  {activeSession.status === 'paused' ? 'Session Paused' : 'Session Active'}
                </Text>
                <View style={styles.operationBadge}>
                  <Text style={styles.operationBadgeText}>{operationLabel(activeSession.operation_type)}</Text>
                </View>
              </View>
              <View style={styles.timerPill}>
                <Feather name="clock" size={14} color="#FFFFFF" />
                <Text style={styles.timerText}>{elapsedLabel}</Text>
              </View>
            </View>

            <Text style={styles.activeMachineText}>
              {activeTractorName ?? 'Assigned tractor'}
              {activeImplementName ? ` - ${activeImplementName}` : ''}
            </Text>

            {activeAlertsCount > 0 ? (
              <View style={styles.alertRow}>
                <Feather name="alert-triangle" size={14} color="#FFFFFF" />
                <Text style={styles.alertText}>{activeAlertsCount} unacknowledged alerts</Text>
              </View>
            ) : null}

            <Button
              onPress={() => nav.navigate('ActiveSession', { sessionId: activeSession.id })}
              style={styles.activeButton}
            >
              {activeSession.status === 'paused' ? 'Resume Operation' : 'View Live Session'}
            </Button>
          </View>
        ) : (
          <Card variant="elevated" spacing="default" style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Feather name="clock" size={28} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No active session</Text>
            <Text style={styles.emptyDescription}>Start a new field operation to begin live tracking.</Text>
            <Button onPress={() => nav.navigate('SessionSetup')} style={styles.startButton}>
              Start New Operation
            </Button>
          </Card>
        )}

        <View>
          <Text style={styles.blockTitle}>Today's Work</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Sessions</Text>
              <Text style={styles.statValue}>{today.count}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Area</Text>
              <Text style={styles.statValue}>{fmtArea(today.area)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{formatMinutes(today.durationMinutes)}</Text>
            </View>
          </View>
        </View>

        {recentSessions.length > 0 ? (
          <View>
            <Text style={styles.blockTitle}>Recent Sessions</Text>
            <View style={styles.sessionsList}>
              {recentSessions.map((session) => {
                const tractorName = tractorMap[session.tractor_id]?.name ?? 'Unknown tractor';
                const implementName = session.implement_id
                  ? implementMap[session.implement_id]?.name ?? 'Implement'
                  : null;
                return (
                  <Pressable
                    key={session.id}
                    style={styles.sessionCard}
                    onPress={() => nav.navigate('SessionSummary', { sessionId: session.id })}
                  >
                    <View style={styles.sessionCardTop}>
                      <Text style={styles.sessionCardTitle}>{operationLabel(session.operation_type)}</Text>
                      <View style={[styles.sessionStatusBadge, { backgroundColor: `${statusColor(session.status)}18` }]}>
                        <Text style={[styles.sessionStatusText, { color: statusColor(session.status) }]}>
                          {session.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.sessionMetaText}>
                      {tractorName}
                      {implementName ? ` - ${implementName}` : ''}
                    </Text>
                    <Text style={styles.sessionMetaText}>{fmtDateTime(session.started_at)}</Text>
                    <Text style={styles.sessionSummaryText}>
                      Area {fmtArea(session.area_ha)} - Cost{' '}
                      {session.total_cost_inr != null ? `Rs ${session.total_cost_inr.toFixed(2)}` : '--'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        visible={sidebarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebarPanel}>
            <View style={styles.sidebarContent}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Menu</Text>
                <Pressable onPress={() => setSidebarVisible(false)} style={styles.sidebarClose}>
                  <Feather name="x" size={18} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.sidebarItems}>
                <Pressable
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    nav.navigate('Reports');
                  }}
                >
                  <Feather name="bar-chart-2" size={18} color={colors.primary} />
                  <Text style={styles.sidebarItemLabel}>Reports</Text>
                </Pressable>

                <Pressable
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    nav.navigate('SimulationStackScreen', { screen: 'SimulationHistory' });
                  }}
                >
                  <Feather name="activity" size={18} color={colors.primary} />
                  <Text style={styles.sidebarItemLabel}>Simulations</Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.sidebarSignOut}
                onPress={() => {
                  setSidebarVisible(false);
                  logout();
                }}
              >
                <Feather name="log-out" size={18} color={colors.danger} />
                <Text style={styles.sidebarSignOutText}>Sign out</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.sidebarBackdrop} onPress={() => setSidebarVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  activeBanner: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: spacing.lg,
  },
  activeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  activeBadgeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activeEyebrow: {
    ...typography.labelSmall,
    color: 'rgba(255,255,255,0.84)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  operationBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  operationBadgeText: { ...typography.labelSmall, color: '#FFFFFF', fontWeight: '700' },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  timerText: { ...typography.labelSmall, color: '#FFFFFF', fontWeight: '700' },
  activeMachineText: {
    ...typography.body,
    color: '#FFFFFF',
    opacity: 0.92,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  alertText: { ...typography.bodySmall, color: '#FFFFFF' },
  activeButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 0,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { ...typography.h4, color: colors.text, fontWeight: '700' },
  emptyDescription: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  startButton: { alignSelf: 'center' },
  blockTitle: {
    ...typography.label,
    color: colors.muted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  sessionsList: { gap: spacing.sm },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: spacing.xs,
  },
  sessionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sessionCardTitle: { ...typography.h5, color: colors.text, fontWeight: '700', flex: 1 },
  sessionStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sessionStatusText: {
    ...typography.labelSmall,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sessionMetaText: { ...typography.bodySmall, color: colors.muted },
  sessionSummaryText: { ...typography.bodySmall, color: colors.text, fontWeight: '600', marginTop: spacing.xs },
  sidebarOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(15, 23, 42, 0.22)' },
  sidebarPanel: {
    width: 280,
    maxWidth: '82%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderTopRightRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarBackdrop: { flex: 1 },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sidebarTitle: { ...typography.h4, color: colors.text, fontWeight: '700' },
  sidebarClose: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  sidebarItemLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
  sidebarItems: {
    gap: spacing.sm,
  },
  sidebarSignOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: 'auto',
  },
  sidebarSignOutText: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '700',
  },
});
