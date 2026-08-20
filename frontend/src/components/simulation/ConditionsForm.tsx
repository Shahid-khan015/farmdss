import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { Input } from '../common/Input';
import { SegmentedControl } from './SegmentedControl';
import { SuggestionNote } from './ProvenanceNote';
import { ThemedButton } from '../common/ThemedButton';
import { useTheme } from '../../theme/ThemeProvider';
import { INPUT_RANGES } from '../../utils/dssBands';
import { getRecommendedSoilParameters } from '../../utils/soilParameters';
import { calculateFieldAreaHa } from '../../utils/fieldCalculations';
import type { SoilHardness, SoilTexture } from '../../constants/enums';
import type { DraftErrors, SimulationDraft } from '../../hooks/useSimulationDraft';

type Props = {
  draft: SimulationDraft;
  errors: DraftErrors;
  onChange: (field: keyof SimulationDraft, value: string) => void;
  onApplySuggestions: (values: Partial<SimulationDraft>, fields: string[]) => void;
};

const TEXTURES: Array<{ value: SoilTexture; label: string }> = [
  { value: 'Fine', label: 'Fine' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Coarse', label: 'Coarse' },
];

const HARDNESS: Array<{ value: SoilHardness; label: string }> = [
  { value: 'Soft', label: 'Soft' },
  { value: 'Tilled', label: 'Tilled' },
  { value: 'Firm', label: 'Firm' },
  { value: 'Hard', label: 'Hard' },
];

function rangeHint(key: keyof typeof INPUT_RANGES): string {
  const range = INPUT_RANGES[key];
  if ('max' in range) return `${range.min}–${range.max} ${range.unit}`;
  return `> ${range.min} ${range.unit}`;
}

/**
 * Operating-condition inputs.
 *
 * The accepted ranges shown here are the backend's own gate
 * (`validate_operating_ranges`), so a value the server would reject is caught before
 * the request is sent. Soil-derived starting values are labelled as suggestions
 * because they are a UI convenience, not a DSS-specified default.
 */
export function ConditionsForm({ draft, errors, onChange, onApplySuggestions }: Props) {
  const { colors, spacing, typography } = useTheme();

  const hasSuggestions = draft.suggestedFields.length > 0;

  const applySoilSuggestions = useCallback(() => {
    const recommended = getRecommendedSoilParameters(
      draft.soilTexture as SoilTexture,
      draft.soilHardness as SoilHardness,
    );
    onApplySuggestions(
      {
        coneIndex: String(Math.round(recommended.coneIndex)),
        depth: String(recommended.depth),
        speed: String(recommended.speed),
      },
      ['coneIndex', 'depth', 'speed'],
    );
  }, [draft.soilTexture, draft.soilHardness, onApplySuggestions]);

  const handleGeometryChange = useCallback(
    (field: 'fieldLength' | 'fieldWidth', value: string) => {
      onChange(field, value);
      const length = field === 'fieldLength' ? value : draft.fieldLength;
      const width = field === 'fieldWidth' ? value : draft.fieldWidth;
      const area = calculateFieldAreaHa(Number(length), Number(width));
      if (area) {
        onChange('fieldArea', area.areaHa.toFixed(2));
      }
    },
    [draft.fieldLength, draft.fieldWidth, onChange],
  );

  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.md }}>
        <Text style={[typography.h5, { color: colors.textPrimary }]}>Soil</Text>
        <SegmentedControl
          label="Texture"
          options={TEXTURES}
          value={draft.soilTexture as SoilTexture}
          onChange={(v) => onChange('soilTexture', v)}
        />
        <SegmentedControl
          label="Hardness"
          options={HARDNESS}
          value={draft.soilHardness as SoilHardness}
          onChange={(v) => onChange('soilHardness', v)}
        />
        <ThemedButton variant="outline" size="sm" onPress={applySoilSuggestions}>
          Suggest values for this soil
        </ThemedButton>
        {hasSuggestions ? <SuggestionNote /> : null}
      </View>

      <View style={{ gap: spacing.md }}>
        <Text style={[typography.h5, { color: colors.textPrimary }]}>Draft inputs</Text>

        <Input
          label="Cone index"
          required
          unit={INPUT_RANGES.cone_index.unit}
          labelHint={rangeHint('cone_index')}
          keyboardType="number-pad"
          value={draft.coneIndex}
          onChangeText={(v) => onChange('coneIndex', v)}
          error={!!errors.coneIndex}
          helperText={
            errors.coneIndex ??
            (draft.suggestedFields.includes('coneIndex')
              ? 'Suggested value — replace with a measurement if you have one.'
              : 'Soil penetration resistance, measured with a penetrometer.')
          }
        />

        <Input
          label="Tillage depth"
          required
          unit={INPUT_RANGES.depth.unit}
          labelHint={rangeHint('depth')}
          keyboardType="decimal-pad"
          value={draft.depth}
          onChangeText={(v) => onChange('depth', v)}
          error={!!errors.depth}
          helperText={
            errors.depth ??
            (draft.suggestedFields.includes('depth') ? 'Suggested value.' : undefined)
          }
        />

        <Input
          label="Operating speed"
          required
          unit={INPUT_RANGES.speed.unit}
          labelHint={rangeHint('speed')}
          keyboardType="decimal-pad"
          value={draft.speed}
          onChangeText={(v) => onChange('speed', v)}
          error={!!errors.speed}
          helperText={
            errors.speed ??
            (draft.suggestedFields.includes('speed') ? 'Suggested value.' : undefined)
          }
        />
      </View>

      <View style={{ gap: spacing.md }}>
        <Text style={[typography.h5, { color: colors.textPrimary }]}>Field geometry</Text>

        <Input
          label="Field length"
          required
          unit="m"
          keyboardType="decimal-pad"
          value={draft.fieldLength}
          onChangeText={(v) => handleGeometryChange('fieldLength', v)}
          error={!!errors.fieldLength}
          helperText={errors.fieldLength}
        />

        <Input
          label="Field width"
          required
          unit="m"
          keyboardType="decimal-pad"
          value={draft.fieldWidth}
          onChangeText={(v) => handleGeometryChange('fieldWidth', v)}
          error={!!errors.fieldWidth}
          helperText={errors.fieldWidth}
        />

        <Input
          label="Field area"
          required
          unit="ha"
          keyboardType="decimal-pad"
          value={draft.fieldArea}
          onChangeText={(v) => onChange('fieldArea', v)}
          error={!!errors.fieldArea}
          helperText={errors.fieldArea ?? 'Calculated from length × width; override if the field is irregular.'}
        />
      </View>
    </View>
  );
}
