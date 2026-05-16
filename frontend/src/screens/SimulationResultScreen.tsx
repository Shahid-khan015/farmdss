import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../constants/colors';
import { spacing, typography, borderRadius } from '../theme';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CollapsibleSection } from '../components/common/CollapsibleSection';
import { RecommendationCard } from '../components/simulation/RecommendationCard';
import { LoadStatusGauge } from '../components/simulation/LoadStatusGauge';
import { Card } from '../components/common/Card';
import { useSimulation } from '../hooks/useSimulations';
import { downloadSimulationExport } from '../services/simulationService';
import { fmtAreaHa, fmtNum } from '../utils/formatters';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function getColorByMetric(metricName: string, value: number | null): string {
  if (value == null) return colors.muted;

  switch (metricName) {
    case 'slip':
      return value > 20 ? colors.danger : value > 15 ? colors.warning : colors.success;
    case 'efficiency':
    case 'field_efficiency':
    case 'traction_efficiency':
      return value < 60 ? colors.danger : value < 75 ? colors.warning : colors.success;
    case 'power_utilization':
      return value > 95 || value < 60 ? colors.warning : colors.success;
    default:
      return colors.primary;
  }
}

function getStatusColor(status?: string | null) {
  if (status === 'Stable') return colors.success;
  if (status === 'Heavy Load') return colors.warning;
  return colors.danger;
}

function buildEngineeringWarnings(data: any) {
  const warnings = Array.isArray(data.warnings) ? [...data.warnings] : [];
  const slip = toFiniteNumber(data.slip);
  const powerUtil = toFiniteNumber(data.power_utilization);
  const fieldEff = toFiniteNumber(data.field_efficiency);
  const status = data.status;
  if (slip !== null && slip > 15) warnings.push('High wheel slip detected.');
  if (powerUtil !== null && powerUtil > 95) warnings.push('Implement load exceeds optimal range.');
  if (fieldEff !== null && fieldEff < 60) warnings.push('Low field efficiency detected.');
  if (status === 'Unstable' || status === 'Not Recommended') warnings.push('Unstable operation detected.');
  return Array.from(new Set(warnings));
}

function buildDynamicRecommendations(data: any) {
  const provided = Array.isArray(data.recommendation_messages) ? data.recommendation_messages : [];
  const recommendations = [...provided];
  const slip = toFiniteNumber(data.slip);
  const draftForce = toFiniteNumber(data.draft_force);
  const tracEff = toFiniteNumber(data.traction_efficiency);
  const fuel = toFiniteNumber(data.fuel_consumption_per_hectare);
  const powerUtil = toFiniteNumber(data.power_utilization);
  if (slip !== null && slip > 15) recommendations.push('Add ballast', 'Reduce operating depth');
  if (powerUtil !== null && powerUtil > 90) recommendations.push('Reduce implement width', 'Increase tractor HP');
  if (tracEff !== null && tracEff < 60) recommendations.push('Reduce operating speed');
  if (fuel !== null && fuel > 45) recommendations.push('Reduce operating depth');
  if (draftForce !== null && powerUtil !== null && powerUtil > 85) recommendations.push('Use a lighter implement pass');
  return Array.from(new Set(recommendations));
}

export function SimulationResultScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { width } = Dimensions.get('window');
  const isCompact = width < 360;
  const isPhablet = width > 600;
  const id = route.params?.id as string;
  const simQ = useSimulation(id);
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'pdf' | null>(null);

  if (simQ.isLoading) return <LoadingSpinner />;
  if (simQ.error) return <ErrorMessage message={(simQ.error as Error).message} />;
  if (!simQ.data) return <ErrorMessage message="Simulation not found." />;

  const s = simQ.data;
  const r = { ...s, ...(s.results ?? {}) };

  // Extract key metrics from results
  const slip = toFiniteNumber((r as any).slip);
  const efficiency = toFiniteNumber((r as any).overall_efficiency);
  const powerUtil = toFiniteNumber((r as any).power_utilization);
  const fieldEff = toFiniteNumber((r as any).field_efficiency);
  const tracEff = toFiniteNumber((r as any).traction_efficiency);
  const loadStatus = (r as any).load_status ?? null;
  const statusMsg = s.status_message ?? (r as any).status_message ?? null;
  const simulationStatus = (r as any).status ?? (powerUtil !== null && powerUtil > 85 ? 'Heavy Load' : 'Stable');
  const confidence = (r as any).confidence ?? 'Moderate';
  const engineeringWarnings = buildEngineeringWarnings(r);
  const dynamicRecommendations = buildDynamicRecommendations(r);
  const recommendations = dynamicRecommendations.length
    ? dynamicRecommendations.join('; ')
    : s.recommendations ?? (r as any).recommendations ?? null;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* GRADIENT HEADER */}
        <LinearGradient
          colors={[colors.primary, '#66BB6A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerInfoRow}>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>ID: {s.id ? s.id.substring(0, 8).toUpperCase() : 'N/A'}</Text>
            </View>
            <Text style={styles.headerDateTime}>
              {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.engineeringBadgeRow}>
            <View style={[styles.engineeringStatusBadge, { backgroundColor: `${getStatusColor(simulationStatus)}25` }]}>
              <Text style={styles.engineeringBadgeLabel}>Status</Text>
              <Text style={styles.engineeringBadgeValue}>{simulationStatus}</Text>
            </View>
            <View style={styles.engineeringStatusBadge}>
              <Text style={styles.engineeringBadgeLabel}>Confidence</Text>
              <Text style={styles.engineeringBadgeValue}>{confidence}</Text>
            </View>
          </View>

          <View style={[styles.badgesRow, isCompact && { justifyContent: 'center' }]}>
            {slip !== null && (
              <View style={styles.statusBadge}>
                <Text style={styles.badgeLabel}>Slip</Text>
                <Text style={styles.badgeValue}>{fmtNum(slip, 1)}%</Text>
              </View>
            )}
            {efficiency !== null && (
              <View style={styles.statusBadge}>
                <Text style={styles.badgeLabel}>Eff</Text>
                <Text style={styles.badgeValue}>{fmtNum(efficiency, 1)}%</Text>
              </View>
            )}
            {powerUtil !== null && (
              <View style={styles.statusBadge}>
                <Text style={styles.badgeLabel}>Power</Text>
                <Text style={styles.badgeValue}>{fmtNum(powerUtil, 1)}%</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* LOAD STATUS GAUGE */}
        {powerUtil !== null && (
          <View style={styles.gaugeWrapper}>
            <LoadStatusGauge loadPercentage={powerUtil} />
          </View>
        )}

        {engineeringWarnings.length > 0 && (
          <View style={styles.warningStack}>
            {engineeringWarnings.map((warning) => (
              <View key={warning} style={styles.warningBanner}>
                <Feather name="alert-triangle" size={16} color={colors.warning} />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        {/* KEY METRICS GRID */}
        <View style={styles.keyMetricsContainer}>
          <View style={[styles.keyMetricsGrid, isPhablet && styles.keyMetricsGridWide]}>
          {slip !== null && (
            <Card variant="elevated" spacing="comfortable" style={styles.keyMetricCard}>
              <View style={styles.keyMetricContent}>
                <View style={[styles.keyMetricIcon, { backgroundColor: `${getColorByMetric('slip', slip)}20` }]}>
                  <Feather name="trending-down" size={22} color={getColorByMetric('slip', slip)} />
                </View>
                <Text style={styles.keyMetricLabel}>Slip</Text>
                <Text style={[styles.keyMetricValue, { color: getColorByMetric('slip', slip) }]}>
                  {fmtNum(slip, 1)}%
                </Text>
              </View>
            </Card>
          )}

          {efficiency !== null && (
            <Card variant="elevated" spacing="comfortable" style={styles.keyMetricCard}>
              <View style={styles.keyMetricContent}>
                <View style={[styles.keyMetricIcon, { backgroundColor: `${getColorByMetric('efficiency', efficiency)}20` }]}>
                  <Feather name="award" size={22} color={getColorByMetric('efficiency', efficiency)} />
                </View>
                <Text style={styles.keyMetricLabel}>Overall Eff.</Text>
                <Text style={[styles.keyMetricValue, { color: getColorByMetric('efficiency', efficiency) }]}>
                  {fmtNum(efficiency, 1)}%
                </Text>
              </View>
            </Card>
          )}

          {fieldEff !== null && (
            <Card variant="elevated" spacing="comfortable" style={styles.keyMetricCard}>
              <View style={styles.keyMetricContent}>
                <View style={[styles.keyMetricIcon, { backgroundColor: `${getColorByMetric('field_efficiency', fieldEff)}20` }]}>
                  <Feather name="layout" size={22} color={getColorByMetric('field_efficiency', fieldEff)} />
                </View>
                <Text style={styles.keyMetricLabel}>Field Eff.</Text>
                <Text style={[styles.keyMetricValue, { color: getColorByMetric('field_efficiency', fieldEff) }]}>
                  {fmtNum(fieldEff, 1)}%
                </Text>
              </View>
            </Card>
          )}

            {tracEff !== null && (
              <Card variant="elevated" spacing="comfortable" style={styles.keyMetricCard}>
                <View style={styles.keyMetricContent}>
                  <View style={[styles.keyMetricIcon, { backgroundColor: `${getColorByMetric('traction_efficiency', tracEff)}20` }]}>
                    <Feather name="zap" size={22} color={getColorByMetric('traction_efficiency', tracEff)} />
                  </View>
                  <Text style={styles.keyMetricLabel}>Traction Eff.</Text>
                  <Text style={[styles.keyMetricValue, { color: getColorByMetric('traction_efficiency', tracEff) }]}>
                    {fmtNum(tracEff, 1)}%
                  </Text>
                </View>
              </Card>
            )}
          </View>
        </View>

        {/* OPERATING CONDITIONS */}
        <CollapsibleSection title="Operating Conditions" icon="settings" defaultExpanded>
          <ConditionsGrid data={r} isPhablet={isPhablet} />
        </CollapsibleSection>

        {/* PERFORMANCE METRICS */}
        <CollapsibleSection title="Performance Metrics" icon="activity" defaultExpanded>
          <PerformanceMetricsGrid data={r} isPhablet={isPhablet} />
        </CollapsibleSection>

        {/* FIELD PERFORMANCE */}
        <CollapsibleSection title="Field Performance" icon="layout" defaultExpanded>
          <FieldPerformanceGrid data={r} isPhablet={isPhablet} />
        </CollapsibleSection>

        {/* FUEL & CONSUMPTION */}
        <CollapsibleSection title="Fuel Consumption" icon="droplets" defaultExpanded>
          <FuelConsumptionGrid data={r} isPhablet={isPhablet} />
        </CollapsibleSection>

        {/* BALLAST REQUIREMENTS */}
        <CollapsibleSection title="Ballast Requirements" icon="package" defaultExpanded>
          <BallastGrid data={r} isPhablet={isPhablet} />
        </CollapsibleSection>

        {/* RECOMMENDATIONS */}
        {(statusMsg || recommendations || slip !== null || loadStatus) && (
          <View style={styles.recommendationsWrapper}>
            <RecommendationCard statusMessage={statusMsg} recommendations={recommendations} slip={slip} loadStatus={loadStatus} />
          </View>
        )}

        {/* ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => nav.navigate('SimulationSetup')}
          >
            <Feather name="play-circle" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Run New</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => nav.navigate('SimulationHistory')}
          >
            <Feather name="list" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>History</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => {
              Alert.alert(
                'Export Simulation Report',
                'Choose a format to export this simulation result.',
                [
                  {
                    text: 'Export CSV',
                    onPress: async () => {
                      setExportingFormat('csv');
                      try {
                        await downloadSimulationExport(id, 'csv');
                      } catch (e: any) {
                        Alert.alert('Export Failed', e?.message ?? 'Could not export CSV');
                      } finally {
                        setExportingFormat(null);
                      }
                    },
                  },
                  {
                    text: 'Export PDF',
                    onPress: async () => {
                      setExportingFormat('pdf');
                      try {
                        await downloadSimulationExport(id, 'pdf');
                      } catch (e: any) {
                        Alert.alert('Export Failed', e?.message ?? 'Could not export PDF');
                      } finally {
                        setExportingFormat(null);
                      }
                    },
                  },
                  { text: 'Cancel', style: 'cancel' },
                ],
              );
            }}
          >
            {exportingFormat ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather name="download" size={20} color={colors.primary} />
            )}
            <Text style={styles.secondaryButtonText}>
              {exportingFormat ? `Export ${exportingFormat.toUpperCase()}...` : 'Export'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// Conditions Grid Component
function ConditionsGrid({ data, isPhablet }: { data: any; isPhablet: boolean }) {
  return (
    <View style={[styles.metricsGrid, isPhablet && styles.metricsGridWide]}>
      <MetricItem label="Depth" value={toFiniteNumber(data.depth)} unit="cm" />
      <MetricItem label="Speed" value={toFiniteNumber(data.speed)} unit="km/h" />
      <MetricItem label="Cone Index" value={toFiniteNumber(data.cone_index)} unit="kPa" />
      <MetricItem label="Field Area" value={fmtAreaHa(toFiniteNumber(data.field_area))} />
      <MetricItem label="Field Length" value={toFiniteNumber(data.field_length)} unit="m" />
      <MetricItem label="Field Width" value={toFiniteNumber(data.field_width)} unit="m" />
      <MetricItem label="Turns" value={data.number_of_turns} />
      <MetricItem label="Soil" value={`${data.soil_texture ?? '-'} / ${data.soil_hardness ?? '-'}`} />
    </View>
  );
}

// Performance Metrics Grid Component
function PerformanceMetricsGrid({ data, isPhablet }: { data: any; isPhablet: boolean }) {
  const draftKN = toFiniteNumber(data.draft_force) ? (toFiniteNumber(data.draft_force) || 0) / 1000 : null;

  return (
    <View style={[styles.metricsGrid, isPhablet && styles.metricsGridWide]}>
      <MetricCard label="Draft Force" value={draftKN} unit="kN" icon="tool" decimals={2} />
      <MetricCard label="Drawbar Power" value={toFiniteNumber(data.drawbar_power)} unit="kW" icon="zap" decimals={2} />
      <MetricCard label="Slip" value={toFiniteNumber(data.slip)} unit="%" icon="trending-down" decimals={1} showProgress color={getColorByMetric('slip', toFiniteNumber(data.slip))} rangeLabel="Optimal: 8-15%" />
      <MetricCard label="Net Traction" value={toFiniteNumber(data.coefficient_net_traction)} icon="link" decimals={3} />
      <MetricCard label="Motion Resistance" value={toFiniteNumber(data.motion_resistance)} icon="minimize-2" decimals={3} />
      <MetricCard label="Power Util." value={toFiniteNumber(data.power_utilization)} unit="%" icon="battery" decimals={1} showProgress color={getColorByMetric('power_utilization', toFiniteNumber(data.power_utilization))} rangeLabel="Target: 65-90%" />
      <MetricCard label="Front Weight" value={toFiniteNumber(data.front_weight_utilization)} icon="arrow-up" decimals={2} />
      <MetricCard label="Rear Weight" value={toFiniteNumber(data.rear_weight_utilization)} icon="arrow-down" decimals={2} />
    </View>
  );
}

// Field Performance Grid Component
function FieldPerformanceGrid({ data, isPhablet }: { data: any; isPhablet: boolean }) {
  return (
    <View style={[styles.metricsGrid, isPhablet && styles.metricsGridWide]}>
      <MetricCard label="Theoretical Cap." value={toFiniteNumber(data.field_capacity_theoretical)} unit="ha/h" icon="target" decimals={2} />
      <MetricCard label="Actual Cap." value={toFiniteNumber(data.field_capacity_actual)} unit="ha/h" icon="check" decimals={2} />
      <MetricCard label="Field Efficiency" value={toFiniteNumber(data.field_efficiency)} unit="%" icon="percent" decimals={1} showProgress color={getColorByMetric('field_efficiency', toFiniteNumber(data.field_efficiency))} rangeLabel="Typical: 70-90%" />
      <MetricCard label="Total Time" value={toFiniteNumber(data.total_time_hours)} unit="h" icon="clock" decimals={2} />
    </View>
  );
}

// Fuel Consumption Grid Component
function FuelConsumptionGrid({ data, isPhablet }: { data: any; isPhablet: boolean }) {
  return (
    <View style={[styles.metricsGrid, isPhablet && styles.metricsGridWide]}>
      <MetricCard label="Specific Fuel" value={toFiniteNumber(data.specific_fuel_consumption)} unit="l/kW·h" icon="droplet" decimals={3} color={colors.accent} />
      <MetricCard label="Fuel/Hectare" value={toFiniteNumber(data.fuel_consumption_per_hectare)} unit="l/ha" icon="droplet" decimals={2} color={colors.accent} />
      <MetricCard label="Overall Eff." value={toFiniteNumber(data.overall_efficiency)} unit="%" icon="award" decimals={1} showProgress color={getColorByMetric('efficiency', toFiniteNumber(data.overall_efficiency))} />
    </View>
  );
}

// Ballast Grid Component
function BallastGrid({ data, isPhablet }: { data: any; isPhablet: boolean }) {
  return (
    <View style={[styles.metricsGrid, isPhablet && styles.metricsGridWide]}>
      <MetricCard label="Front Ballast" value={toFiniteNumber(data.ballast_front_required)} unit="kg" icon="box" decimals={1} color={colors.warning} />
      <MetricCard label="Rear Ballast" value={toFiniteNumber(data.ballast_rear_required)} unit="kg" icon="box" decimals={1} color={colors.warning} />
    </View>
  );
}

// Metric Item Component (for conditions)
function MetricItem({ label, value, unit }: { label: string; value: any; unit?: string }) {
  const displayValue = typeof value === 'number' ? fmtNum(value, 2) : value ?? '-';

  return (
    <Card variant="filled" spacing="compact" style={styles.itemCard}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue}>
        {displayValue}
        {unit && ` ${unit}`}
      </Text>
    </Card>
  );
}

// Metric Card Component (for metrics) - FIXED AND SIMPLIFIED STRUCTURE
function MetricCard({
  label,
  value,
  unit,
  icon,
  decimals = 2,
  showProgress = false,
  color = colors.primary,
  rangeLabel,
}: {
  label: string;
  value: number | null;
  unit?: string;
  icon?: FeatherIconName;
  decimals?: number;
  showProgress?: boolean;
  color?: string;
  rangeLabel?: string;
}) {
  if (value === null) return null;

  return (
    <Card variant="elevated" spacing="comfortable" style={styles.metricItemCard}>
      <View style={styles.metricHeader}>
        {icon && (
          <View style={[styles.metricIconBox, { backgroundColor: `${color}15` }]}>
            <Feather name={icon} size={18} color={color} />
          </View>
        )}
        <Text style={styles.metricItemLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[styles.metricItemValue, { color }]}>
        {fmtNum(value, decimals)}
        {unit && ` ${unit}`}
      </Text>
      
      {/* FIX: 
        1. Single Track View with explicit height, background, radius, and overflow: hidden
        2. Single Fill View with height: 100% and dynamic width
      */}
      {showProgress && (
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressFill,
              {
                // Clamped width logic ensures it never exceeds 100%
                width: `${Math.max(0, Math.min(value ?? 0, 100))}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      )}
      {rangeLabel && <Text style={styles.rangeLabel}>{rangeLabel}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },

  // Header
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: 24,
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSimName: {
    ...typography.h5,
    color: '#FFFFFF',
    fontWeight: '700',
    flex: 1,
    marginHorizontal: spacing.md,
    textAlign: 'center',
  },
  idBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  idBadgeText: {
    ...typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerDateTime: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.85)',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flex: 1,
    minWidth: 85,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.xs,
    alignItems: 'center',
  },
  badgeLabel: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  badgeValue: {
    ...typography.monoLarge,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  engineeringBadgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  engineeringStatusBadge: {
    flex: 1,
    minWidth: 130,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  engineeringBadgeLabel: {
    ...typography.labelSmall,
    color: 'rgba(255,255,255,0.82)',
  },
  engineeringBadgeValue: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: spacing.xs,
  },

  // Gauges
  gaugeWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  warningStack: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },

  // Key Metrics
  keyMetricsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  keyMetricsGrid: {
    gap: spacing.md,
  },
  keyMetricsGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keyMetricCard: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 0,
    borderRadius: 20,
  },
  keyMetricContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  keyMetricIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyMetricLabel: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  keyMetricValue: {
    ...typography.h4,
    fontWeight: '700',
  },

  // Grids
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricsGridWide: {
    justifyContent: 'space-between',
  },

  // Item Card
  itemCard: {
    flex: 1,
    minWidth: '48%',
    marginBottom: 0,
  },
  itemLabel: {
    ...typography.labelSmall,
    color: colors.muted,
  },
  itemValue: {
    ...typography.label,
    color: colors.text,
    marginTop: spacing.xs,
  },

  // Metric Item Card
  metricItemCard: {
    flex: 1,
    minWidth: '48%',
    marginBottom: 0,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricItemLabel: {
    ...typography.bodySmall,
    color: colors.muted,
    flex: 1,
  },
  metricItemValue: {
    ...typography.h5,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  // NEW PROGRESS BAR STYLES
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: borderRadius.full,
    overflow: 'hidden', // Essential to clip the fill
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    // No borderRadius here - we let the parent clip it for a cleaner look
  },
  rangeLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },

  // Recommendations
  recommendationsWrapper: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  primaryButtonText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
  },
});
