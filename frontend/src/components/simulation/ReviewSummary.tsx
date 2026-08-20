import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '../../theme/ThemeProvider';
import { formatQuantity } from '../../theme/units';
import { COMBINATION_TYPE_META } from '../../types/simulation';
import type { SimulationDraft } from '../../hooks/useSimulationDraft';

type Props = {
  draft: SimulationDraft;
  tractorName?: string;
  implementName?: string;
  implement2Name?: string;
  /** Catalogue rotor selected for an active-passive run, if any. */
  rotorImplementName?: string;
  presetName?: string;
  onEditStep: (index: number) => void;
};

function Row({ label, value }: { label: string; value: string }) {
  const { colors, spacing, typography, numeric } = useTheme();
  return (
    <View style={[styles.row, { paddingVertical: spacing.sm }]}>
      <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>{label}</Text>
      <Text
        style={[typography.body, numeric, { color: colors.textPrimary, fontWeight: '600', textAlign: 'right' }]}
      >
        {value}
      </Text>
    </View>
  );
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={[typography.h5, { color: colors.textPrimary }]}>{title}</Text>
        <Text
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title}`}
          onPress={onEdit}
          style={[typography.label, { color: colors.primary }]}
        >
          Edit
        </Text>
      </View>
      <View>{children}</View>
    </View>
  );
}

/**
 * Read-only confirmation of exactly what will be sent to the engine.
 *
 * Shows the request as the user configured it — no derived or predicted results,
 * because every engineering figure comes from the backend after the run.
 */
export function ReviewSummary({
  draft,
  tractorName,
  implementName,
  implement2Name,
  rotorImplementName,
  presetName,
  onEditStep,
}: Props) {
  const { colors, spacing, typography } = useTheme();
  const meta = COMBINATION_TYPE_META[draft.combinationType];

  const fallbackLabel = rotorImplementName ? `From ${rotorImplementName}` : '—';
  const rotorValue = (raw: string, quantity: Parameters<typeof formatQuantity>[1]) =>
    raw.trim() ? formatQuantity(raw, quantity) : fallbackLabel;

  return (
    <View style={{ gap: spacing.md }}>
      <Section title="Mode & equipment" onEdit={() => onEditStep(0)}>
        <Row label="Mode" value={meta.label} />
        <Row label="Tractor" value={tractorName ?? '—'} />
        <Row
          label={draft.combinationType === 'passive_passive' ? 'Tool 1' : 'Implement'}
          value={implementName ?? '—'}
        />
        {draft.combinationType === 'passive_passive' ? (
          <>
            <Row label="Tool 2" value={implement2Name ?? '—'} />
            <Row label="Interaction coefficient (ki)" value={draft.interactionCoefficient} />
          </>
        ) : null}
        {draft.combinationType === 'active_passive' ? (
          <>
            <Row
              label="Powered implement"
              value={rotorImplementName ?? 'Specs entered manually'}
            />
            {/* With a catalogue rotor selected, blank fields fall back to its saved
                specs on the server, so they are shown as such rather than as "—". */}
            <Row
              label="Rotor weight"
              value={rotorValue(draft.rotorWeight, 'mass')}
            />
            <Row
              label="Rotor CG from hitch"
              value={rotorValue(draft.rotorCgDistanceFromHitch, 'length')}
            />
            <Row
              label="Rotor mechanical resistance"
              value={rotorValue(draft.rotorMechanicalResistance, 'force')}
            />
            <Row
              label="Rotor efficiency (ηr)"
              value={draft.rotorEfficiency.trim() || fallbackLabel}
            />
            <Row label="Rotor PTO power" value={rotorValue(draft.rotorPtoPower, 'power')} />
            <Row label="Rotor speed" value={rotorValue(draft.rotorSpeed, 'rpm')} />
            {draft.rotorDynamicVerticalForce.trim() ? (
              <Row
                label="Dynamic vertical force"
                value={formatQuantity(draft.rotorDynamicVerticalForce, 'force')}
              />
            ) : null}
          </>
        ) : null}
      </Section>

      <Section title="Field conditions" onEdit={() => onEditStep(1)}>
        {draft.conditionMode === 'preset' ? (
          <Row label="Preset" value={presetName ?? '—'} />
        ) : (
          <>
            <Row label="Soil texture" value={draft.soilTexture} />
            <Row label="Soil hardness" value={draft.soilHardness} />
            <Row label="Cone index" value={formatQuantity(draft.coneIndex, 'coneIndex')} />
            <Row label="Tillage depth" value={formatQuantity(draft.depth, 'depth')} />
            <Row label="Operating speed" value={formatQuantity(draft.speed, 'speed')} />
            <Row label="Field length" value={formatQuantity(draft.fieldLength, 'length')} />
            <Row label="Field width" value={formatQuantity(draft.fieldWidth, 'length')} />
            <Row label="Field area" value={formatQuantity(draft.fieldArea, 'area')} />
          </>
        )}
      </Section>

      {draft.suggestedFields.length > 0 && draft.conditionMode === 'custom' ? (
        <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
          {draft.suggestedFields.length} value
          {draft.suggestedFields.length === 1 ? ' is' : 's are'} still the app’s suggested starting
          point rather than a measurement.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
});
