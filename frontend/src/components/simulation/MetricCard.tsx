import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Card } from '../common/Card';
import { colors } from '../../constants/colors';
import { spacing, typography, borderRadius } from '../../theme';

export interface SimulationMetricCardProps {
  label: string;
  value: number | null;
  unit?: string;
  icon: string;
  decimals: number;
  delay?: number;
  showProgressBar?: boolean;
  progressMax?: number;
  statusColor?: string;
  iconColor?: string;
}

/** Maps semantic icon names to Feather glyphs (simulation results UI). */
const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  gauge: 'activity',
  zap: 'zap',
  'trending-down': 'trending-down',
  link: 'link',
  activity: 'activity',
  percent: 'percent',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  battery: 'battery',
  target: 'target',
  'check-square': 'check-square',
  'trending-up': 'trending-up',
  clock: 'clock',
  droplets: 'droplet',
  fuel: 'droplet',
  award: 'award',
  package: 'package',
};

export function SimulationMetricCard({
  label,
  value,
  unit,
  icon,
  decimals,
  delay = 0,
  showProgressBar,
  progressMax = 100,
  statusColor,
  iconColor,
}: SimulationMetricCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const numColor = statusColor ?? colors.text;
  const ico = ICON_MAP[icon] ?? 'circle';

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay, opacity]);

  const display =
    value === null || value === undefined || Number.isNaN(value) ? '—' : value.toFixed(decimals);

  const progress =
    showProgressBar && value != null && Number.isFinite(value) && progressMax > 0
      ? Math.min(100, Math.max(0, (value / progressMax) * 100))
      : null;

  return (
    <Animated.View style={{ opacity }}>
      <Card variant="elevated" spacing="comfortable" style={styles.card}>
        <View style={styles.row}>
          <View style={styles.labelCol}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.valueRow}>
              <Text style={[styles.value, { color: numColor }]}>{display}</Text>
              {unit ? <Text style={styles.unit}> {unit}</Text> : null}
            </View>
          </View>
          <View style={[styles.iconWrap, { backgroundColor: `${iconColor ?? colors.primary}18` }]}>
            <Feather name={ico} size={22} color={iconColor ?? colors.primary} />
          </View>
        </View>
        {progress != null ? (
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${progress}%`, backgroundColor: numColor }]} />
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  label: {
    ...typography.labelSmall,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  value: {
    ...typography.h4,
    fontWeight: '700',
  },
  unit: {
    ...typography.body,
    color: colors.muted,
    fontWeight: '600',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted + '33',
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
