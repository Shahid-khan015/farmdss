import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';

/**
 * The per-row `ProvenanceTag` chip that used to label result figures
 * (`DSS exact` / `DSS ambiguous` / `Legacy` …) was removed from the result
 * screen: the category labels read as jargon to the people using the app, and
 * every substantive caveat they carried is already stated in prose in the
 * corresponding row's explanation in `DiagnosticsPanel`. The formula-to-document
 * mapping still lives in `docs/SIMULATION_ENGINE_FORMULAS.md`, which is the
 * authoritative place for it.
 */

/**
 * Inline note for values the app suggested rather than the DSS specifying.
 * Used beside auto-filled soil inputs so the user can tell them apart from
 * DSS-derived numbers.
 */
export function SuggestionNote({ onDismiss }: { onDismiss?: () => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  const tone = colors.status.info;

  return (
    <View
      style={[
        styles.note,
        {
          backgroundColor: tone.surface,
          borderColor: tone.border,
          borderRadius: radius.sm,
          padding: spacing.sm,
          gap: spacing.sm,
        },
      ]}
    >
      <Feather name="info" size={14} color={tone.base} />
      <Text style={[typography.bodySmall, { color: tone.text, flex: 1 }]}>
        Suggested starting value — not a DSS default. Measure your soil for an accurate result.
      </Text>
      {onDismiss ? (
        <Text
          accessibilityRole="button"
          onPress={onDismiss}
          style={[typography.labelSmall, { color: tone.base }]}
        >
          Got it
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
  },
});
