import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { ThemedButton } from '../common/ThemedButton';
import { useTheme } from '../../theme/ThemeProvider';
import { COMBINATION_TYPE_META, type SimulationCombinationType } from '../../types/simulation';

type Props = {
  detail: string;
  mode: SimulationCombinationType;
  onChangeSetup: () => void;
  onSwitchToSingle?: () => void;
};

/**
 * Full-screen presentation for a refusal from the engine.
 *
 * These are not ordinary validation failures: the engine solved as far as it could
 * and is explaining why no physical answer exists. The message is shown in full,
 * unedited, because it names the exact quantity and value that failed — the user
 * (or the engineer they forward it to) needs that detail.
 */
export function EngineDiagnosticExplainer({
  detail,
  mode,
  onChangeSetup,
  onSwitchToSingle,
}: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const tone = colors.status.critical;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
    >
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: tone.surface, borderColor: tone.border, borderRadius: radius.full },
          ]}
        >
          <Feather name="alert-octagon" size={26} color={tone.base} />
        </View>
        <Text
          accessibilityRole="header"
          style={[typography.h3, { color: colors.textPrimary, textAlign: 'center' }]}
        >
          No physical solution exists
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
          {COMBINATION_TYPE_META[mode].label}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surfaceSunken,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            gap: spacing.sm,
          },
        ]}
      >
        <Text style={[typography.caption, { color: colors.textTertiary }]}>Engine diagnostic</Text>
        <Text selectable style={[typography.body, { color: colors.textSecondary }]}>
          {detail}
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        {onSwitchToSingle ? (
          <ThemedButton onPress={onSwitchToSingle} fullWidth>
            Run as a single implement instead
          </ThemedButton>
        ) : null}
        <ThemedButton variant="outline" onPress={onChangeSetup} fullWidth>
          Change setup
        </ThemedButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  card: {
    borderWidth: 1,
  },
});
