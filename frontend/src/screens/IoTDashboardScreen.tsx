import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../constants/colors';
import { spacing, typography } from '../theme';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { MetricGrid } from '../components/iot/MetricGrid';
import { GPSInfoPanel } from '../components/iot/GPSInfoPanel';
import { AlertsPanel } from '../components/iot/AlertsPanel';
import { IoTMetricCard } from '../components/iot/IoTMetricCard';
import { useIoTDashboard } from '../hooks/useIoTDashboard';

export function IoTDashboardScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const horizontalPadding = spacing.lg * 2;
  const {
    feedsMap,
    isLoading,
    isRefreshing,
    error,
    refresh,
    deviceId,
    secondsSinceUpdate,
  } = useIoTDashboard();

  const machineStatus = feedsMap.machine_status?.raw_value ?? 'No Signal';
  const machineStatusColor = machineStatus === 'RUNNING' ? '#1E6B3C' : '#888888';
  const updatedLabel =
    secondsSinceUpdate < 60
      ? `${secondsSinceUpdate}s ago`
      : `${Math.floor(secondsSinceUpdate / 60)}m ago`;

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.lg }]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing && !isLoading} onRefresh={() => void refresh()} />
      }
    >
      <PaperText style={styles.title}>IoT Dashboard</PaperText>
      <PaperText style={styles.sub}>Device: {deviceId} | Updated {updatedLabel}</PaperText>

      {error ? (
        <Card variant="outlined" style={styles.errorCard}>
          <PaperText style={styles.errorText}>{error}</PaperText>
        </Card>
      ) : null}

      <MetricGrid feeds={feedsMap} />

      <View style={{ width: width - horizontalPadding, marginTop: spacing.md }}>
        <Card
          variant="elevated"
          spacing="comfortable"
          style={[styles.statusBanner, { backgroundColor: machineStatusColor }]}
        >
          <PaperText style={styles.statusLabel}>Machine Status</PaperText>
          <PaperText style={styles.statusValue}>{machineStatus}</PaperText>
        </Card>
      </View>

      <View style={{ width: width - horizontalPadding, marginTop: spacing.md }}>
        <IoTMetricCard
          feedKey="gearbox_temperature"
          reading={feedsMap.gearbox_temperature}
          fullWidth
        />
      </View>

      <View style={{ width: width - horizontalPadding, marginTop: spacing.md }}>
        <GPSInfoPanel reading={feedsMap.position_tracking} />
      </View>

      <View style={{ width: width - horizontalPadding, marginTop: spacing.md }}>
        <AlertsPanel feeds={feedsMap} />
      </View>

      <View style={styles.actions}>
        <Button
          onPress={() => void refresh()}
          disabled={isRefreshing}
          style={[styles.btnPrimary, { flex: 1.5, minWidth: 0 }]}
        >
          <View style={styles.btnInner}>
            {isRefreshing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="refresh-cw" size={18} color="#fff" />
                <PaperText style={styles.btnPrimaryText}>Refresh Data</PaperText>
              </>
            )}
          </View>
        </Button>
        <Button
          onPress={() => nav.navigate('FieldMap', {})}
          style={[styles.btnSecondary, { flex: 1, minWidth: 0 }]}
        >
          <View style={styles.btnInner}>
            <Feather name="map" size={18} color={colors.text} />
            <PaperText style={styles.btnSecondaryText}>Map</PaperText>
          </View>
        </Button>
      </View>

      {error ? <Text style={styles.refreshError}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    ...typography.bodySmall,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  errorCard: {
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
  },
  statusBanner: {
    width: '100%',
  },
  statusLabel: {
    ...typography.labelSmall,
    color: '#FFFFFFCC',
    marginBottom: spacing.xs,
    fontSize: 11,
    fontWeight: '700',
  },
  statusValue: {
    ...typography.h4,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted + '55',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  btnPrimaryText: {
    ...typography.label,
    color: '#fff',
    fontWeight: '700',
  },
  btnSecondaryText: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
  },
  refreshError: {
    ...typography.bodySmall,
    color: colors.danger,
    fontSize: 12,
  },
});
