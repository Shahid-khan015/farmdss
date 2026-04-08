import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
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

export function SessionHistoryScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const statusParam = selectedStatus === 'all' ? undefined : selectedStatus;
  const canStartSession = user?.role === 'operator';

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

    return (
      <ListEntityCard
        title={formatDateTime(item.started_at)}
        subtitle={operatorName}
        badge={{
          icon: <Activity size={14} color={opStyle.text} />,
          label: item.operation_type,
          textColor: opStyle.text,
          backgroundColor: opStyle.bg,
        }}
        headerAccessory={
          <View style={[styles.statusPill, { backgroundColor: sStyle.bg }]}>
            <Text style={[styles.statusPillText, { color: sStyle.text }]}>{sStyle.label}</Text>
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
            text: `Area: ${item.area_ha != null ? `${item.area_ha.toFixed(2)} ha` : '--'}`,
          },
          {
            icon: <Activity size={16} color={colors.primary} />,
            text:
              item.alerts_count && item.alerts_count > 0
                ? `Alerts: ${item.unacknowledged_alerts ?? 0} unacknowledged / ${item.alerts_count} total`
                : 'Alerts: none',
          },
        ]}
        onPress={() => nav.navigate('SessionSummary', { sessionId: item.id })}
        accessibilityLabel={`Session ${item.id}`}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => void refetch()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Session History</Text>
              {canStartSession ? (
                <Button onPress={() => nav.navigate('SessionSetup')} style={styles.newSessionButton}>
                  New Session
                </Button>
              ) : null}
            </View>
            <View style={styles.filtersRow}>
              {FILTERS.map((filter) => {
                const active = selectedStatus === filter.key;
                return (
                  <Pressable
                    key={filter.key}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setSelectedStatus(filter.key)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
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
  headerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
  newSessionButton: {
    backgroundColor: colors.primary,
    minHeight: 44,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: '#EEF2F7',
  },
  filterChipActive: {
    backgroundColor: `${colors.primary}20`,
  },
  filterChipText: {
    ...typography.bodySmall,
    color: '#475569',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primary,
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
});
