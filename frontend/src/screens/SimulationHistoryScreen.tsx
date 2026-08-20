import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { SectionCard } from '../components/simulation/SectionCard';
import { ThemedButton } from '../components/common/ThemedButton';
import { useDeleteSimulation, useSimulations } from '../hooks/useSimulations';
import { useTheme } from '../theme/ThemeProvider';
import { toApiError } from '../services/apiError';
import { fmtNum } from '../utils/formatters';
import type { SimulationCombinationType } from '../types/simulation';

/** A conventional run and a combi run should be distinguishable at a glance. */
const MODE_BADGE: Record<
  SimulationCombinationType,
  { label: string; icon: keyof typeof Feather.glyphMap }
> = {
  single: { label: 'Conventional', icon: 'minus' },
  passive_passive: { label: 'Combi · P+P', icon: 'layers' },
  active_passive: { label: 'Combi · A+P', icon: 'rotate-cw' },
};

const MAX_COMPARE = 3;

export function SimulationHistoryScreen() {
  const nav = useNavigation<any>();
  const { colors, spacing, radius, typography } = useTheme();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const simsQ = useSimulations({ limit: 50, offset: 0 });
  const del = useDeleteSimulation();

  const items = simsQ.data?.items ?? [];
  const selectedIds = Object.entries(selected)
    .filter(([, value]) => value)
    .map(([id]) => id);
  const canCompare = selectedIds.length >= 2 && selectedIds.length <= MAX_COMPARE;

  const toggleSelected = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl + 64, gap: spacing.lg }}
        refreshControl={
          <RefreshControl refreshing={simsQ.isRefetching} onRefresh={() => simsQ.refetch()} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ gap: spacing.xs }}>
          <Text accessibilityRole="header" style={[typography.h2, { color: colors.textPrimary }]}>
            Simulation History
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            {items.length} simulation{items.length !== 1 ? 's' : ''}
            {selectedIds.length > 0 ? ` · ${selectedIds.length} selected` : ''}
          </Text>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <ThemedButton
            variant="primary"
            onPress={() => nav.navigate('SimulationSetup')}
            style={{ flex: 1 }}
            fullWidth
          >
            New Simulation
          </ThemedButton>
          <ThemedButton
            variant={canCompare ? 'outline' : 'ghost'}
            disabled={!canCompare}
            onPress={() => nav.navigate('SimulationCompare', { ids: selectedIds.slice(0, MAX_COMPARE) })}
            style={{ flex: 1 }}
            fullWidth
          >
            {`Compare (${selectedIds.length})`}
          </ThemedButton>
        </View>

        {simsQ.isLoading ? (
          <View style={{ gap: spacing.md }}>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </View>
        ) : null}

        {simsQ.error ? (
          <ErrorState error={toApiError(simsQ.error)} onRetry={() => simsQ.refetch()} />
        ) : null}

        {!simsQ.isLoading && !simsQ.error && items.length > 0 ? (
          <View style={{ gap: spacing.md }}>
            {items.map((simulation) => {
              const mode = (simulation.combination_type ?? 'single') as SimulationCombinationType;
              const badge = MODE_BADGE[mode];
              const isSelected = !!selected[simulation.id];

              return (
                <SectionCard key={simulation.id} compact>
                  <View style={styles.rowTop}>
                    <Pressable
                      onPress={() => toggleSelected(simulation.id)}
                      style={styles.rowTopLeft}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={`Select ${simulation.name || 'simulation'} for comparison`}
                    >
                      <Checkbox
                        status={isSelected ? 'checked' : 'unchecked'}
                        onPress={() => toggleSelected(simulation.id)}
                        color={colors.primary}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={[typography.h5, { color: colors.textPrimary }]}
                        >
                          {simulation.name || 'Simulation'}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textTertiary }]}>
                          {new Date(simulation.created_at).toLocaleString()}
                        </Text>
                      </View>
                    </Pressable>

                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.primarySurface, borderRadius: radius.full },
                      ]}
                    >
                      <Feather name={badge.icon} size={12} color={colors.primary} />
                      <Text style={[typography.labelSmall, { color: colors.primary }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
                    <View style={styles.stat}>
                      <Feather name="trending-down" size={14} color={colors.textSecondary} />
                      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                        Slip {fmtNum(simulation.slip, 1)}%
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Feather name="award" size={14} color={colors.textSecondary} />
                      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                        Efficiency {fmtNum(simulation.overall_efficiency, 1)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <ThemedButton
                      size="sm"
                      variant="primary"
                      onPress={() => nav.navigate('SimulationResult', { id: simulation.id })}
                      style={{ flex: 1 }}
                      fullWidth
                    >
                      View
                    </ThemedButton>
                    <ThemedButton
                      size="sm"
                      variant="outline"
                      onPress={() =>
                        nav.navigate('SimulationSetup', { prefillFromSimulationId: simulation.id })
                      }
                      style={{ flex: 1 }}
                      fullWidth
                    >
                      Re-run
                    </ThemedButton>
                    <ThemedButton
                      size="sm"
                      variant="destructive"
                      loading={del.isPending && del.variables === simulation.id}
                      onPress={() => del.mutate(simulation.id)}
                      style={{ flex: 1 }}
                      fullWidth
                    >
                      Delete
                    </ThemedButton>
                  </View>
                </SectionCard>
              );
            })}
          </View>
        ) : null}

        {!simsQ.isLoading && !simsQ.error && items.length === 0 ? (
          <EmptyState
            icon="activity"
            title="No Simulations Found"
            description="Run a new simulation to get started."
            actionLabel="Create New Simulation"
            onAction={() => nav.navigate('SimulationSetup')}
          />
        ) : null}
      </ScrollView>

      <Pressable
        onPress={() => nav.navigate('SimulationSetup')}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        accessible
        accessibilityLabel="Create new simulation"
        accessibilityRole="button"
      >
        <Feather name="plus" size={24} color={colors.textOnAccent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
});
