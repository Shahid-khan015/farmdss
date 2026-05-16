import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { OwnerScreenMenuButton } from '../components/navigation/OwnerScreenMenuButton';
import { Activity, Clock3, Ruler, Tractor as TractorIcon } from 'lucide-react-native';

import { Button } from '../components/common/Button';
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

function operationBadge(operationType: string) {
  if (operationType === 'Tillage') {
    return { bg: '#FFF3E8', text: '#C2410C' };
  }
  if (operationType === 'Sowing') {
    return { bg: '#E8F7EC', text: '#1E6B3C' };
  }
  if (operationType === 'Spraying') {
    return { bg: '#E8F2FF', text: '#1D4ED8' };
  }
  return { bg: '#EEF2F7', text: '#475569' };
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

function operatorHeaderOffset(insetsTop: number): number {
  return insetsTop + 88;
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
    const opStyle = operationBadge(item.operation_type);
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
        style={isOperator ? styles.operatorSessionCard : undefined}
        badge={{
          icon: <Activity size={14} color={isOperator ? colors.primary : opStyle.text} />,
          label: item.operation_type,
          textColor: isOperator ? colors.primary : opStyle.text,
          backgroundColor: isOperator ? `${colors.primary}12` : opStyle.bg,
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
        <View style={[styles.headerWrap, isOperator && styles.operatorHeaderWrap]}>
          <View style={[styles.headerRow, isOperator && styles.operatorHeaderRow]}>
            {isOwner ? <OwnerScreenMenuButton /> : null}
            {isOperator ? (
              <Pressable
                onPress={() => setSidebarVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Open sidebar"
                style={[styles.menuButton, styles.operatorMenuButton]}
              >
                <Feather name="menu" size={20} color="#166534" />
              </Pressable>
            ) : null}
            <Text style={[styles.headerTitle, isOperator && styles.operatorHeaderTitle]}>Session History</Text>
            {canStartSession ? (
              <Button
                onPress={() => nav.navigate('SessionSetup')}
                style={[styles.newSessionButton, isOperator && styles.operatorNewSessionButton]}
              >
                New Session
              </Button>
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
          isOperator && styles.operatorListContent,
          { paddingTop: isOperator ? operatorHeaderOffset(insets.top) : insets.top + 122 },
        ]}
        ListHeaderComponent={
          <View style={isOperator ? styles.operatorFiltersShell : undefined}>
            <View style={[styles.filtersRow, isOperator && styles.operatorFiltersRow]}>
              {FILTERS.map((filter) => {
                const active = selectedStatus === filter.key;
                return (
                  <Pressable
                    key={filter.key}
                    style={[
                      styles.filterChip,
                      isOperator && styles.operatorFilterChip,
                      active && styles.filterChipActive,
                      isOperator && active && styles.operatorFilterChipActive,
                    ]}
                    onPress={() => setSelectedStatus(filter.key)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isOperator && styles.operatorFilterChipText,
                        active && styles.filterChipTextActive,
                        isOperator && active && styles.operatorFilterChipTextActive,
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
            <View style={[styles.emptyState, isOperator && styles.operatorEmptyState]}>
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
    paddingBottom: spacing.xxl,
  },
  operatorListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  operatorFiltersShell: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  operatorHeaderWrap: {
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  operatorHeaderRow: {
    marginBottom: 0,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorMenuButton: {
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
  operatorHeaderTitle: {
    ...typography.h4,
    fontWeight: '700',
  },
  newSessionButton: {
    backgroundColor: colors.primary,
    minHeight: 44,
  },
  operatorNewSessionButton: {
    minHeight: 46,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#16A34A',
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  operatorFiltersRow: {
    marginTop: 0,
    marginBottom: 0,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: '#EEF2F7',
  },
  operatorFilterChip: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: `${colors.primary}20`,
  },
  operatorFilterChipActive: {
    backgroundColor: '#111827',
  },
  filterChipText: {
    ...typography.bodySmall,
    color: '#475569',
    fontWeight: '600',
  },
  operatorFilterChipText: {
    color: '#0F172A',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  operatorFilterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  operatorEmptyState: {
    paddingTop: spacing.xxxl,
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
  operatorSessionCard: {
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
