import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '../../theme/ThemeProvider';
import type { StatusTone } from '../../theme/palette';
import {
  NOT_REPORTED,
  accessibleQuantity,
  formatNumber,
  unitOf,
  type Quantity,
} from '../../theme/units';

type Props = {
  label: string;
  value: unknown;
  quantity: Quantity;
  tone?: StatusTone;
  /** Short clarification shown under the value. */
  hint?: string;
  emphasis?: boolean;
};

/**
 * One engineering figure.
 *
 * Renders the unit as a separate, quieter element so scanning a column of tiles
 * compares magnitudes rather than unit strings, and shows an explicit dash when the
 * engine reported nothing — never a zero standing in for missing data.
 */
export function MetricTile({ label, value, quantity, tone = 'neutral', hint, emphasis }: Props) {
  const { colors, spacing, radius, typography, numeric } = useTheme();
  const formatted = formatNumber(value, quantity);
  const missing = formatted === NOT_REPORTED;
  const unit = unitOf(quantity);
  const statusColors = colors.status[tone];

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibleQuantity(label, value, quantity)}
      style={[
        styles.tile,
        {
          backgroundColor: emphasis ? statusColors.surface : colors.surface,
          borderColor: emphasis ? statusColors.border : colors.border,
          borderRadius: radius.lg,
          padding: emphasis ? spacing.lg : spacing.md,
          gap: 4,
        },
      ]}
    >
      <Text
        numberOfLines={2}
        style={[typography.caption, { color: emphasis ? statusColors.text : colors.textSecondary }]}
      >
        {label}
      </Text>

      <View style={styles.valueRow}>
        <Text
          style={[
            emphasis ? typography.h2 : typography.h4,
            numeric,
            { color: missing ? colors.textTertiary : colors.textPrimary },
          ]}
        >
          {formatted}
        </Text>
        {unit && !missing ? (
          <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{unit}</Text>
        ) : null}
      </View>

      {hint ? (
        <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    justifyContent: 'flex-start',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
});
