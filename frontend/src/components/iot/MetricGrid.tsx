import React from 'react';
import { View, StyleSheet } from 'react-native';

import { IOT_METRIC_DISPLAY_ORDER } from '../../constants/iotDisplay';
import { spacing } from '../../theme';
import type { IoTFeedKey, IoTFeedsMap } from '../../types/iot';
import { IoTMetricCard } from './IoTMetricCard';

export interface MetricGridProps {
  feeds: IoTFeedsMap;
}

export function MetricGrid({ feeds }: MetricGridProps) {
  return (
    <View style={styles.grid}>
      {IOT_METRIC_DISPLAY_ORDER.map((key: IoTFeedKey) => (
        <IoTMetricCard key={key} feedKey={key} reading={feeds[key]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
