import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../constants/colors';
import { spacing, typography, borderRadius } from '../theme';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ListEntityCard } from '../components/common/ListEntityCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useDeleteSimulation, useSimulations } from '../hooks/useSimulations';
import { fmtNum } from '../utils/formatters';

export function SimulationHistoryScreen() {
  const nav = useNavigation<any>();
  const [tractorId] = useState('');
  const [implementId] = useState('');
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
    .filter(([, value]) => value)
    .map(([id]) => id);

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
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Simulation History</Text>
          <Text style={styles.headerSubtitle}>
            {simsQ.data?.items?.length || 0} simulation{simsQ.data?.items?.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <Button
            variant="primary"
            size="md"
            onPress={() => nav.navigate('SimulationSetup')}
            style={styles.actionButton}
          >
            New Simulation
          </Button>
          <Button
            variant={canCompare ? 'secondary' : 'ghost'}
            size="md"
            disabled={!canCompare}
            onPress={() => nav.navigate('SimulationCompare', { ids: selectedIds.slice(0, 3) })}
            style={styles.actionButton}
          >
            {`Compare (${selectedIds.length})`}
          </Button>
        </View>

        {simsQ.isLoading ? (
          <View style={styles.centerContainer}>
            <LoadingSpinner />
          </View>
        ) : null}

        {simsQ.error ? (
          <Card variant="outlined" style={styles.errorCard}>
            <ErrorMessage message={(simsQ.error as Error).message} />
          </Card>
        ) : null}

        {!simsQ.isLoading && !simsQ.error && simsQ.data?.items?.length ? (
          <View style={styles.listContainer}>
            {simsQ.data.items.map((simulation, index) => (
              <ListEntityCard
                key={simulation.id}
                title={simulation.name || 'Simulation'}
                subtitle={new Date(simulation.created_at).toLocaleString()}
                badge={{
                  icon: <Feather name="activity" size={14} color={colors.primary} />,
                  label: 'History',
                  textColor: colors.primary,
                  backgroundColor: `${colors.primary}15`,
                }}
                specs={[
                  {
                    icon: <Feather name="trending-down" size={16} color={colors.primary} />,
                    text: `Slip ${fmtNum(simulation.slip, 1)}%`,
                  },
                  {
                    icon: <Feather name="award" size={16} color={colors.primary} />,
                    text: `Efficiency ${fmtNum(simulation.overall_efficiency, 1)}%`,
                  },
                ]}
                actions={[
                  {
                    label: 'View Result',
                    icon: <Feather name="eye" size={16} color="#FFFFFF" />,
                    variant: 'solid',
                    onPress: () => nav.navigate('SimulationResult', { id: simulation.id }),
                  },
                  {
                    label: 'Delete',
                    icon: <Feather name="trash-2" size={16} color="#FF4D4F" />,
                    variant: 'danger',
                    onPress: async () => {
                      await del.mutateAsync(simulation.id);
                    },
                  },
                ]}
                headerAccessory={
                  <Checkbox
                    status={selected[simulation.id] ? 'checked' : 'unchecked'}
                    onPress={() =>
                      setSelected((prev) => ({
                        ...prev,
                        [simulation.id]: !prev[simulation.id],
                      }))
                    }
                    color={colors.primary}
                  />
                }
                style={[
                  styles.simulationCard,
                  index === simsQ.data.items.length - 1 && styles.lastCard,
                ]}
              />
            ))}
          </View>
        ) : null}

        {!simsQ.isLoading && !simsQ.error && !simsQ.data?.items?.length ? (
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
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
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
    marginHorizontal: 0,
  },
  lastCard: {
    marginBottom: spacing.lg,
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
