import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Card } from '../common/Card';
import { colors } from '../../constants/colors';
import { IOT_FEED_UI } from '../../constants/iotDisplay';
import { spacing, typography } from '../../theme';
import type { IoTFeedKey, IoTFeedsMap, IoTStatusLabel } from '../../types/iot';
import { IOT_FEED_KEYS } from '../../types/iot';
import { formatFeedDisplayValue, statusToColor } from '../../utils/iotFormat';

export interface AlertsPanelProps {
  feeds: IoTFeedsMap;
}

export function AlertsPanel({ feeds }: AlertsPanelProps) {
  const alerts: { key: IoTFeedKey; label: string; detail: string; status: IoTStatusLabel }[] = [];

  for (const key of IOT_FEED_KEYS) {
    const r = feeds[key];
    if (!r || r.status_label === 'normal') continue;
    const ui = IOT_FEED_UI[key];
    alerts.push({
      key,
      label: ui.label,
      detail: formatFeedDisplayValue(r),
      status: r.status_label,
    });
  }

  return (
    <Card variant="elevated" spacing="comfortable" style={styles.card}>
      <View style={styles.header}>
        <Feather name="alert-triangle" size={20} color={colors.muted} />
        <Text style={styles.title}>Alerts</Text>
      </View>
      {alerts.length === 0 ? (
        <Text style={styles.empty}>No alerts</Text>
      ) : (
        alerts.map((a) => (
          <View key={a.key} style={styles.alertRow}>
            <Text style={[styles.alertLabel, { color: statusToColor(a.status) }]}>{a.label}</Text>
            <Text style={styles.alertDetail}>{a.detail}</Text>
          </View>
        ))
      )}
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
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  empty: {
    ...typography.body,
    color: colors.muted,
  },
  alertRow: {
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.muted + '44',
  },
  alertLabel: {
    ...typography.label,
    fontWeight: '700',
  },
  alertDetail: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: 2,
  },
});
