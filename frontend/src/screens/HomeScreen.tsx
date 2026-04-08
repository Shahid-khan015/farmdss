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
import { Feather } from '@expo/vector-icons';

import { Button } from '../components/common/Button';
import { AlertNotificationPopup } from '../components/common/AlertNotificationPopup';
import { Card } from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/colors';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useActiveSession, useSessions } from '../hooks/useSession';
import { fetchAlerts, type AlertResponse } from '../services/AlertService';
import { borderRadius, spacing, typography } from '../theme';

interface StatCard {
  id: string;
  label: string;
  value: number;
  icon: string;
  color: string;
}

export function HomeScreen() {
  const nav = useNavigation<any>();
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
  const sessionListFilters = useMemo(
    () => (isOwner ? { limit: 100, offset: 0 } : {}),
    [isOwner],
  );
  const { sessions: allSessions } = useSessions(sessionListFilters);
  const [recentAlerts, setRecentAlerts] = useState<AlertResponse[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [dismissedPopupAlertId, setDismissedPopupAlertId] = useState<string | null>(null);
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
    if (!isOwner) return;
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadRecentAlerts = async () => {
      try {
        const { items } = await fetchAlerts({
          acknowledged: false,
          limit: 3,
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
  }, [isOwner]);

  const thisMonth = useMemo(() => {
    if (!isOwner) return { area: 0, total: 0 };
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthSessions = allSessions.filter((session) => {
      const started = new Date(session.started_at);
      return started.getMonth() === month && started.getFullYear() === year;
    });
    const area = monthSessions.reduce((sum, session) => sum + (session.area_ha ?? 0), 0);
    return { area, total: monthSessions.length };
  }, [allSessions, isOwner]);
  const topOwnerAlert = useMemo(
    () =>
      recentAlerts.find((alert) => !alert.acknowledged && alert.id !== dismissedPopupAlertId) ?? null,
    [dismissedPopupAlertId, recentAlerts],
  );

  useEffect(() => {
    if (recentAlerts.length === 0) {
      setDismissedPopupAlertId(null);
    }
  }, [recentAlerts]);

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

  const sidebarItems = [
    {
      id: 'reports',
      label: 'Reports',
      icon: 'bar-chart-2',
      onPress: () => nav.navigate('Reports'),
    },
    ...(isOwner
      ? [
          {
            id: 'configuration',
            label: 'Configuration',
            icon: 'sliders',
            onPress: () => nav.navigate('Configuration'),
          },
          {
            id: 'charges',
            label: 'Charges',
            icon: 'dollar-sign',
            onPress: () => nav.navigate('OperationCharges'),
          },
        ]
      : []),
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
      id: 'simulations',
      label: 'Simulations',
      icon: 'activity',
      onPress: () =>
        useSimulationStack
          ? nav.navigate('SimulationStackScreen')
          : nav.navigate('SimulationsTab', { screen: 'SimulationHistory' }),
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim.y }],
            },
          ]}
        >
          <View style={styles.headerTitleRow}>
            <View style={styles.headerLeft}>
              {useSidebarNav ? (
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
                <Text style={styles.headerSubtitle}>Tractor Performance DSS</Text>
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
        </Animated.View>

        {isOwner ? (
          <AlertNotificationPopup
            alert={topOwnerAlert}
            subtitle="Owner dashboard"
            onClose={() => setDismissedPopupAlertId(topOwnerAlert?.id ?? null)}
          />
        ) : null}

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

          {isOwner ? (
            <>
              <Card
                variant="elevated"
                spacing="default"
                pressable
                onPress={() => {
                  const first = activeSessions[0];
                  if (first) nav.navigate('ActiveSession', { sessionId: first.id });
                  else nav.navigate('Sessions');
                }}
                accessibilityLabel="Active sessions"
              >
                <View style={styles.actionItem}>
                  <View style={[styles.actionIconWrapper, { backgroundColor: '#4CAF5020' }]}>
                    <Feather name="activity" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>
                      Active operations{activeSessions.length ? ` (${activeSessions.length})` : ''}
                    </Text>
                    <Text style={styles.actionDesc}>
                      {activeSessions.length ? 'Open the latest live session' : 'View session history'}
                    </Text>
                  </View>
                </View>
              </Card>

              <Card
                variant="elevated"
                spacing="default"
                pressable
                onPress={() => nav.navigate('Sessions')}
                accessibilityLabel="This month summary"
              >
                <View style={styles.actionItem}>
                  <View style={[styles.actionIconWrapper, { backgroundColor: '#79554820' }]}>
                    <Feather name="calendar" size={24} color={colors.secondary} />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>This month</Text>
                    <Text style={styles.actionDesc}>
                      {thisMonth.area.toFixed(2)} ha · {thisMonth.total} sessions
                      {recentAlerts[0] ? ` · Latest alert: ${recentAlerts[0].feed_key}` : ''}
                    </Text>
                  </View>
                </View>
              </Card>
            </>
          ) : null}
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

      <Modal
        visible={sidebarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <View>
                <Text style={styles.sidebarTitle}>Navigation</Text>
                <Text style={styles.sidebarSubtitle}>
                  {isOwner ? 'Owner tools' : 'Researcher tools'}
                </Text>
              </View>
              <Pressable onPress={() => setSidebarVisible(false)} style={styles.sidebarClose}>
                <Feather name="x" size={18} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.sidebarItems}>
              {sidebarItems.map((item) => (
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
          <Pressable style={styles.sidebarBackdrop} onPress={() => setSidebarVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  headerSection: {
    marginBottom: spacing.lg,
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
    gap: spacing.md,
    minWidth: 0,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  signOutButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  signOutText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.muted,
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
  sidebar: {
    width: 280,
    backgroundColor: '#FFFFFF',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
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
