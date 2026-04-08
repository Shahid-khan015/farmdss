import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, typography } from '../../theme';

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
  const boundedValue = Math.max(0, Math.min(loadPercentage, 100));
  const statusColor = getLoadStatusColor(loadPercentage);
  const statusLabel = getLoadStatusLabel(loadPercentage);
  const segmentCount = 30;
  const activeSegments = Math.round((boundedValue / 100) * segmentCount);
  const gaugeSize = Math.min(gaugeWidth - spacing.xl, 220);
  const segmentLength = Math.max(12, gaugeSize * 0.1);
  const segmentThickness = Math.max(8, gaugeSize * 0.055);
  const radius = gaugeSize * 0.38;
  const centerX = gaugeSize / 2;
  const centerY = gaugeSize * 0.48;
  const gaugeHeight = gaugeSize * 0.82;
  const startAngle = 150;
  const sweepAngle = 240;
  const endAngle = startAngle + sweepAngle;
  const segments = Array.from({ length: segmentCount }, (_, index) => {
    const t = segmentCount === 1 ? 0 : index / (segmentCount - 1);
    const angle = startAngle + t * (endAngle - startAngle);
    const rad = (angle * Math.PI) / 180;
    return {
      key: `${angle}-${index}`,
      left: centerX + radius * Math.cos(rad) - segmentLength / 2,
      top: centerY + radius * Math.sin(rad) - segmentThickness / 2,
      angle,
      active: index < activeSegments,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Power Utilization Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20`, borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={[styles.gaugeFrame, { width: gaugeWidth }]}>
        <View style={[styles.segmentGauge, { width: gaugeSize, height: gaugeHeight }]}>
          {segments.map((segment) => (
            <View
              key={segment.key}
              style={[
                styles.segment,
                {
                  left: segment.left,
                  top: segment.top,
                  width: segmentLength,
                  height: segmentThickness,
                  backgroundColor: segment.active ? statusColor : '#F1F3F5',
                  transform: [{ rotate: `${segment.angle + 90}deg` }],
                },
              ]}
            />
          ))}
          <View style={styles.centerValueWrap}>
            <Text style={styles.centerValue}>{Math.round(boundedValue)}</Text>
            <Text style={styles.centerUnit}>%</Text>
          </View>
          <Text style={styles.rangeText}>Load Capacity</Text>
        </View>
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

  gaugeFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentGauge: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  segment: {
    position: 'absolute',
    borderRadius: borderRadius.full,
  },

  centerValueWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '34%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerValue: {
    ...typography.h1,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 44,
  },

  centerUnit: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: -4,
  },

  rangeText: {
    position: 'absolute',
    bottom: 0,
    ...typography.bodySmall,
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
