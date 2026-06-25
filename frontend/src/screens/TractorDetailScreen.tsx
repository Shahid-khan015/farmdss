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
import { useDeleteTractor, useTractor } from '../hooks/useTractors';
import { useSimulations } from '../hooks/useSimulations';
import { fmtNum } from '../utils/formatters';

export function TractorDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string;

  const tractorQ = useTractor(id);
  const simsQ = useSimulations({ tractor_id: id, limit: 10, offset: 0 });
  const del = useDeleteTractor();

  if (tractorQ.isLoading) return <LoadingSpinner />;
  if (tractorQ.error) return <ErrorMessage message={(tractorQ.error as Error).message} />;
  if (!tractorQ.data) return <ErrorMessage message="Tractor not found." />;

  const t = tractorQ.data;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
       
        <View style={styles.headerContent}>
          <View style={styles.iconWrapper}>
            <Feather name="truck" size={24} color={colors.primary} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.headerTitle}>{t.name}</Text>
            <Text style={styles.headerSubtitle}>
              {t.manufacturer ? `${t.manufacturer} • ` : ''}
              {t.model} • {t.drive_mode}
            </Text>
          </View>
        </View>
      </View>

      {/* Power & Engine Section */}
      <CollapsibleSection title="Power & Engine" icon="zap" defaultExpanded>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>PTO Power</Text>
          <Text style={styles.specValue}>{fmtNum(t.pto_power)} kW</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Engine Speed</Text>
          <Text style={styles.specValue}>{t.rated_engine_speed ?? '-'} rpm</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Max Torque</Text>
          <Text style={styles.specValue}>{fmtNum(t.max_engine_torque)} N·m</Text>
        </View>
      </CollapsibleSection>

      {/* Geometry & Weight Section */}
      <CollapsibleSection title="Geometry & Weight" icon="square" defaultExpanded={false}>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Wheelbase</Text>
          <Text style={styles.specValue}>{fmtNum(t.wheelbase)} m</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Front Axle Weight</Text>
          <Text style={styles.specValue}>{fmtNum(t.front_axle_weight)} kg</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Rear Axle Weight</Text>
          <Text style={styles.specValue}>{fmtNum(t.rear_axle_weight)} kg</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Hitch Distance (Rear)</Text>
          <Text style={styles.specValue}>{fmtNum(t.hitch_distance_from_rear)} m</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>CG Distance (Rear)</Text>
          <Text style={styles.specValue}>{fmtNum(t.cg_distance_from_rear)} m</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Rear Wheel Rolling Radius</Text>
          <Text style={styles.specValue}>{fmtNum(t.rear_wheel_rolling_radius)} m</Text>
        </View>
      </CollapsibleSection>

      {/* Powertrain Settings Section */}
      <CollapsibleSection title="Powertrain Settings" icon="settings" defaultExpanded={false}>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Transmission Efficiency</Text>
          <Text style={styles.specValue}>{fmtNum(t.transmission_efficiency)} %</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Power Reserve</Text>
          <Text style={styles.specValue}>{fmtNum(t.power_reserve)} %</Text>
        </View>
      </CollapsibleSection>

      {/* Tire Specifications Section */}
      <CollapsibleSection title="Tire Specifications" icon="circle" defaultExpanded={false}>
        {t.tire_specification ? (
          <View style={styles.tireContent}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Type</Text>
              <Text style={styles.specValue}>{t.tire_specification.tire_type}</Text>
            </View>
            <Text style={styles.subSectionTitle}>Rear Tire</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Overall Diameter</Text>
              <Text style={styles.specValue}>{t.tire_specification.rear_overall_diameter ?? '-'} mm</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Section Width</Text>
              <Text style={styles.specValue}>{t.tire_specification.rear_section_width ?? '-'} mm</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Static Loaded Radius</Text>
              <Text style={styles.specValue}>{t.tire_specification.rear_static_loaded_radius ?? '-'} mm</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Rolling Radius</Text>
              <Text style={styles.specValue}>{t.tire_specification.rear_rolling_radius ?? '-'} mm</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyTireText}>No tire specifications available (required for simulations)</Text>
        )}
      </CollapsibleSection>

      {/* Action Button */}
      <View style={styles.actionButtons}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => nav.navigate('SimulationSetup', { tractorId: t.id })}
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
  subSectionTitle: {
    ...typography.h5,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  tireContent: {
    gap: spacing.md,
  },
  emptyTireText: {
    ...typography.body,
    color: colors.muted,
    fontStyle: 'italic',
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