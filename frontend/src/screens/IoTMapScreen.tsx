import React from 'react';
import { View, StyleSheet, Text, Linking, Platform } from 'react-native';

import { colors } from '../constants/colors';
import { spacing, typography } from '../theme';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useGPSPath } from '../hooks/useGPSPath';
import { formatGpsCoordinate } from '../utils/iotFormat';

export function IoTMapScreen() {
  const { coordinate, pathCoordinates, lastUpdated, isLoading, error, refetch } = useGPSPath();

  const openMaps = () => {
    if (!coordinate) return;
    const { latitude, longitude } = coordinate;
    const url =
      Platform.select({
        ios: `maps:0,0?q=${latitude},${longitude}`,
        android: `geo:0,0?q=${latitude},${longitude}(${latitude},${longitude})`,
        default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      }) ?? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Card variant="elevated" spacing="comfortable" style={styles.card}>
        <Text style={styles.title}>GPS (position_tracking)</Text>
        {error ? <Text style={styles.err}>{error.message}</Text> : null}
        {isLoading ? <Text style={styles.muted}>Loading…</Text> : null}
        <Text style={styles.row}>
          <Text style={styles.k}>Lat </Text>
          <Text style={styles.v}>{formatGpsCoordinate(coordinate?.latitude ?? null)}</Text>
        </Text>
        <Text style={styles.row}>
          <Text style={styles.k}>Lon </Text>
          <Text style={styles.v}>{formatGpsCoordinate(coordinate?.longitude ?? null)}</Text>
        </Text>
        <Text style={styles.row}>
          <Text style={styles.k}>Path points (history) </Text>
          <Text style={styles.v}>{pathCoordinates.length}</Text>
        </Text>
        <Text style={styles.muted}>Last update: {lastUpdated ?? '—'}</Text>
      </Card>

      <Button onPress={openMaps} style={styles.btn} disabled={!coordinate}>
        <Text style={styles.btnText}>Open in Maps</Text>
      </Button>
      <Button onPress={() => refetch()} style={styles.btnOutline}>
        <Text style={styles.btnOutlineText}>Refresh</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: '100%',
  },
  title: {
    ...typography.h5,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  err: { color: colors.danger, marginBottom: spacing.sm },
  muted: { ...typography.bodySmall, color: colors.muted, marginTop: spacing.xs },
  row: { marginVertical: 4 },
  k: { ...typography.body, color: colors.muted },
  v: { ...typography.body, color: colors.text, fontWeight: '600' },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  btnText: {
    ...typography.label,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  btnOutline: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted + '55',
  },
  btnOutlineText: {
    ...typography.label,
    color: colors.text,
    textAlign: 'center',
  },
});
