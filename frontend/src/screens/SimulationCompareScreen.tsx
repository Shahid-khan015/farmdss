import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { colors } from '../constants/colors';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useCompareSimulations } from '../hooks/useSimulations';
import { fmtNum } from '../utils/formatters';
import type { SimulationCombinationType } from '../types/simulation';

/** Mirrors the history list, so the same run reads the same way in both places. */
const MODE_BADGE: Record<
  SimulationCombinationType,
  { label: string; icon: keyof typeof Feather.glyphMap }
> = {
  single: { label: 'Conventional', icon: 'minus' },
  passive_passive: { label: 'Combi · P+P', icon: 'layers' },
  active_passive: { label: 'Combi · A+P', icon: 'rotate-cw' },
};

type Row = { label: string; value: string };

export function SimulationCompareScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const ids = (route.params?.ids ?? []) as string[];

  const q = useCompareSimulations(ids);

  if (q.isLoading) return <LoadingSpinner />;
  if (q.error) return <ErrorMessage message={(q.error as Error).message} />;

  const sims = q.data ?? [];

  // Comparing runs of different modes is legitimate — it is how you weigh a
  // conventional pass against a combi pass — so the mode is labelled per card
  // rather than assumed uniform.
  const modes = new Set(sims.map((s) => (s.combination_type ?? 'single') as SimulationCombinationType));
  const mixedModes = modes.size > 1;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: colors.background }}>
      <Text variant="titleLarge" style={{ marginBottom: 4 }}>
        Compare Simulations
      </Text>
      <Text variant="bodySmall" style={{ marginBottom: 12, color: colors.muted }}>
        {mixedModes
          ? 'Comparing different tillage modes — draft figures are defined differently per mode.'
          : 'Same tillage mode across all runs.'}
      </Text>

      {sims.map((s) => {
        const mode = (s.combination_type ?? 'single') as SimulationCombinationType;
        const badge = MODE_BADGE[mode];
        const results = (s.results ?? {}) as Record<string, number | undefined>;

        const shared: Row[] = [
          { label: 'Draft force', value: `${fmtNum(s.draft_force, 1)} N` },
          { label: 'Slip', value: `${fmtNum(s.slip, 1)} %` },
          { label: 'Traction efficiency', value: `${fmtNum(s.traction_efficiency, 1)} %` },
          { label: 'Power utilization', value: `${fmtNum(s.power_utilization, 1)} %` },
          { label: 'Fuel / ha', value: `${fmtNum(s.fuel_consumption_per_hectare, 2)} l/ha` },
          { label: 'Overall efficiency', value: `${fmtNum(s.overall_efficiency, 1)} %` },
        ];

        // Mode-specific rows, shown only when the run actually carries them.
        const combi: Row[] =
          mode === 'passive_passive'
            ? [
                { label: 'Tool 1 draft', value: `${fmtNum(results.draft_1, 1)} N` },
                { label: 'Tool 2 draft', value: `${fmtNum(results.draft_2, 1)} N` },
                { label: 'Interaction (ki)', value: fmtNum(results.interaction_coefficient, 2) },
              ]
            : mode === 'active_passive'
              ? [
                  { label: 'Passive tool draft', value: `${fmtNum(results.draft_passive, 1)} N` },
                  { label: 'Rotor thrust', value: `${fmtNum(results.rotor_thrust, 1)} N` },
                  { label: 'Rotor PTO power', value: `${fmtNum(results.rotor_pto_power, 2)} kW` },
                ]
              : [];

        return (
          <Card key={s.id} style={{ marginBottom: 12 }}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium">{s.name ?? 'Simulation'}</Text>
                <Text variant="bodySmall" style={{ color: colors.muted }}>
                  {new Date(s.created_at).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: `${colors.primary}15` }]}>
                <Feather name={badge.icon} size={13} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>{badge.label}</Text>
              </View>
            </View>

            <View style={styles.rows}>
              {shared.map((row) => (
                <View key={row.label} style={styles.row}>
                  <Text variant="bodySmall" style={{ color: colors.muted }}>
                    {row.label}
                  </Text>
                  <Text variant="bodyMedium">{row.value}</Text>
                </View>
              ))}

              {combi.length > 0 ? (
                <>
                  <View style={styles.divider} />
                  {combi.map((row) => (
                    <View key={row.label} style={styles.row}>
                      <Text variant="bodySmall" style={{ color: colors.muted }}>
                        {row.label}
                      </Text>
                      <Text variant="bodyMedium">{row.value}</Text>
                    </View>
                  ))}
                </>
              ) : null}
            </View>

            <View style={styles.actions}>
              <Button
                variant="outline"
                size="sm"
                onPress={() => nav.navigate('SimulationResult', { id: s.id })}
              >
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => nav.navigate('SimulationSetup', { prefillFromSimulationId: s.id })}
              >
                Re-run
              </Button>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rows: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});
