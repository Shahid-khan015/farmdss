import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';
import type { Readiness } from '../../utils/simulationReadiness';

type Props = {
  readiness: Readiness;
  /** Lists show the label only; detail views list the specific gaps. */
  variant?: 'compact' | 'detailed';
};

/**
 * Whether a tractor or implement has everything the DSS engine requires.
 *
 * Placed on list and detail views so an incomplete record is obvious before it is
 * chosen for a simulation, rather than surfacing as a 422 afterwards.
 */
export function ReadinessBadge({ readiness, variant = 'compact' }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const blockers = readiness.issues.filter((i) => i.severity === 'blocker');
  const notes = readiness.issues.filter((i) => i.severity === 'warning');
  const tone = readiness.ready
    ? notes.length > 0
      ? colors.status.info
      : colors.status.ok
    : colors.status.caution;

  const label = readiness.ready
    ? 'Ready to simulate'
    : blockers.length === 1
      ? '1 field missing'
      : `${blockers.length} fields missing`;

  if (variant === 'compact') {
    return (
      <View
        accessible
        accessibilityLabel={
          readiness.ready
            ? 'Ready to simulate'
            : `Cannot simulate: ${blockers.map((b) => b.message).join(' ')}`
        }
        style={[
          styles.badge,
          {
            backgroundColor: tone.surface,
            borderColor: tone.border,
            borderRadius: radius.full,
            paddingVertical: 3,
            paddingHorizontal: spacing.sm,
          },
        ]}
      >
        <Feather
          name={readiness.ready ? 'check-circle' : 'alert-circle'}
          size={11}
          color={tone.base}
        />
        <Text style={[typography.caption, { color: tone.text, fontSize: 10 }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.detailed,
        {
          backgroundColor: tone.surface,
          borderColor: tone.border,
          borderRadius: radius.md,
          padding: spacing.md,
          gap: spacing.xs,
        },
      ]}
    >
      <View style={styles.detailedHeader}>
        <Feather
          name={readiness.ready ? 'check-circle' : 'alert-circle'}
          size={16}
          color={tone.base}
        />
        <Text style={[typography.label, { color: tone.text, flex: 1 }]}>{label}</Text>
      </View>

      {blockers.length > 0 ? (
        <View style={{ gap: 2 }}>
          {blockers.map((issue, index) => (
            <Text key={index} style={[typography.bodySmall, { color: tone.text }]}>
              • {issue.message}
            </Text>
          ))}
        </View>
      ) : null}

      {notes.length > 0 ? (
        <View style={{ gap: 2 }}>
          {notes.map((issue, index) => (
            <Text key={index} style={[typography.bodySmall, { color: colors.textSecondary }]}>
              • {issue.message}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  detailed: {
    borderWidth: 1,
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
