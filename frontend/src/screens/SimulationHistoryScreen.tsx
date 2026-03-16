import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../constants/colors';
import { spacing, typography, borderRadius } from '../theme';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useDeleteSimulation, useSimulations } from '../hooks/useSimulations';
import { fmtNum } from '../utils/formatters';

export function SimulationHistoryScreen() {
  const nav = useNavigation<any>();
  const [tractorId, setTractorId] = useState('');
  const [implementId, setImplementId] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const params = useMemo(
    () => ({
      tractor_id: tractorId.trim() || undefined,
      implement_id: implementId.trim() || undefined,
      limit: 50,
      offset: 0,
    }),
    [tractorId, implementId]
  );
  const simsQ = useSimulations(params);
  const del = useDeleteSimulation();

  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const canCompare = selectedIds.length >= 2 && selectedIds.length <= 3;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={simsQ.isRefetching} onRefresh={() => simsQ.refetch()} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Simulation History</Text>
          <Text style={styles.headerSubtitle}>
            {simsQ.data?.items?.length || 0} simulation{simsQ.data?.items?.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Button
            variant="primary"
            size="md"
            onPress={() => nav.navigate('SimulationSetup')}
            style={{ flex: 1 }}
          >
            New Simulation
          </Button>
          <Button
            variant={canCompare ? 'secondary' : 'ghost'}
            size="md"
            disabled={!canCompare}
            onPress={() => nav.navigate('SimulationCompare', { ids: selectedIds.slice(0, 3) })}
            style={{ flex: 1, marginLeft: spacing.md }}
          >
            {`Compare (${selectedIds.length})`}
          </Button>
        </View>

        {/* Loading State */}
        {simsQ.isLoading && (
          <View style={styles.centerContainer}>
            <LoadingSpinner />
          </View>
        )}

        {/* Error State */}
        {simsQ.error && (
          <Card variant="outlined" style={styles.errorCard}>
            <ErrorMessage message={(simsQ.error as Error).message} />
          </Card>
        )}

        {/* List of Simulations */}
        {!simsQ.isLoading && !simsQ.error && simsQ.data?.items?.length ? (
          <View style={styles.listContainer}>
            {simsQ.data.items.map((simulation, index) => (
              <Card
                key={simulation.id}
                variant="elevated"
                spacing="default"
                style={[
                  styles.simulationCard,
                  index === simsQ.data.items.length - 1 && styles.lastCard,
                ]}
              >
                <View style={styles.simulationCardContent}>
                  {/* Header with checkbox */}
                  <View style={styles.simulationHeader}>
                    <View style={styles.simulationInfo}>
                      <Text style={styles.simulationName}>
                        {simulation.name || 'Simulation'}
                      </Text>
                      <Text style={styles.simulationDate}>
                        {new Date(simulation.created_at).toLocaleString()}
                      </Text>
                    </View>
                    <Checkbox
                      status={selected[simulation.id] ? 'checked' : 'unchecked'}
                      onPress={() =>
                        setSelected((prev) => ({
                          ...prev,
                          [simulation.id]: !prev[simulation.id],
                        }))
                      }
                    />
                  </View>

                  {/* Metrics */}
                  <View style={styles.metricsRow}>
                    <View style={styles.metric}>
                      <Feather
                        name="trending-up"
                        size={16}
                        color={colors.primary}
                        style={styles.metricIcon}
                      />
                      <View>
                        <Text style={styles.metricLabel}>Slip</Text>
                        <Text style={styles.metricValue}>
                          {fmtNum(simulation.slip, 1)}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metric}>
                      <Feather
                        name="zap"
                        size={16}
                        color={colors.secondary}
                        style={styles.metricIcon}
                      />
                      <View>
                        <Text style={styles.metricLabel}>Efficiency</Text>
                        <Text style={styles.metricValue}>
                          {fmtNum(simulation.overall_efficiency, 1)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsButtonsRow}>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() =>
                        nav.navigate('SimulationResult', { id: simulation.id })
                      }
                      style={{ flex: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={del.isPending}
                      onPress={async () => {
                        await del.mutateAsync(simulation.id);
                      }}
                      style={{ flex: 1, marginLeft: spacing.md }}
                    >
                      Delete
                    </Button>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : !simsQ.isLoading && !simsQ.error ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconWrapper}>
              <Feather name="activity" size={48} color={colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>No Simulations Found</Text>
            <Text style={styles.emptyDescription}>
              Run a new simulation to get started
            </Text>
            <Button
              variant="primary"
              size="md"
              onPress={() => nav.navigate('SimulationSetup')}
              style={styles.emptyActionButton}
            >
              Create New Simulation
            </Button>
          </View>
        ) : null}
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => nav.navigate('SimulationSetup')}
        style={styles.fab}
        accessible
        accessibilityLabel="Create new simulation"
        accessibilityRole="button"
      >
        <Feather name="plus" size={24} color={colors.surface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerSection: {
    marginBottom: spacing.xl,
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
  filtersSection: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  filterInput: {
    marginVertical: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  centerContainer: {
    paddingVertical: spacing.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    marginBottom: spacing.lg,
  },
  listContainer: {
    gap: spacing.md,
  },
  simulationCard: {
    marginBottom: 0,
  },
  lastCard: {
    marginBottom: spacing.lg,
  },
  simulationCardContent: {
    gap: spacing.md,
  },
  simulationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  simulationInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  simulationName: {
    ...typography.h5,
    color: colors.text,
  },
  simulationDate: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
  },
  metricIcon: {
    marginRight: spacing.xs,
  },
  metricLabel: {
    ...typography.labelSmall,
    color: colors.muted,
  },
  metricValue: {
    ...typography.label,
    color: colors.text,
  },
  actionsButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  emptyStateContainer: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyActionButton: {
    minWidth: 240,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
});

