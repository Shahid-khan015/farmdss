import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '../../../theme/ThemeProvider';
import { formatQuantity } from '../../../theme/units';

export type DraftContribution = {
  label: string;
  /** Newtons. Negative values reduce the total (e.g. rotor thrust). */
  valueN: number;
  kind: 'add' | 'subtract';
  note?: string;
};

type Props = {
  contributions: DraftContribution[];
  totalN: number | null;
  totalLabel: string;
  /** Short explanation of how the total is formed, e.g. the ki reduction. */
  formula?: string;
};

/**
 * Shows how the effective draft the tractor must pull is assembled.
 *
 * Only meaningful for the combination modes, where the headline draft is not simply
 * one implement's draft: passive-passive reduces `D1 + D2` by `ki`, and
 * active-passive subtracts the rotor's thrust from `Dp + Da`.
 */
export function DraftBreakdownBar({ contributions, totalN, totalLabel, formula }: Props) {
  const { colors, spacing, radius, typography, numeric } = useTheme();

  const maxMagnitude = Math.max(
    ...contributions.map((c) => Math.abs(c.valueN)),
    Math.abs(totalN ?? 0),
    1,
  );

  return (
    <View style={{ gap: spacing.md }}>
      {formula ? (
        <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{formula}</Text>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        {contributions.map((item) => {
          const fraction = Math.abs(item.valueN) / maxMagnitude;
          const isSubtract = item.kind === 'subtract';
          const tone = isSubtract ? colors.status.info : colors.status.neutral;

          return (
            <View
              key={item.label}
              accessible
              accessibilityLabel={`${item.label}, ${isSubtract ? 'reduces draft by' : 'adds'} ${formatQuantity(
                Math.abs(item.valueN),
                'draft',
              )}`}
              style={{ gap: 4 }}
            >
              <View style={styles.row}>
                <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>
                  {isSubtract ? '−' : '+'} {item.label}
                </Text>
                <Text style={[typography.body, numeric, { color: colors.textPrimary, fontWeight: '600' }]}>
                  {formatQuantity(Math.abs(item.valueN), 'draft')}
                </Text>
              </View>
              <View style={[styles.track, { backgroundColor: colors.chartTrack, borderRadius: radius.full }]}>
                <View
                  style={{
                    width: `${Math.max(fraction * 100, 2)}%`,
                    height: '100%',
                    backgroundColor: tone.base,
                    borderRadius: radius.full,
                  }}
                />
              </View>
              {item.note ? (
                <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{item.note}</Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <View
        style={[
          styles.total,
          {
            backgroundColor: colors.primarySurface,
            borderColor: colors.primary,
            borderRadius: radius.md,
            padding: spacing.md,
          },
        ]}
      >
        <Text style={[typography.label, { color: colors.textPrimary, flex: 1 }]}>{totalLabel}</Text>
        <Text style={[typography.h4, numeric, { color: colors.textPrimary }]}>
          {formatQuantity(totalN, 'draft')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  track: {
    height: 8,
    overflow: 'hidden',
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
  },
});
