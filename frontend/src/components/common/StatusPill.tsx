import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '../../theme/ThemeProvider';
import type { StatusTone } from '../../theme/palette';

type Props = {
  label: string;
  tone?: StatusTone;
  /** Small caption above the value, e.g. "Confidence". */
  caption?: string;
  size?: 'sm' | 'md';
};

/**
 * Compact status chip used for convergence, DSS status, confidence and load status.
 * One component so these labels look identical everywhere they appear.
 */
export function StatusPill({ label, tone = 'neutral', caption, size = 'md' }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const palette = colors.status[tone];
  const compact = size === 'sm';

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={caption ? `${caption}: ${label}` : label}
      style={[
        styles.container,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderRadius: radius.full,
          paddingVertical: compact ? spacing.xs : spacing.sm - 2,
          paddingHorizontal: compact ? spacing.sm : spacing.md,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: palette.base }]} />
      <View>
        {caption ? (
          <Text style={[typography.caption, { color: palette.text, opacity: 0.75 }]}>{caption}</Text>
        ) : null}
        <Text
          style={[
            compact ? typography.labelSmall : typography.label,
            { color: palette.text, fontWeight: '700' },
          ]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
