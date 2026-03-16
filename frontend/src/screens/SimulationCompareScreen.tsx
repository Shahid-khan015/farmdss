import React from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

import { colors } from '../constants/colors';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Card } from '../components/common/Card';
import { useCompareSimulations } from '../hooks/useSimulations';
import { fmtNum } from '../utils/formatters';

export function SimulationCompareScreen() {
  const route = useRoute<any>();
  const ids = (route.params?.ids ?? []) as string[];

  const q = useCompareSimulations(ids);

  if (q.isLoading) return <LoadingSpinner />;
  if (q.error) return <ErrorMessage message={(q.error as Error).message} />;

  const sims = q.data ?? [];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: colors.background }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        Compare Simulations
      </Text>

      {sims.map((s) => (
        <Card key={s.id} style={{ marginBottom: 12 }}>
          <Text variant="titleMedium">{s.name ?? 'Simulation'}</Text>
          <Text variant="bodySmall">{new Date(s.created_at).toLocaleString()}</Text>
          <Text>Slip: {fmtNum(s.slip, 1)}%</Text>
          <Text>Traction eff: {fmtNum(s.traction_efficiency, 1)}%</Text>
          <Text>Power utilization: {fmtNum(s.power_utilization, 1)}%</Text>
          <Text>Fuel/ha: {fmtNum(s.fuel_consumption_per_hectare, 2)} l/ha</Text>
          <Text>Overall eff: {fmtNum(s.overall_efficiency, 1)}%</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

