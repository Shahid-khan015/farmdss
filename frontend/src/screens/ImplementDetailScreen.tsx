import React from 'react';
import { ScrollView, View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../constants/colors';
import { spacing, typography, borderRadius } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CollapsibleSection } from '../components/common/CollapsibleSection';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useDeleteImplement, useImplement } from '../hooks/useImplements';
import { useSimulations } from '../hooks/useSimulations';
import { fmtNum } from '../utils/formatters';

export function ImplementDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string;

  const impQ = useImplement(id);
  const simsQ = useSimulations({ implement_id: id, limit: 10, offset: 0 });
  const del = useDeleteImplement();

  if (impQ.isLoading) return <LoadingSpinner />;
  if (impQ.error) return <ErrorMessage message={(impQ.error as Error).message} />;
  if (!impQ.data) return <ErrorMessage message="Implement not found." />;

  const i = impQ.data;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        
        <View style={styles.headerContent}>
          <View style={styles.iconWrapper}>
            <Feather name="tool" size={24} color={colors.primary} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.headerTitle}>{i.name}</Text>
            <Text style={styles.headerSubtitle}>
              {i.implement_type}
              {i.manufacturer ? ` • ${i.manufacturer}` : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Implement Properties Section */}
      <CollapsibleSection title="Properties" icon="square" defaultExpanded>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Width</Text>
          <Text style={styles.specValue}>{fmtNum(i.width)} m</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Weight</Text>
          <Text style={styles.specValue}>{fmtNum(i.weight)} kg</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>CG Distance from Hitch</Text>
          <Text style={styles.specValue}>{fmtNum(i.cg_distance_from_hitch)} m</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>V/H Ratio</Text>
          <Text style={styles.specValue}>{fmtNum(i.vertical_horizontal_ratio)}</Text>
        </View>
      </CollapsibleSection>

      {/* ASAE Parameters Section */}
      <CollapsibleSection title="ASAE Parameters" icon="settings" defaultExpanded={false}>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Parameter A</Text>
          <Text style={styles.specValue}>{fmtNum(i.asae_param_a)}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Parameter B</Text>
          <Text style={styles.specValue}>{fmtNum(i.asae_param_b)}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Parameter C</Text>
          <Text style={styles.specValue}>{fmtNum(i.asae_param_c)}</Text>
        </View>
      </CollapsibleSection>

      {/* Action Button */}
      <View style={styles.actionButtons}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => nav.navigate('SimulationSetup', { implementId: i.id })}
        >
          Run Simulation
        </Button>
      </View>

      {/* Recent Simulations Section */}
      <CollapsibleSection title="Recent Simulations" icon="activity" defaultExpanded={false}>
        {simsQ.isLoading ? (
          <Text style={styles.loadingText}>Loading simulations…</Text>
        ) : simsQ.error ? (
          <Text style={styles.errorText}>{(simsQ.error as Error).message}</Text>
        ) : simsQ.data?.items?.length ? (
          <View style={styles.simulationsList}>
            {simsQ.data.items.map((sim: any) => (
              <Card
                key={sim.id}
                variant="elevated"
                style={styles.simulationCard}
                pressable
                onPress={() => nav.navigate('SimulationResult', { id: sim.id })}
              >
                <View style={styles.simulationContent}>
                  <View>
                    <Text style={styles.simulationName}>{sim.name ?? 'Simulation'}</Text>
                    <Text style={styles.simulationDate}>
                      {new Date(sim.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.simulationMetrics}>
                    <View style={styles.metricBadge}>
                      <Text style={styles.metricValue}>{fmtNum(sim.slip)} %</Text>
                      <Text style={styles.metricLabel}>Slip</Text>
                    </View>
                    <View style={styles.metricBadge}>
                      <Text style={styles.metricValue}>{fmtNum(sim.overall_efficiency)} %</Text>
                      <Text style={styles.metricLabel}>Eff</Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No simulations yet</Text>
        )}
      </CollapsibleSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginTop: spacing.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  titleWrapper: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specLabel: {
    ...typography.body,
    color: colors.muted,
  },
  specValue: {
    ...typography.label,
    color: colors.text,
    fontWeight: '500',
  },
  actionButtons: {
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.muted,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
    fontStyle: 'italic',
  },
  simulationsList: {
    gap: spacing.md,
  },
  simulationCard: {
    marginBottom: 0,
  },
  simulationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
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
  simulationMetrics: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricBadge: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  metricValue: {
    ...typography.label,
    color: colors.primary,
  },
  metricLabel: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs / 2,
  },
});

