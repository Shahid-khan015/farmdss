import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { OwnerScreenMenuButton } from '../components/navigation/OwnerScreenMenuButton';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/colors';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useActiveSession, useSessions } from '../hooks/useSession';
import { fetchAlerts, type AlertResponse } from '../services/AlertService';
import { borderRadius, spacing, typography } from '../theme';
import { fmtAreaHa } from '../utils/formatters';

/** `_tick` forces re-render while sessions are active (live clock). */
function formatRunningDuration(startedAt: string, _tick?: number): string {
  void _tick;
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  let sec = Math.floor((now - start) / 1000);
  if (Number.isNaN(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

function operationBadgeColors(operationType: string): { bg: string; text: string } {
  switch (operationType) {
    case 'Tillage':
      return { bg: '#FFEDD5', text: '#C2410C' };
    case 'Sowing':
      return { bg: '#DCFCE7', text: '#166534' };
    case 'Spraying':
      return { bg: '#E0F2FE', text: '#0369A1' };
    case 'Weeding':
      return { bg: '#FEF9C3', text: '#854D0E' };
    case 'Harvesting':
      return { bg: '#F3E8FF', text: '#6B21A8' };
    default:
      return { bg: '#F3F4F6', text: '#374151' };
  }
}

function formatAlertClock(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function alertLevelLabel(alertStatus: string): string {
  if (alertStatus === 'critical') return 'Critical';
  if (alertStatus === 'warning') return 'Warning';
  return alertStatus.charAt(0).toUpperCase() + alertStatus.slice(1);
}

function alertDotColor(alert: AlertResponse): string {
  const st = (alert.alert_status || '').toLowerCase();
  if (st === 'critical' || alert.severity_color === 'red') return '#DC2626';
  return '#EA580C';
}

interface StatCard {
  id: string;
  label: string;
  value: number;
  icon: string;
  color: string;
}

export function HomeScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const currentUser = user;
  const isOwner = user?.role === 'owner';
  const isResearcher = user?.role === 'researcher';
  const isOperator = user?.role === 'operator';
  const isFarmer = user?.role === 'farmer';
  const useSidebarNav = isOwner || isResearcher;
  const useSimulationStack = useSidebarNav || isOperator || isFarmer;
  const { stats, isLoading, error } = useDashboardStats();
  const { sessions: activeSessions } = useActiveSession();
  const [durationTick, setDurationTick] = useState(0);
  const sessionListFilters = useMemo(
    () => (isOwner ? { limit: 100, offset: 0 } : {}),
    [isOwner],
  );
  const { sessions: allSessions } = useSessions(sessionListFilters);
  const [recentAlerts, setRecentAlerts] = useState<AlertResponse[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const gridGap = spacing.md;
  const horizontalPadding = spacing.lg * 2;
  const twoColumnCardWidth = (width - horizontalPadding - gridGap) / 2;

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateAnim = React.useRef(new Animated.ValueXY({ x: 0, y: 20 })).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim.y, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateAnim.y]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadRecentAlerts = async () => {
      try {
        const { items } = await fetchAlerts({
          acknowledged: false,
          limit: 10,
          offset: 0,
        });
        if (!mounted) return;
        setRecentAlerts(items);
      } catch {
        if (mounted) setRecentAlerts([]);
      }
    };

    void loadRecentAlerts();
    intervalId = setInterval(() => {
      void loadRecentAlerts();
    }, 15000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    if (activeSessions.length === 0) return;
    const id = setInterval(() => setDurationTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [activeSessions.length]);

  const displayedAlerts = useMemo(() => recentAlerts.slice(0, 3), [recentAlerts]);
  const alertHeaderCounts = useMemo(() => {
    let warnings = 0;
    let critical = 0;
    for (const a of displayedAlerts) {
      const st = (a.alert_status || '').toLowerCase();
      if (st === 'critical') critical += 1;
      else if (st === 'warning') warnings += 1;
    }
    return { warnings, critical };
  }, [displayedAlerts]);

  const statCards: StatCard[] = stats
    ? [
        {
          id: 'tractors',
          label: 'Tractors',
          value: stats.tractors,
          icon: 'truck',
          color: colors.primary,
        },
        {
          id: 'implements',
          label: 'Implements',
          value: stats.implements,
          icon: 'tool',
          color: colors.secondary,
        },
        {
          id: 'simulations',
          label: 'Simulations',
          value: stats.simulations,
          icon: 'activity',
          color: colors.accent,
        },
        {
          id: 'reports',
          label: 'Reports',
          value: allSessions.length,
          icon: 'bar-chart-2',
          color: colors.warning,
        },
      ]
    : [];

  /** Researcher-only sidebar (owner uses global OwnerSidebarProvider). */
  const researcherSidebarItems = [
    {
      id: 'simulations',
      label: 'Simulations',
      icon: 'activity',
      onPress: () =>
        useSimulationStack
          ? nav.navigate('SimulationStackScreen')
          : nav.navigate('SimulationsTab', { screen: 'SimulationHistory' }),
    },
    {
      id: 'iot',
      label: 'IoT Dashboard',
      icon: 'radio',
      onPress: () =>
        useSidebarNav
          ? nav.navigate('IoTStackScreen')
          : nav.navigate('IoTTab', { screen: 'IoTDashboard' }),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'bar-chart-2',
      onPress: () => nav.navigate('Reports'),
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <Animated.View
        style={[
          styles.headerStack,
          { paddingTop: insets.top },
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim.y }],
          },
        ]}
      >
        <View style={styles.headerSection}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerLeft}>
              {isOwner ? <OwnerScreenMenuButton variant="home" /> : null}
              {isResearcher ? (
                <Pressable
                  onPress={() => setSidebarVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open sidebar"
                  style={styles.menuButton}
                >
                  <Feather name="menu" size={20} color={colors.primary} />
                </Pressable>
              ) : null}
              <View style={styles.headerTitles}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Tractor Performance DSS
                </Text>
              </View>
            </View>

            {!useSidebarNav && user ? (
              <Pressable
                onPress={() => logout()}
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                style={styles.signOutButton}
              >
                <Text style={styles.signOutText}>Sign out</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: insets.top + 96,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!useSidebarNav ? (
          <Animated.View
            style={[
              styles.runSimButtonWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateAnim.y }],
              },
            ]}
          >
            <Button
              onPress={() =>
                useSimulationStack
                  ? nav.navigate('SimulationStackScreen', { screen: 'SimulationSetup' })
                  : nav.navigate('SimulationsTab', { screen: 'SimulationSetup' })
              }
              style={styles.runSimButton}
            >
              <View style={styles.runSimButtonContent}>
                <Feather name="play-circle" size={20} color="#FFFFFF" />
                <Text style={styles.runSimButtonText}>Run Simulation</Text>
              </View>
            </Button>
          </Animated.View>
        ) : null}

        {!isLoading && !error ? (
          <Animated.View
            style={[
              styles.statsGrid,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateAnim.y }],
              },
            ]}
          >
            {statCards.map((stat) => (
              <Card
                key={stat.id}
                variant="elevated"
                spacing="comfortable"
                style={[
                  styles.statCard,
                  { width: isCompact ? width - horizontalPadding : twoColumnCardWidth },
                ]}
                accessible
                accessibilityLabel={`${stat.label}: ${stat.value}`}
              >
                <View style={styles.statCardLayout}>
                  <View style={styles.statCardTop}>
                    <Text style={styles.statLabel}>{stat.label.toUpperCase()}</Text>
                    <View
                      style={[
                        styles.statIconWrapper,
                        { backgroundColor: `${stat.color}20` },
                      ]}
                    >
                      <Feather name={stat.icon as any} size={24} color={stat.color} />
                    </View>
                  </View>

                  <Text style={styles.statValue}>{stat.value}</Text>

                  <Pressable
                    onPress={() => {
                      if (stat.id === 'tractors') {
                        nav.navigate('TractorsTab', { screen: 'TractorList' });
                      } else if (stat.id === 'implements') {
                        nav.navigate('ImplementsTab', { screen: 'ImplementList' });
                      } else if (stat.id === 'simulations') {
                        if (useSimulationStack) {
                          nav.navigate('SimulationStackScreen', { screen: 'SimulationHistory' });
                        } else {
                          nav.navigate('SimulationsTab', { screen: 'SimulationHistory' });
                        }
                      } else if (stat.id === 'reports') {
                        nav.navigate('Reports');
                      }
                    }}
                    style={styles.manageLink}
                  >
                    <Text style={styles.manageLinkText}>Manage →</Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </Animated.View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={typography.body}>Loading statistics...</Text>
          </View>
        ) : null}

        {error ? (
          <Card variant="outlined" style={styles.errorCard}>
            <Text style={{ color: colors.danger }}>Error: {error.message}</Text>
          </Card>
        ) : null}

        {user ? (
          <Animated.View
            style={[
              styles.dashboardLiveSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateAnim.y }],
              },
            ]}
          >
            <Text style={styles.dashboardSectionHeading}>ACTIVE SESSIONS RIGHT NOW</Text>
            {activeSessions.length === 0 ? (
              <Text style={styles.dashboardEmptyText}>No sessions running right now.</Text>
            ) : (
              activeSessions.map((session) => {
                const badge = operationBadgeColors(session.operation_type);
                const area = session.area_ha ?? 0;
                const unk =
                  typeof session.unacknowledged_alerts === 'number'
                    ? session.unacknowledged_alerts
                    : session.alerts_count ?? 0;
                const machine = session.tractor_name?.trim() || 'Tractor';
                const operator = session.operator_name?.trim() || 'Operator';
                return (
                  <Card key={session.id} variant="elevated" spacing="comfortable" style={styles.activeSessionCard}>
                    <View style={styles.activeSessionTopRow}>
                      <View style={[styles.operationBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.operationBadgeText, { color: badge.text }]}>
                          {session.operation_type}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.activeSessionTitleRow}>
                      <Text style={styles.activeSessionMachine}>{machine}</Text>
                      <Text style={styles.activeSessionOperator}>
                        {' · '}
                        {operator}
                      </Text>
                    </Text>
                    <View style={styles.activeSessionMidRow}>
                      <Text style={styles.activeSessionDuration}>
                        {formatRunningDuration(session.started_at, durationTick)}
                      </Text>
                      <Text style={styles.activeSessionMetaDot}> · </Text>
                      <Text style={styles.activeSessionArea}>
                        {fmtAreaHa(area, '0.0000 ha')} covered
                      </Text>
                    </View>
                    {unk > 0 ? (
                      <View style={styles.activeSessionAlertRow}>
                        <Feather name="alert-triangle" size={16} color="#EA580C" />
                        <Text style={styles.activeSessionAlertText}>
                          {unk} alert{unk === 1 ? '' : 's'}
                        </Text>
                      </View>
                    ) : null}
                    <Pressable
                      onPress={() => nav.navigate('ActiveSession', { sessionId: session.id })}
                      style={styles.viewLiveRow}
                      accessibilityRole="button"
                      accessibilityLabel="View live session"
                    >
                      <Text style={styles.viewLiveText}>View Live</Text>
                      <Feather name="arrow-right" size={18} color="#15803D" />
                    </Pressable>
                  </Card>
                );
              })
            )}

            <View style={styles.recentAlertsHeader}>
              <Text style={[styles.dashboardSectionHeading, styles.recentAlertsHeadingShrink]}>
                RECENT ALERTS
              </Text>
              {displayedAlerts.length > 0 ? (
                <View style={styles.recentAlertsHeaderCounts}>
                  {alertHeaderCounts.warnings > 0 ? (
                    <Text style={styles.recentAlertsWarnCount}>
                      {alertHeaderCounts.warnings} warning{alertHeaderCounts.warnings === 1 ? '' : 's'}
                    </Text>
                  ) : null}
                  {alertHeaderCounts.warnings > 0 && alertHeaderCounts.critical > 0 ? (
                    <Text style={styles.recentAlertsCountSep}> </Text>
                  ) : null}
                  {alertHeaderCounts.critical > 0 ? (
                    <Text style={styles.recentAlertsCritCount}>
                      {alertHeaderCounts.critical} critical
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
            {displayedAlerts.length === 0 ? (
              <Text style={styles.dashboardEmptyText}>No unacknowledged alerts.</Text>
            ) : (
              displayedAlerts.map((alert) => (
                <Card key={alert.id} variant="elevated" spacing="comfortable" style={styles.alertListCard}>
                  <View style={styles.alertListRow}>
                    <View style={[styles.alertDot, { backgroundColor: alertDotColor(alert) }]} />
                    <View style={styles.alertListBody}>
                      <Text style={styles.alertListMessage}>{alert.message}</Text>
                      <Text style={styles.alertListMeta}>
                        {formatAlertClock(alert.created_at)} · {alertLevelLabel(alert.alert_status)}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </Animated.View>
        ) : null}

        <Animated.View
          style={[
            styles.actionsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim.y }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Card
            variant="elevated"
            spacing="default"
            pressable
            onPress={() => nav.navigate('TractorsTab', { screen: 'TractorForm' })}
            accessibilityLabel="Add a new tractor"
          >
            <View style={styles.actionItem}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#4CAF5020' }]}>
                <Feather name="truck" size={24} color={colors.primary} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Add Tractor</Text>
                <Text style={styles.actionDesc}>Register a new tractor profile</Text>
              </View>
            </View>
          </Card>

          <Card
            variant="elevated"
            spacing="default"
            pressable
            onPress={() => nav.navigate('ImplementsTab', { screen: 'ImplementForm' })}
            accessibilityLabel="Add a new implement"
          >
            <View style={styles.actionItem}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#79554820' }]}>
                <Feather name="tool" size={24} color={colors.secondary} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Add Implement</Text>
                <Text style={styles.actionDesc}>Define implement parameters</Text>
              </View>
            </View>
          </Card>

          <Card
            variant="elevated"
            spacing="default"
            pressable
            onPress={() =>
              useSimulationStack
                ? nav.navigate('SimulationStackScreen', { screen: 'SimulationHistory' })
                : nav.navigate('SimulationsTab', { screen: 'SimulationHistory' })
            }
            accessibilityLabel="View simulation history"
          >
            <View style={styles.actionItem}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#2196F320' }]}>
                <Feather name="clock" size={24} color={colors.accent} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>View History</Text>
                <Text style={styles.actionDesc}>Compare past simulations</Text>
              </View>
            </View>
          </Card>

        </Animated.View>

        {currentUser?.role === 'operator' ? (
          <TouchableOpacity
            onPress={() => nav.navigate('SessionSetup')}
            style={styles.startOperationButton}
            accessibilityRole="button"
            accessibilityLabel="Start New Operation"
          >
            <Text style={styles.startOperationText}>Start New Operation</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {isResearcher ? (
        <Modal
          visible={sidebarVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSidebarVisible(false)}
        >
          <View style={styles.sidebarOverlay}>
            <SafeAreaView
              edges={['top', 'bottom', 'left']}
              style={styles.sidebarSafeArea}
            >
              <View style={styles.sidebar}>
                <View style={styles.sidebarHeader}>
                  <View>
                    <Text style={styles.sidebarTitle}>Navigation</Text>
                    <Text style={styles.sidebarSubtitle}>Researcher tools</Text>
                  </View>
                  <Pressable onPress={() => setSidebarVisible(false)} style={styles.sidebarClose}>
                    <Feather name="x" size={18} color={colors.text} />
                  </Pressable>
                </View>

                <View style={styles.sidebarItems}>
                  {researcherSidebarItems.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.sidebarItem}
                      onPress={() => {
                        setSidebarVisible(false);
                        item.onPress();
                      }}
                    >
                      <View style={styles.sidebarIcon}>
                        <Feather name={item.icon as any} size={18} color={colors.primary} />
                      </View>
                      <Text style={styles.sidebarItemText}>{item.label}</Text>
                    </Pressable>
                  ))}
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
            </SafeAreaView>
            <Pressable style={styles.sidebarBackdrop} onPress={() => setSidebarVisible(false)} />
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  /** Header in document flow so scroll content never sits under it (avoids overlap with stat cards). */
  headerStack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 8,
    backgroundColor: colors.background,
  },
  mainScroll: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  signOutButton: {
    minHeight: 46,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 0,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: '#64748B',
    marginTop: 2,
  },
  runSimButtonWrapper: {
    marginBottom: spacing.xl,
  },
  runSimButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  runSimButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  runSimButtonText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  statCard: {
    alignSelf: 'flex-start',
  },
  statCardLayout: {
    gap: spacing.sm,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    fontWeight: '600',
    fontSize: 11,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginVertical: spacing.sm,
  },
  manageLink: {
    alignSelf: 'flex-start',
  },
  manageLinkText: {
    ...typography.labelSmall,
    color: colors.accent,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    marginBottom: spacing.lg,
  },
  dashboardLiveSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dashboardSectionHeading: {
    ...typography.labelSmall,
    color: colors.muted,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  dashboardEmptyText: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  activeSessionCard: {
    marginBottom: spacing.sm,
  },
  activeSessionTopRow: {
    marginBottom: spacing.sm,
  },
  operationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
  },
  operationBadgeText: {
    ...typography.labelSmall,
    fontWeight: '700',
  },
  activeSessionTitleRow: {
    marginBottom: spacing.sm,
  },
  activeSessionMachine: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  activeSessionOperator: {
    ...typography.body,
    fontWeight: '400',
    color: colors.muted,
  },
  activeSessionMidRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activeSessionDuration: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  activeSessionMetaDot: {
    ...typography.body,
    color: colors.muted,
  },
  activeSessionArea: {
    ...typography.body,
    color: colors.muted,
  },
  activeSessionAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  activeSessionAlertText: {
    ...typography.label,
    color: '#EA580C',
    fontWeight: '600',
  },
  viewLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  viewLiveText: {
    ...typography.label,
    color: '#15803D',
    fontWeight: '700',
  },
  recentAlertsHeadingShrink: {
    flex: 1,
    marginBottom: 0,
    minWidth: 0,
  },
  recentAlertsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  recentAlertsHeaderCounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flexShrink: 0,
    maxWidth: '55%',
  },
  recentAlertsWarnCount: {
    ...typography.labelSmall,
    color: '#EA580C',
    fontWeight: '600',
  },
  recentAlertsCritCount: {
    ...typography.labelSmall,
    color: '#DC2626',
    fontWeight: '700',
  },
  recentAlertsCountSep: {
    ...typography.labelSmall,
    color: colors.muted,
  },
  alertListCard: {
    marginBottom: spacing.sm,
  },
  alertListRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  alertListBody: {
    flex: 1,
    minWidth: 0,
  },
  alertListMessage: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  alertListMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  actionsSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.h5,
    color: colors.text,
  },
  actionDesc: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  startOperationButton: {
    marginTop: spacing.lg,
    backgroundColor: '#1E6B3C',
    borderRadius: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startOperationText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
  },
  sidebarSafeArea: {
    width: 280,
    backgroundColor: '#FFFFFF',
  },
  sidebar: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  sidebarBackdrop: {
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sidebarTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  sidebarSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  sidebarClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarItems: {
    gap: spacing.sm,
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#F8FAFC',
  },
  sidebarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarItemText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  sidebarSignOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  sidebarSignOutText: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '700',
  },
});
