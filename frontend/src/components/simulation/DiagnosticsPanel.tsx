import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '../../theme/ThemeProvider';
import { formatQuantity, NOT_REPORTED, type Quantity } from '../../theme/units';
import type { SimulationResults } from '../../types/simulation';

type DiagnosticRow = {
  label: string;
  symbol?: string;
  value: unknown;
  quantity: Quantity;
  /**
   * Plain-language explanation — what it is, not how it is derived. Where the
   * engine substituted or assumed something, the caveat is stated here in prose
   * rather than as a provenance chip, so the reader gets the actual consequence
   * ("reads far lower than a real tractor achieves") instead of a category label.
   */
  explanation: string;
};

function Row({ row }: { row: DiagnosticRow }) {
  const { colors, spacing, radius, typography, numeric } = useTheme();
  const formatted = formatQuantity(row.value, row.quantity);

  return (
    <View
      accessible
      accessibilityLabel={`${row.label}: ${formatted}. ${row.explanation}`}
      style={[
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          gap: spacing.xs,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[typography.label, { color: colors.textPrimary }]}>
            {row.label}
            {row.symbol ? (
              <Text style={{ color: colors.textTertiary }}>{`  ${row.symbol}`}</Text>
            ) : null}
          </Text>
        </View>
        <Text
          style={[
            typography.h5,
            numeric,
            { color: formatted === NOT_REPORTED ? colors.textTertiary : colors.textPrimary },
          ]}
        >
          {formatted}
        </Text>
      </View>

      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{row.explanation}</Text>
    </View>
  );
}

/**
 * The engine's internal quantities, behind progressive disclosure.
 *
 * Rows whose value the engine did not report are omitted entirely rather than
 * shown as blanks.
 */
export function DiagnosticsPanel({ results }: { results: SimulationResults }) {
  const { spacing } = useTheme();
  const isPassivePassive = results.combination_type === 'passive_passive';

  const rows: DiagnosticRow[] = [
    {
      label: 'Rear wheel numeric',
      symbol: isPassivePassive ? "Bn'" : 'Bn',
      value: results.legacy_mobility_number_rear,
      quantity: 'dimensionless',
      explanation: isPassivePassive
        ? "This combination's own wheel numeric for the driven wheel. Combines cone index, tyre size and wheel load."
        : 'How well the driven tyre floats on this soil, from cone index, tyre size and wheel load. Higher means better traction.',
    },
    {
      label: 'Front wheel numeric',
      symbol: 'Bn',
      value: results.legacy_mobility_number_front,
      quantity: 'dimensionless',
      explanation:
        'The same measure for the undriven front tyre. Feeds rolling resistance only, never traction.',
    },
    {
      label: 'Gross traction ratio',
      symbol: 'μg',
      value: results.legacy_gross_traction_ratio,
      quantity: 'ratio',
      explanation: 'Total thrust the rear tyres can generate, before motion resistance is deducted.',
    },
    {
      label: 'Net traction coefficient',
      symbol: 'μ',
      value: results.coefficient_net_traction,
      quantity: 'ratio',
      explanation:
        'Usable pull per unit of rear-axle weight. The slip term uses the standard 7.5 exponent; the source document shows 0.3, which yields no usable traction.',
    },
    {
      label: 'Motion resistance ratio',
      value: results.motion_resistance_ratio,
      quantity: 'ratio',
      explanation: 'Rolling resistance of both axles combined, as a fraction of their load.',
    },
    {
      label: 'Front axle dynamic load',
      symbol: 'Rf',
      value: results.legacy_front_axle_load_n,
      quantity: 'force',
      explanation: 'Weight carried by the front axle while working, after load transfer.',
    },
    {
      label: 'Rear axle dynamic load',
      symbol: 'Rr',
      value: results.legacy_rear_axle_load_n,
      quantity: 'force',
      explanation: 'Weight carried by the driven axle while working — this is what generates pull.',
    },
    {
      label: 'Engine-torque pull limit',
      symbol: 'Pet',
      value: results.engine_torque_limited_pull,
      quantity: 'force',
      explanation:
        'Pull the engine torque alone could produce. The source equation omits the transmission gear ratio, so this reads far lower than a real tractor achieves and is reported for traceability only.',
    },
    {
      label: 'Specific fuel consumption',
      value: results.specific_fuel_consumption,
      quantity: 'specificFuel',
      explanation: 'Fuel per unit of engine work, from the ASABE (2001) standard curve.',
    },
    {
      label: 'Fuel rate (drawbar basis)',
      value: results.fuel_l_per_hour,
      quantity: 'fuelPerHour',
      explanation:
        'The basis behind every fuel figure shown. The source never states what to multiply the standard curve by, so the existing drawbar-power basis was preserved.',
    },
    {
      label: 'Fuel rate (PTO basis)',
      value: results.fuel_l_per_hour_pto_basis,
      quantity: 'fuelPerHour',
      explanation:
        'The alternative reading, consistent with the power ratio the standard curve expects. Shown for comparison; it feeds nothing.',
    },
    {
      label: 'Field efficiency (unclamped)',
      value: results.legacy_field_efficiency_raw,
      quantity: 'percent',
      explanation:
        'Ratio of actual to theoretical capacity before the 50–95% display clamp. Differs from the headline figure when turning dominates.',
    },
  ];

  const rotorRows: DiagnosticRow[] = [
    {
      label: 'PTO reaction moment',
      symbol: 'MPTO',
      value: results.pto_reaction_moment,
      quantity: 'torque',
      explanation: 'Torque the rotor drive reacts back through the tractor, adding rear-axle load.',
    },
    {
      label: 'Equivalent rear load',
      symbol: 'Weq',
      value: results.pto_equivalent_rear_load,
      quantity: 'force',
      explanation: 'That reaction moment expressed as extra weight on the rear axle.',
    },
    {
      label: 'Rotor mechanical power',
      symbol: 'Pr',
      value: results.rotor_mechanical_power,
      quantity: 'power',
      explanation:
        'Torque-based cross-check on rotor thrust. Without a measured shaft torque it reproduces the PTO power by construction, so it confirms consistency rather than adding information.',
    },
    {
      label: 'Rotor equivalent force',
      symbol: 'Fr',
      value: results.rotor_equivalent_force,
      quantity: 'force',
      explanation: 'The same rotor power expressed as a forward force at the working speed.',
    },
    {
      label: 'Effective PTO power ratio',
      symbol: 'Xeff',
      value: results.pto_power_fraction_effective,
      quantity: 'ratio',
      explanation: 'Share of rated PTO power used by drawbar work and the rotor together.',
    },
  ];

  const visible = rows.filter((row) => row.value !== undefined && row.value !== null);
  const visibleRotor =
    results.combination_type === 'active_passive'
      ? rotorRows.filter((row) => row.value !== undefined && row.value !== null)
      : [];

  return (
    <View style={{ gap: spacing.sm }}>
      {visible.map((row) => (
        <Row key={row.label} row={row} />
      ))}
      {visibleRotor.map((row) => (
        <Row key={row.label} row={row} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
});
