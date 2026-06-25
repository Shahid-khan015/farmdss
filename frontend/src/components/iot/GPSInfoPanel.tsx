import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Card } from '../common/Card';
import { colors } from '../../constants/colors';
import { spacing, typography } from '../../theme';
import type { IoTFeedReading } from '../../types/iot';
import { formatGpsCoordinate } from '../../utils/iotFormat';

export interface GPSInfoPanelProps {
  reading?: IoTFeedReading;
}

export function GPSInfoPanel({ reading }: GPSInfoPanelProps) {
  const lat = reading?.lat;
  const lon = reading?.lon;
  const time = reading?.device_timestamp
    ? new Date(reading.device_timestamp).toLocaleTimeString('en-IN', { hour12: false })
    : '-';

  return (
    <Card variant="elevated" spacing="comfortable" style={styles.card}>
      <View style={styles.header}>
        <Feather name="map-pin" size={20} color={colors.primary} />
        <Text style={styles.title}>GPS INFO</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.k}>Lat</Text>
        <Text style={styles.v}>{formatGpsCoordinate(lat)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.k}>Lon</Text>
        <Text style={styles.v}>{formatGpsCoordinate(lon)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.k}>Time</Text>
        <Text style={styles.v}>{time}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  k: {
    ...typography.body,
    color: colors.muted,
  },
  v: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
});
