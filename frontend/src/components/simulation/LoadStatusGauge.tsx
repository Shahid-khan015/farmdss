import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../theme';

interface LoadStatusGaugeProps {
  loadPercentage: number;
}

function getLoadStatusColor(percentage: number): string {
  if (percentage >= 80) return colors.success;
  if (percentage >= 60) return colors.warning;
  return colors.danger;
}

function getLoadStatusLabel(percentage: number): string {
  if (percentage >= 80) return 'Optimal';
  if (percentage >= 60) return 'Moderate';
  return 'Low';
}

export function LoadStatusGauge({ loadPercentage }: LoadStatusGaugeProps) {
  const { width } = Dimensions.get('window');
  const gaugeWidth = Math.min(width - spacing.lg * 2, 400);
  const fillWidth = Math.min(loadPercentage, 100);
  const statusColor = getLoadStatusColor(loadPercentage);
  const statusLabel = getLoadStatusLabel(loadPercentage);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Power Utilization Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20`, borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.meta}>
        <Text style={styles.percentageValue}>{Math.round(fillWidth)}%</Text>
        <Text style={styles.rangeText}>Load Capacity</Text>
      </View>

      <View style={[styles.track, { width: gaugeWidth }]}>
        <View style={styles.zones}>
          <View style={[styles.zone, styles.zoneRed]} />
          <View style={[styles.zone, styles.zoneYellow]} />
          <View style={[styles.zone, styles.zoneGreen]} />
        </View>

        <View
          style={[
            styles.fill,
            {
              width: `${fillWidth}%`,
              backgroundColor: statusColor,
            },
          ]}
        />
      </View>

      <View style={styles.labels}>
        <Text style={styles.label}>
          <Text style={styles.labelValue}>0</Text>
          <Text style={styles.labelUnit}>%</Text>
        </Text>
        <Text style={styles.label}>
          <Text style={styles.labelValue}>50</Text>
          <Text style={styles.labelUnit}>%</Text>
        </Text>
        <Text style={styles.label}>
          <Text style={styles.labelValue}>100</Text>
          <Text style={styles.labelUnit}>%</Text>
        </Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
          <Text style={styles.legendLabel}>Optimal (80-100%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendLabel}>Moderate (60-79%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.danger }]} />
          <Text style={styles.legendLabel}>Low (&lt;60%)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  meta: {
    gap: spacing.xs,
  },

  percentageValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },

  rangeText: {
    fontSize: 12,
    color: colors.muted,
  },

  track: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  zones: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
  },

  zone: {
    flex: 1,
    opacity: 0.15,
  },

  zoneRed: {
    backgroundColor: colors.danger,
  },

  zoneYellow: {
    backgroundColor: colors.warning,
  },

  zoneGreen: {
    backgroundColor: colors.success,
  },

  fill: {
    height: '100%',
    borderRadius: borderRadius.lg,
  },

  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },

  label: {
    fontSize: 10,
    color: colors.muted,
    alignItems: 'center',
  },

  labelValue: {
    fontWeight: '700',
    color: colors.text,
  },

  labelUnit: {
    fontWeight: '400',
    color: colors.muted,
  },

  legend: {
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  legendColor: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.sm,
  },

  legendLabel: {
    fontSize: 12,
    color: colors.text,
  },
});
