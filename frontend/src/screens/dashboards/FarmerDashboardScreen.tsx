import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { Card } from '../../components/common/Card';
import { DashboardAuthHeader } from '../../components/common/DashboardAuthHeader';
import { MetricGrid } from '../../components/iot/MetricGrid';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';
import { useActiveSession, useSessions } from '../../hooks/useSession';
import { useIoTDashboard } from '../../hooks/useIoTDashboard';
import { useTractors } from '../../hooks/useTractors';
import { fetchAlerts, type AlertResponse } from '../../services/AlertService';
import { borderRadius, spacing, typography } from '../../theme';

function fmtDate(v: string): string {
  return new Date(v).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtArea(area?: number | null): string {
  if (area == null || !Number.isFinite(area)) return '0.00 ha';
  return `${area.toFixed(2)} ha`;
}

function fmtCurrency(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return 'Pending';
  return `Rs ${value.toFixed(2)}`;
}

function statusColor(status: string) {
  if (status === 'completed') return '#1D4ED8';
  if (status === 'active') return colors.primary;
  if (status === 'paused') return '#B45309';
  return '#64748B';
}

export function FarmerDashboardScreen() {
  const nav = useNavigation<any>();
  const { user, logout } = useAuth();
  const { sessions } = useSessions();
  const { activeSession } = useActiveSession();
  const iot = useIoTDashboard();
  const tractorsQ = useTractors({ limit: 200, offset: 0, sort: 'name' });
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const farmerSessions = useMemo(() => sessions, [sessions]);
  const completedSessions = useMemo(
    () =>
      farmerSessions
        .filter((session) => session.status === 'completed')
        .sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at))
        .slice(0, 3),
    [farmerSessions],
  );

  const totalArea = useMemo(
    () => farmerSessions.reduce((sum, session) => sum + (session.area_ha ?? 0), 0),
    [farmerSessions],
  );

  const tractorNameById = useMemo(() => {
    const items = tractorsQ.data?.items ?? [];
    return Object.fromEntries(items.map((tractor) => [tractor.id, tractor.name]));
  }, [tractorsQ.data?.items]);

  const isolatedFeeds = useMemo(() => {
    if (!activeSession) return {};
    return iot.feedsMap;
  }, [activeSession, iot.feedsMap]);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts({ acknowledged: false, limit: 5, offset: 0 });
        if (!mounted) return;
        setAlerts(data.items);
      } catch {
        if (mounted) setAlerts([]);
      }
    };

    void loadAlerts();
    intervalId = setInterval(() => {
      void loadAlerts();
    }, 15000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <DashboardAuthHeader
          title={`Welcome, ${user?.name?.split(' ')[0] ?? 'Farmer'}`}
          subtitle="Farmer"
          showMenuButton
          onMenuPress={() => setSidebarVisible(true)}
        />

        <Card variant="elevated" spacing="comfortable" style={styles.heroCard}>
          <View style={styles.heroHead}>
            <View style={styles.heroIconWrap}>
              <Feather name="map" size={16} color={colors.primary} />
            </View>
            <Text style={styles.heroLabel}>Total Area Covered</Text>
          </View>
          <Text style={styles.heroValue}>{fmtArea(totalArea)}</Text>
          <Text style={styles.heroMeta}>this season</Text>
        </Card>

        <View>
          <Text style={styles.sectionTitle}>My Fields This Season</Text>
          {completedSessions.length > 0 ? (
            <View style={styles.sessionList}>
              {completedSessions.map((session) => (
                <Card
                  key={session.id}
                  variant="elevated"
                  spacing="default"
                  pressable
                  onPress={() => nav.navigate('SessionSummary', { sessionId: session.id })}
                  style={styles.sessionCard}
                >
                  <View style={styles.sessionTopRow}>
                    <Text style={styles.sessionTitle}>{session.operation_type}</Text>
                    <View
                      style={[
                        styles.sessionStatusPill,
                        { backgroundColor: `${statusColor(session.status)}18` },
                      ]}
                    >
                      <Text style={[styles.sessionStatusText, { color: statusColor(session.status) }]}>
                        {session.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sessionMeta}>
                    Tractor: {tractorNameById[session.tractor_id] ?? 'Unknown tractor'}
                  </Text>
                  <Text style={styles.sessionMeta}>Area: {fmtArea(session.area_ha)}</Text>
                  <Text style={styles.sessionCost}>
                    Payable: {fmtCurrency(session.total_cost_inr ?? null)}
                  </Text>
                  {session.cost_note ? (
                    <Text style={styles.sessionCostNote}>{session.cost_note}</Text>
                  ) : null}
                  <Text style={styles.sessionMeta}>{fmtDate(session.started_at)}</Text>
                </Card>
              ))}
            </View>
          ) : (
            <Card variant="elevated" spacing="comfortable" style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Feather name="droplet" size={28} color={colors.muted} />
              </View>
              <Text style={styles.emptyTitle}>No field sessions yet this season.</Text>
            </Card>
          )}
        </View>

        <View>
          <Text style={styles.sectionTitle}>Current Sensor Readings</Text>
          {activeSession ? (
            <MetricGrid feeds={isolatedFeeds as any} />
          ) : (
            <Card variant="elevated" spacing="comfortable" style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No live operation for your field right now.</Text>
              <Text style={styles.emptySubtext}>Sensor readings appear here when an active session is assigned to you.</Text>
            </Card>
          )}
        </View>

        <View>
          <Text style={styles.sectionTitle}>Latest Alerts</Text>
          <Card variant="elevated" spacing="default">
            {alerts.length === 0 ? (
              <Text style={styles.muted}>No alerts</Text>
            ) : (
              alerts.slice(0, 3).map((alert) => (
                <View key={alert.id} style={styles.alertRow}>
                  <View
                    style={[
                      styles.alertDot,
                      { backgroundColor: alert.alert_status === 'critical' ? colors.danger : colors.warning },
                    ]}
                  />
                  <View style={styles.alertCopy}>
                    <Text style={styles.alertTitle}>{alert.feed_key.replace(/_/g, ' ')}</Text>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        </View>
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
  heroCard: {
    borderRadius: 24,
  },
  heroHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  heroIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}12`,
  },
  heroLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroValue: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
  },
  heroMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  sessionList: {
    gap: spacing.sm,
  },
  sessionCard: {
    borderRadius: 22,
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  sessionTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  sessionStatusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  sessionStatusText: {
    ...typography.labelSmall,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sessionMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  sessionCost: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: spacing.xs,
    fontWeight: '700',
  },
  sessionCostNote: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
  emptyCard: {
    borderRadius: 22,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  muted: { ...typography.bodySmall, color: colors.muted },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
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
  alertTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  alertMessage: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
  },
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
