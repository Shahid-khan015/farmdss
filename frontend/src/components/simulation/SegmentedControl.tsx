import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '../../theme/ThemeProvider';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  /** Fills the available width instead of hugging content. */
  fullWidth?: boolean;
};

/** Compact single-choice control for 2–5 short options. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  fullWidth = true,
}: Props<T>) {
  const { colors, spacing, radius, typography } = useTheme();

  // Four or more segments have to share a phone's width, so the roomy padding
  // that suits a 2–3 option control truncates the labels ("Tracti…"). Tighten
  // the padding and step the type down a size once the track gets crowded.
  const dense = options.length >= 4;
  const segmentPaddingH = dense ? spacing.xs : spacing.md;
  const labelStyle = dense ? typography.labelSmall : typography.label;

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <Text style={[typography.label, { color: colors.textPrimary }]}>{label}</Text> : null}
      <View
        accessibilityRole="tablist"
        style={[
          styles.track,
          {
            backgroundColor: colors.surfaceSunken,
            borderRadius: radius.md,
            padding: 3,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
          },
        ]}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              style={[
                styles.segment,
                {
                  backgroundColor: selected ? colors.surface : 'transparent',
                  borderRadius: radius.sm,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: segmentPaddingH,
                  flex: fullWidth ? 1 : undefined,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  labelStyle,
                  {
                    color: selected ? colors.textPrimary : colors.textSecondary,
                    fontWeight: selected ? '700' : '500',
                    textAlign: 'center',
                  },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
  },
  segment: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
