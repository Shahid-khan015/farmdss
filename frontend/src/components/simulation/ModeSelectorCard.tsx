import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';
import {
  COMBINATION_TYPE_META,
  type SimulationCombinationType,
} from '../../types/simulation';

const ICON: Record<SimulationCombinationType, keyof typeof Feather.glyphMap> = {
  single: 'minus',
  passive_passive: 'menu',
  active_passive: 'rotate-cw',
};

const ORDER: SimulationCombinationType[] = ['single', 'passive_passive', 'active_passive'];

type Props = {
  value: SimulationCombinationType;
  onChange: (value: SimulationCombinationType) => void;
  /** Restrict the offered modes — e.g. the two combi sub-modes. Defaults to all three. */
  modes?: SimulationCombinationType[];
};

/**
 * Mode determines which inputs the rest of the form needs — the DSS treats the
 * three as separate models, not variants. Under the two-level taxonomy this
 * renders the Combi sub-choice; Conventional maps to `single` and needs no card.
 */
export function ModeSelectorCard({ value, onChange, modes }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const visibleModes = modes ?? ORDER;

  return (
    <View style={{ gap: spacing.sm }} accessibilityRole="radiogroup">
      {visibleModes.map((mode) => {
        const meta = COMBINATION_TYPE_META[mode];
        const selected = mode === value;
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${meta.label}. ${meta.description}`}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: selected ? colors.primarySurface : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
                borderWidth: selected ? 2 : 1,
                borderRadius: radius.lg,
                padding: spacing.lg,
                gap: spacing.md,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: selected ? colors.primary : colors.surfaceSunken,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Feather
                name={ICON[mode]}
                size={18}
                color={selected ? colors.textOnAccent : colors.textSecondary}
              />
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[typography.h5, { color: colors.textPrimary }]}>{meta.label}</Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {meta.description}
              </Text>
            </View>

            <Feather
              name={selected ? 'check-circle' : 'circle'}
              size={20}
              color={selected ? colors.primary : colors.borderStrong}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 64,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
});
