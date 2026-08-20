import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { MetricTile } from './MetricTile';
import { SegmentedControl } from './SegmentedControl';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { GaugeArc } from './charts/GaugeArc';
import { ThresholdBar } from './charts/ThresholdBar';
import { AxleLoadDiagram } from './charts/AxleLoadDiagram';
import { DraftBreakdownBar, type DraftContribution } from './charts/DraftBreakdownBar';
import { useTheme } from '../../theme/ThemeProvider';
import { useResponsive } from '../../hooks/useResponsive';
import { formatNumber, formatQuantity } from '../../theme/units';
import {
  PUT_PROPERLY_LOADED,
  SLIP_BALLAST_TARGET_PCT,
  SLIP_ENGINE_CAP_PCT,
  powerUtilizationTone,
  slipTone,
} from '../../utils/dssBands';
import type { SimulationResults } from '../../types/simulation';

type Section = 'traction' | 'power' | 'weight' | 'field' | 'diagnostics';

const SECTIONS: Array<{ value: Section; label: string }> = [
  { value: 'traction', label: 'Traction' },
  { value: 'power', label: 'Power' },
  { value: 'weight', label: 'Weight' },
  { value: 'field', label: 'Field' },
  { value: 'diagnostics', label: 'Engine' },
];

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ gap: 2, marginBottom: spacing.xs }}>
      <Text accessibilityRole="header" style={[typography.h5, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

/**
 * The engine's results, grouped by the question each group answers.
 *
 * Sections are switched rather than stacked so the screen stays scannable — a flat
 * list of twenty-odd figures reads as a data dump and hides what matters.
 */
export function ResultsDisplay({ results }: { results: SimulationResults }) {
  const { colors, spacing, radius, typography } = useTheme();
  const { columns } = useResponsive();
  const [section, setSection] = useState<Section>('traction');

  const slip = toNumber(results.slip);
  const powerUtilization = toNumber(results.power_utilization);
  const gridStyle = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.sm };
  const tileBasis = columns > 1 ? { minWidth: 200 } : {};

  const draftBreakdown = useMemo<{
    contributions: DraftContribution[];
    formula: string;
    totalLabel: string;
  } | null>(() => {
    if (results.combination_type === 'passive_passive') {
      const d1 = toNumber(results.draft_1);
      const d2 = toNumber(results.draft_2);
      const ki = toNumber(results.interaction_coefficient);
      if (d1 === null || d2 === null) return null;
      const contributions: DraftContribution[] = [
        { label: 'Tool 1 draft', valueN: d1, kind: 'add' },
        { label: 'Tool 2 draft', valueN: d2, kind: 'add' },
      ];
      if (ki !== null && ki > 0) {
        contributions.push({
          label: `Interaction saving (ki = ${ki.toFixed(2)})`,
          valueN: (d1 + d2) * ki,
          kind: 'subtract',
          note: 'The trailing tool works soil the leading tool already loosened.',
        });
      }
      return {
        contributions,
        formula: 'Combined draft = (1 − ki) × (D₁ + D₂)',
        totalLabel: 'Total draft the tractor pulls',
      };
    }

    if (results.combination_type === 'active_passive') {
      const dp = toNumber(results.draft_passive);
      const da = toNumber(results.draft_active_mechanical);
      const ta = toNumber(results.rotor_thrust);
      if (dp === null && da === null) return null;
      const contributions: DraftContribution[] = [];
      if (dp !== null) contributions.push({ label: 'Passive tool draft', valueN: dp, kind: 'add' });
      if (da !== null)
        contributions.push({ label: 'Rotor mechanical drag', valueN: da, kind: 'add' });
      if (ta !== null)
        contributions.push({
          label: 'Rotor forward thrust',
          valueN: ta,
          kind: 'subtract',
          note: 'The rotor pushes the machine forward, reducing what the tractor must pull.',
        });
      return {
        contributions,
        formula: 'Effective draft = Dp + Da − Ta',
        totalLabel: 'Effective draft the tractor pulls',
      };
    }

    return null;
  }, [results]);

  return (
    <View style={{ gap: spacing.lg }}>
      <SegmentedControl options={SECTIONS} value={section} onChange={setSection} />

      {section === 'traction' ? (
        <View style={{ gap: spacing.lg }}>
          {draftBreakdown ? (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg },
              ]}
            >
              <SectionHeading title="How the draft adds up" />
              <DraftBreakdownBar
                contributions={draftBreakdown.contributions}
                totalN={toNumber(results.draft_force)}
                totalLabel={draftBreakdown.totalLabel}
                formula={draftBreakdown.formula}
              />
            </View>
          ) : null}

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg },
            ]}
          >
            <SectionHeading
              title="Wheel slip"
              subtitle={`Ballast is recommended above ${SLIP_BALLAST_TARGET_PCT}%; the solver stops at ${SLIP_ENGINE_CAP_PCT}%.`}
            />
            <ThresholdBar
              value={slip}
              max={SLIP_ENGINE_CAP_PCT + 5}
              tone={slipTone(slip)}
              valueLabel={`${formatNumber(slip, 'percent')}%`}
              thresholds={[
                { value: SLIP_BALLAST_TARGET_PCT, label: `${SLIP_BALLAST_TARGET_PCT}% ballast` },
                { value: SLIP_ENGINE_CAP_PCT, label: `${SLIP_ENGINE_CAP_PCT}% limit` },
              ]}
              accessibilityLabel={`Wheel slip ${formatNumber(slip, 'percent')} percent, against a ${SLIP_BALLAST_TARGET_PCT} percent ballast target and a ${SLIP_ENGINE_CAP_PCT} percent solver limit.`}
            />
          </View>

          <View style={gridStyle}>
            <MetricTile
              label="Draft force"
              value={results.draft_force}
              quantity="draft"
              tone="neutral"
              emphasis
            />
            <MetricTile
              label="Tractive efficiency"
              value={results.traction_efficiency}
              quantity="percent"
              hint="Drawbar power out vs axle power in"
            />
            <MetricTile
              label="Net traction coefficient"
              value={results.coefficient_net_traction}
              quantity="ratio"
              hint="Pull per unit rear-axle weight"
            />
            <MetricTile
              label="Motion resistance"
              value={results.motion_resistance_ratio}
              quantity="ratio"
              hint="Rolling drag, both axles"
            />
          </View>
        </View>
      ) : null}

      {section === 'power' ? (
        <View style={{ gap: spacing.lg }}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
                alignItems: 'center',
              },
            ]}
          >
            <SectionHeading
              title="Power utilisation"
              subtitle={`The DSS considers ${PUT_PROPERLY_LOADED.min}–${PUT_PROPERLY_LOADED.max}% properly loaded.`}
            />
            <GaugeArc
              value={powerUtilization}
              min={0}
              max={130}
              tone={powerUtilizationTone(powerUtilization)}
              valueLabel={`${formatNumber(powerUtilization, 'percent')}%`}
              caption={results.load_status ?? undefined}
              bands={[
                { from: 0, to: PUT_PROPERLY_LOADED.min, tone: 'caution' },
                { from: PUT_PROPERLY_LOADED.min, to: PUT_PROPERLY_LOADED.max, tone: 'ok' },
                { from: PUT_PROPERLY_LOADED.max, to: 130, tone: 'critical' },
              ]}
              accessibilityLabel={`Power utilisation ${formatNumber(
                powerUtilization,
                'percent',
              )} percent. ${results.load_status ?? ''}`}
            />
          </View>

          <View style={gridStyle}>
            <MetricTile label="Drawbar power" value={results.drawbar_power} quantity="power" />
            <MetricTile
              label="Required PTO power"
              value={results.required_pto_power}
              quantity="power"
              hint="What the engine must deliver"
            />
            {results.rotor_pto_power !== undefined ? (
              <MetricTile
                label="Rotor PTO draw"
                value={results.rotor_pto_power}
                quantity="power"
                hint="Counted in power utilisation"
              />
            ) : null}
            <MetricTile
              label="Fuel per hectare"
              value={results.fuel_consumption_per_hectare}
              quantity="fuelPerArea"
            />
            <MetricTile label="Fuel per hour" value={results.fuel_l_per_hour} quantity="fuelPerHour" />
            <MetricTile
              label="Overall efficiency"
              value={results.overall_efficiency}
              quantity="percent"
              hint="Useful work vs fuel energy"
            />
          </View>
        </View>
      ) : null}

      {section === 'weight' ? (
        <View style={{ gap: spacing.lg }}>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg },
            ]}
          >
            <SectionHeading
              title="Axle loads"
              subtitle="Front-axle utilisation must stay at or above 0.20 for safe steering."
            />
            <AxleLoadDiagram
              frontLoadN={toNumber(results.legacy_front_axle_load_n)}
              rearLoadN={toNumber(results.legacy_rear_axle_load_n)}
              frontUtilization={toNumber(results.front_weight_utilization)}
              rearUtilization={toNumber(results.rear_weight_utilization)}
            />
          </View>

          <View style={gridStyle}>
            <MetricTile
              label="Front ballast required"
              value={results.ballast_front_required}
              quantity="mass"
              tone={toNumber(results.ballast_front_required) ? 'caution' : 'ok'}
              hint={
                toNumber(results.ballast_front_required)
                  ? 'To restore front-axle utilisation'
                  : 'None needed'
              }
            />
            {/*
              Three states, not two. The engine returns null when the requirement could
              not be sized at all (the soil develops no net pull at the target slip) —
              treating that as falsy would report "None needed", the opposite of what it
              means.
            */}
            <MetricTile
              label="Rear ballast required"
              value={results.ballast_rear_required}
              quantity="mass"
              tone={results.ballast_rear_required == null || toNumber(results.ballast_rear_required) ? 'caution' : 'ok'}
              hint={
                results.ballast_rear_required == null
                  ? 'Could not be sized — see warnings'
                  : toNumber(results.ballast_rear_required)
                    ? `To bring slip down to ${SLIP_BALLAST_TARGET_PCT}%`
                    : 'None needed'
              }
            />
            {results.pto_equivalent_rear_load !== undefined ? (
              <MetricTile
                label="PTO reaction load"
                value={results.pto_equivalent_rear_load}
                quantity="force"
                hint="Extra rear-axle load from the rotor drive"
              />
            ) : null}
          </View>
        </View>
      ) : null}

      {section === 'field' ? (
        <View style={gridStyle}>
          <MetricTile
            label="Theoretical field capacity"
            value={results.field_capacity_theoretical}
            quantity="fieldCapacity"
            hint="Working flat out, no turning"
          />
          <MetricTile
            label="Actual field capacity"
            value={results.field_capacity_actual}
            quantity="fieldCapacity"
            hint="Including headland turns"
          />
          <MetricTile
            label="Field efficiency"
            value={results.field_efficiency}
            quantity="percent"
          />
          <MetricTile
            label="Total operating time"
            value={results.total_time_hours}
            quantity="hours"
          />
        </View>
      ) : null}

      {section === 'diagnostics' ? (
        <View style={{ gap: spacing.md }}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            The engine's internal working values behind the headline figures. Where a value rests
            on an assumption or reads lower than a real machine would, its own note says so.
          </Text>
          <DiagnosticsPanel results={results} />
          {results.calculation_mode ? (
            <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
              Engine mode: {results.calculation_mode}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
