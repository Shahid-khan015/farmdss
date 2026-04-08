import React from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Card } from '../common/Card';
import { colors } from '../../constants/colors';
import { IOT_FEED_UI } from '../../constants/iotDisplay';
import { spacing, typography, borderRadius } from '../../theme';
import type { IoTFeedKey, IoTFeedReading } from '../../types/iot';
import {
  formatFeedDisplayValue,
  formatFreshness,
  formatUnitForDisplay,
  statusToColor,
} from '../../utils/iotFormat';

export interface IoTMetricCardProps {
  feedKey: IoTFeedKey;
  reading?: IoTFeedReading;
  fullWidth?: boolean;
}

export function IoTMetricCard({ feedKey, reading, fullWidth = false }: IoTMetricCardProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = spacing.lg * 2;
  const gridGap = spacing.md;
  const isCompact = width < 360;
  const cardWidth =
    fullWidth || isCompact
      ? width - horizontalPadding
      : (width - horizontalPadding - gridGap) / 2;

  const ui = IOT_FEED_UI[feedKey];
  const status = reading?.status_label;
  const accentColor = status ? statusToColor(status) : colors.muted;
  const borderColor = status ? statusToColor(status) : '#DDDDDD';
  const display = formatMetricValue(feedKey, reading);
  const unit = formatUnitForDisplay(reading?.unit ?? '', feedKey);
  const freshness = formatFreshness(reading?.device_timestamp ?? undefined);
  const staleText = getStaleText(reading?.device_timestamp);

  return (
    <Card
      variant="elevated"
      spacing="comfortable"
      style={[styles.card, { width: cardWidth, borderColor }]}
      accessibilityLabel={`${ui.label}: ${display} ${unit}`}
    >
      <View style={styles.top}>
        <View style={styles.labelBlock}>
          <Text style={styles.label}>{ui.label.toUpperCase()}</Text>
          {ui.subtitle ? <Text style={styles.subtitle}>{ui.subtitle}</Text> : null}
        </View>
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
          <Feather name={ui.icon as keyof typeof Feather.glyphMap} size={22} color={accentColor} />
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accentColor }]}>{display}</Text>
        {unit ? <Text style={styles.unitSuffix}> {unit}</Text> : null}
      </View>

      {staleText ? (
        <Text style={styles.stale}>{staleText}</Text>
      ) : (
        <Text style={styles.freshness}>{`Updated ${freshness}`}</Text>
      )}
    </Card>
  );
}

function formatMetricValue(feedKey: IoTFeedKey, reading?: IoTFeedReading): string {
  const value = reading?.numeric_value;
  if (value == null || Number.isNaN(value)) {
    return formatFeedDisplayValue(reading);
  }

  switch (feedKey) {
    case 'forward_speed':
    case 'depth_of_operation':
    case 'soil_moisture':
    case 'wheel_slip':
    case 'gearbox_temperature':
      return value.toFixed(1);
    case 'pto_shaft_speed':
      return value.toFixed(0);
    case 'field_capacity':
      return value.toFixed(2);
    default:
      return String(value);
  }
}

function getStaleText(deviceTimestamp: string | null | undefined): string | null {
  if (!deviceTimestamp) return null;
  const seenAt = Date.parse(deviceTimestamp);
  if (Number.isNaN(seenAt)) return null;
  const ageMs = Date.now() - seenAt;
  if (ageMs <= 30000) return null;
  return `Last seen ${Math.floor(ageMs / 60000)} min ago`;
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelBlock: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  label: {
    ...typography.labelSmall,
    color: colors.muted,
    fontWeight: '600',
    fontSize: 11,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: 2,
    fontSize: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginTop: spacing.sm,
  },
  value: {
    ...typography.h3,
    fontWeight: '700',
  },
  unitSuffix: {
    ...typography.body,
    fontWeight: '600',
    color: colors.muted,
  },
  freshness: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  stale: {
    ...typography.bodySmall,
    color: '#C55A11',
    marginTop: spacing.xs,
    fontSize: 11,
    fontStyle: 'italic',
  },
});
