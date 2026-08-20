import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';
import type { TillageClass } from '../../hooks/useSimulationDraft';

const OPTIONS: Array<{
  value: TillageClass;
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}> = [
  {
    value: 'conventional',
    label: 'Conventional tillage',
    description: 'One implement per pass — a primary tool such as an MB plough, or a secondary tool.',
    icon: 'minus',
  },
  {
    value: 'combi',
    label: 'Combi tillage',
    description: 'Two tools in a single pass, either both towed or one towed plus a PTO-powered rotor.',
    icon: 'layers',
  },
];

type Props = {
  value: TillageClass;
  onChange: (value: TillageClass) => void;
};

/**
 * Top level of the implement taxonomy. Choosing Combi reveals the sub-mode
 * selector (Passive + Passive vs Active + Passive); Conventional has only one
 * mode and so needs no further choice.
 */
export function TillageClassSelector({ value, onChange }: Props) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View style={{ gap: spacing.sm }} accessibilityRole="radiogroup">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label}. ${option.description}`}
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
                name={option.icon}
                size={18}
                color={selected ? colors.textOnAccent : colors.textSecondary}
              />
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[typography.h5, { color: colors.textPrimary }]}>{option.label}</Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {option.description}
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
});
