import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { MetricCard } from './MetricCard';
import { colors } from '../../constants/colors';
import { spacing, typography } from '../../theme';

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function ResultsDisplay({ results }: { results: any }) {
  if (!results) return null;

  const metrics: any = results;
  let delayCounter = 0;

  const getMetricColor = (metricName: string, value: number | null): string => {
    if (value == null) return colors.text;
    if (metricName === 'slip') {
      return value > 20 ? colors.danger : value > 15 ? colors.warning : colors.success;
    }
    if (metricName === 'efficiency') {
      return value < 60 ? colors.danger : value < 75 ? colors.warning : colors.success;
    }
    if (metricName === 'fuel') {
      return colors.accent;
    }
    return colors.primary;
  };

  const getDelay = () => {
    const current = delayCounter * 50;
    delayCounter++;
    return current;
  };

  const draftKN = toFiniteNumber(metrics.draft_force) ? (toFiniteNumber(metrics.draft_force) || 0) / 1000 : null;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance</Text>
        <MetricCard label="Draft Requirement" value={draftKN} unit="kN" icon="gauge" decimals={2} delay={getDelay()} showProgressBar progressMax={50} />
        <MetricCard label="Drawbar Power" value={toFiniteNumber(metrics.drawbar_power)} unit="kW" icon="zap" decimals={2} delay={getDelay()} />
        <MetricCard label="Slip" value={toFiniteNumber(metrics.slip)} unit="%" icon="trending-down" decimals={1} delay={getDelay()} showProgressBar progressMax={25} statusColor={getMetricColor('slip', toFiniteNumber(metrics.slip))} />
        <MetricCard label="Coefficient Net Traction" value={toFiniteNumber(metrics.coefficient_net_traction)} decimals={3} icon="link" delay={getDelay()} />
        <MetricCard label="Motion Resistance Ratio" value={toFiniteNumber(metrics.motion_resistance)} decimals={3} icon="activity" delay={getDelay()} />
        <MetricCard label="Tractive Efficiency" value={toFiniteNumber(metrics.traction_efficiency)} unit="%" icon="percent" decimals={1} delay={getDelay()} showProgressBar progressMax={100} statusColor={getMetricColor('efficiency', toFiniteNumber(metrics.traction_efficiency))} />
        <MetricCard label="Front Weight Utilization" value={toFiniteNumber(metrics.front_weight_utilization)} decimals={2} icon="arrow-up" delay={getDelay()} />
        <MetricCard label="Rear Weight Utilization" value={toFiniteNumber(metrics.rear_weight_utilization)} decimals={2} icon="arrow-down" delay={getDelay()} />
        <MetricCard label="Power Utilization" value={toFiniteNumber(metrics.power_utilization)} unit="%" icon="battery" decimals={1} delay={getDelay()} showProgressBar progressMax={100} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Field Efficiency</Text>
        <MetricCard label="Theoretical Field Capacity" value={toFiniteNumber(metrics.field_capacity_theoretical)} unit="ha/h" icon="target" decimals={2} delay={getDelay()} />
        <MetricCard label="Actual Field Capacity" value={toFiniteNumber(metrics.field_capacity_actual)} unit="ha/h" icon="check-square" decimals={2} delay={getDelay()} />
        <MetricCard label="Field Efficiency" value={toFiniteNumber(metrics.field_efficiency)} unit="%" icon="trending-up" decimals={1} delay={getDelay()} showProgressBar progressMax={100} statusColor={getMetricColor('efficiency', toFiniteNumber(metrics.field_efficiency))} />
        <MetricCard label="Total Time Requirement" value={toFiniteNumber(metrics.total_time_hours)} unit="h" icon="clock" decimals={2} delay={getDelay()} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fuel & Overall</Text>
        <MetricCard label="Specific Fuel Consumption" value={toFiniteNumber(metrics.specific_fuel_consumption)} unit="l/kW-h" icon="droplets" decimals={3} delay={getDelay()} iconColor={colors.accent} />
        <MetricCard label="Fuel Consumption" value={toFiniteNumber(metrics.fuel_consumption_per_hectare)} unit="l/ha" icon="fuel" decimals={2} delay={getDelay()} statusColor={colors.accent} />
        <MetricCard label="Overall Efficiency" value={toFiniteNumber(metrics.overall_efficiency)} unit="%" icon="award" decimals={1} delay={getDelay()} showProgressBar progressMax={100} statusColor={getMetricColor('efficiency', toFiniteNumber(metrics.overall_efficiency))} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ballast</Text>
        <MetricCard label="Front Ballast Required" value={toFiniteNumber(metrics.ballast_front_required)} unit="kg" icon="package" decimals={1} delay={getDelay()} iconColor={colors.warning} statusColor={colors.warning} />
        <MetricCard label="Rear Ballast Required" value={toFiniteNumber(metrics.ballast_rear_required)} unit="kg" icon="package" decimals={1} delay={getDelay()} iconColor={colors.warning} statusColor={colors.warning} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
});
