import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { OwnerScreenMenuButton } from '../components/navigation/OwnerScreenMenuButton';
import { Activity, Clock3, Ruler, Tractor as TractorIcon } from 'lucide-react-native';

import { ListEntityCard } from '../components/common/ListEntityCard';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { useSessions } from '../hooks/useSession';
import { useTractors } from '../hooks/useTractors';
import type { SessionResponse } from '../services/SessionService';
import { borderRadius, spacing, typography } from '../theme';
import { fmtAreaHa } from '../utils/formatters';

type FilterStatus = 'all' | 'active' | 'completed' | 'aborted';

const FILTERS: Array<{ key: FilterStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'aborted', label: 'Aborted' },
];

const HISTORY_HEADER_OFFSET = 106;

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startedAt: string, endedAt?: string): string {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return '--';

  const mins = Math.floor((end - start) / 60000);
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function statusBadge(status: string) {
  if (status === 'active') {
    return { bg: '#E8F7EC', text: '#1E6B3C', label: 'ACTIVE' };
  }
  if (status === 'paused') {
    return { bg: '#FFF7E6', text: '#B45309', label: 'PAUSED' };
  }
  if (status === 'completed') {
    return { bg: '#E8F2FF', text: '#1D4ED8', label: 'COMPLETED' };
  }
  return { bg: '#EEF2F7', text: '#475569', label: 'ABORTED' };
}

function historyHeaderOffset(insetsTop: number): number {
  return insetsTop + HISTORY_HEADER_OFFSET;
}

export function SessionHistoryScreen() {
  const nav = useNavigation<any>();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const isOwner = user?.role === 'owner';
  const isOperator = user?.role === 'operator';
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const statusParam = selectedStatus === 'all' ? undefined : selectedStatus;
  const canStartSession = isOperator;

  const { sessions, isLoading, error, refetch } = useSessions({ status: statusParam });
  const tractorsQ = useTractors({ limit: 200, offset: 0, sort: 'name' });

  const tractorNameById = useMemo(() => {
    const items = tractorsQ.data?.items ?? [];
    return Object.fromEntries(items.map((t) => [t.id, t.name]));
  }, [tractorsQ.data?.items]);

  const renderItem = ({ item }: { item: SessionResponse }) => {
    const sStyle = statusBadge(item.status);
    const tractorName = tractorNameById[item.tractor_id] ?? 'Unknown tractor';
    const operatorName = item.operator_name ?? 'Assigned operator';
    const alertsText =
      item.alerts_count && item.alerts_count > 0
        ? `Alerts: ${item.unacknowledged_alerts ?? 0} unacknowledged / ${item.alerts_count} total`
        : 'Alerts: none';

    return (
      <ListEntityCard
        title={formatDateTime(item.started_at)}
        subtitle={operatorName}
        style={styles.historySessionCard}
        badge={{
          icon: <Activity size={14} color={colors.primary} />,
          label: item.operation_type,
          textColor: colors.primary,
          backgroundColor: `${colors.primary}12`,
        }}
        headerAccessory={
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isOperator ? '#E8F2FF' : sStyle.bg },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: isOperator ? '#1D4ED8' : sStyle.text },
              ]}
            >
              {isOperator
                ? `${sStyle.label.charAt(0)}${sStyle.label.slice(1).toLowerCase()}`
                : sStyle.label}
            </Text>
          </View>
        }
        specs={[
          {
            icon: <TractorIcon size={16} color={colors.primary} />,
            text: `Tractor: ${tractorName}`,
          },
          {
            icon: <Activity size={16} color={colors.primary} />,
            text: `Operator: ${operatorName}`,
          },
          {
            icon: <Clock3 size={16} color={colors.primary} />,
            text: `Duration: ${formatDuration(item.started_at, item.ended_at)}`,
          },
          {
            icon: <Ruler size={16} color={colors.primary} />,
            text: `Area: ${fmtAreaHa(item.area_ha)}`,
          },
          {
            icon: <Activity size={16} color={colors.primary} />,
            text: alertsText,
          },
        ]}
        onPress={() => nav.navigate('SessionSummary', { sessionId: item.id })}
        accessibilityLabel={`Session ${item.id}`}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.fixedHeaderShell, { paddingTop: insets.top }]}>
        <View style={styles.headerWrap}>
          <View style={styles.headerRow}>
            {isOwner ? <OwnerScreenMenuButton /> : null}
            {isOperator ? (
              <Pressable
                onPress={() => setSidebarVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Open sidebar"
                style={styles.menuButton}
              >
                <Feather name="menu" size={20} color="#166534" />
              </Pressable>
            ) : null}
            <Text style={styles.headerTitle} numberOfLines={1}>Session History</Text>
            {canStartSession ? (
              <Pressable
                onPress={() => nav.navigate('SessionSetup')}
                style={styles.newSessionButton}
                accessibilityRole="button"
                accessibilityLabel="Start new session"
              >
                <Feather name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.newSessionButtonText}>New Session</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => void refetch()}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: historyHeaderOffset(insets.top) },
        ]}
        ListHeaderComponent={
          <View style={styles.filtersShell}>
            <View style={styles.filtersRow}>
              {FILTERS.map((filter) => {
                const active = selectedStatus === filter.key;
                return (
                  <Pressable
                    key={filter.key}
                    style={[
                      styles.filterChip,
                      active && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedStatus(filter.key)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        active && styles.filterChipTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <TractorIcon size={44} color={colors.muted} />
              </View>
              <Text style={styles.emptyTitle}>No sessions yet.</Text>
              <Text style={styles.emptyDesc}>Tap Start to begin.</Text>
            </View>
          ) : null
        }
      />

      {isLoading ? <LoadingSpinner /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      {isOperator ? (
        <Modal
          visible={sidebarVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSidebarVisible(false)}
        >
          <View style={styles.sidebarOverlay}>
            <SafeAreaView edges={['top', 'bottom', 'left']} style={styles.sidebarSafeArea}>
              <View style={styles.sidebarPanel}>
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
                      nav.navigate('SimulationStackScreen', { screen: 'SimulationHistory' });
                    }}
                  >
                    <Feather name="activity" size={18} color={colors.primary} />
                    <Text style={styles.sidebarItemLabel}>Simulations</Text>
                  </Pressable>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  filtersShell: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  fixedHeaderShell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 6,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  newSessionButton: {
    minHeight: 40,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  newSessionButtonText: {
    ...typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: '#EEF2F7',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#DCFCE7',
  },
  filterChipText: {
    ...typography.body,
    color: '#475569',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#16A34A',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
  },
  emptyDesc: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  historySessionCard: {
    marginHorizontal: 0,
    width: '100%',
  },
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
  },
  sidebarSafeArea: {
    width: 280,
    maxWidth: '82%',
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  sidebarPanel: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  sidebarBackdrop: {
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sidebarTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  sidebarClose: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  sidebarItems: {
    gap: spacing.sm,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  sidebarItemLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
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
