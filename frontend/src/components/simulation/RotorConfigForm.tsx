import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { Input } from '../common/Input';
import { RangeStepper } from './RangeStepper';
import { useTheme } from '../../theme/ThemeProvider';
import { ROTOR_EFFICIENCY_RANGE } from '../../utils/dssBands';
import type { DraftErrors, SimulationDraft } from '../../hooks/useSimulationDraft';

type Props = {
  draft: SimulationDraft;
  errors: DraftErrors;
  onChange: (field: keyof SimulationDraft, value: string) => void;
};

/**
 * PTO-driven rotor inputs for the active-passive mode (DSS Section 5).
 *
 * Field help explains each quantity's role in the model without restating the
 * equations — the user needs to know what to measure, not how Deff is derived.
 */
export function RotorConfigForm({ draft, errors, onChange }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ gap: spacing.md }}>
      <Text style={[typography.body, { color: colors.textSecondary }]}>
        The rotor draws power from the PTO and pushes the machine forward, which reduces the
        draft the tractor has to pull.
      </Text>

      <Input
        label="Rotor weight"
        required
        unit="kg"
        keyboardType="decimal-pad"
        value={draft.rotorWeight}
        onChangeText={(v) => onChange('rotorWeight', v)}
        error={!!errors.rotorWeight}
        helperText={errors.rotorWeight ?? 'Mass of the rotor unit, used in the axle-load balance.'}
      />

      <Input
        label="Rotor CG distance from hitch"
        required
        unit="m"
        keyboardType="decimal-pad"
        value={draft.rotorCgDistanceFromHitch}
        onChangeText={(v) => onChange('rotorCgDistanceFromHitch', v)}
        error={!!errors.rotorCgDistanceFromHitch}
        helperText={
          errors.rotorCgDistanceFromHitch ??
          'Horizontal distance from the hitch point to the rotor centre of gravity.'
        }
      />

      <Input
        label="Rotor mechanical resistance"
        required
        unit="N"
        keyboardType="decimal-pad"
        value={draft.rotorMechanicalResistance}
        onChangeText={(v) => onChange('rotorMechanicalResistance', v)}
        error={!!errors.rotorMechanicalResistance}
        helperText={
          errors.rotorMechanicalResistance ??
          'Frame and bearing drag of the rotor unit, independent of its thrust.'
        }
      />

      <RangeStepper
        label="Rotor efficiency"
        symbol="ηr"
        value={draft.rotorEfficiency}
        onChange={(v) => onChange('rotorEfficiency', v)}
        min={ROTOR_EFFICIENCY_RANGE.min}
        max={ROTOR_EFFICIENCY_RANGE.max}
        step={0.01}
        decimals={2}
        error={errors.rotorEfficiency}
        minHint="Less thrust"
        maxHint="More thrust"
        help="How much of the rotor's PTO power becomes forward thrust. The DSS restricts this to 0.25–0.45 and asks the user to choose."
      />

      <Input
        label="Rotor PTO power draw"
        required
        unit="kW"
        keyboardType="decimal-pad"
        value={draft.rotorPtoPower}
        onChangeText={(v) => onChange('rotorPtoPower', v)}
        error={!!errors.rotorPtoPower}
        helperText={
          errors.rotorPtoPower ??
          'Power the rotor takes from the PTO. Counts against the tractor’s total power budget.'
        }
      />

      <Input
        label="Rotor speed"
        required
        unit="rpm"
        keyboardType="number-pad"
        value={draft.rotorSpeed}
        onChangeText={(v) => onChange('rotorSpeed', v)}
        error={!!errors.rotorSpeed}
        helperText={errors.rotorSpeed ?? 'Rotational speed, used for the PTO reaction moment.'}
      />

      <Input
        label="Dynamic vertical force"
        unit="N"
        keyboardType="decimal-pad"
        value={draft.rotorDynamicVerticalForce}
        onChangeText={(v) => onChange('rotorDynamicVerticalForce', v)}
        labelHint="Optional"
        helperText="Leave blank unless measured. The DSS names this term but gives no formula, so the engine treats it as 0."
      />
    </View>
  );
}
