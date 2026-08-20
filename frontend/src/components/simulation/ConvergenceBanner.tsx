import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';
import { SLIP_ENGINE_CAP_PCT } from '../../utils/dssBands';

type Props = {
  /** `null` when the engine did not report convergence at all. */
  converged: boolean | null;
  slipPercent: number | null;
};

/**
 * States plainly whether the solution converged.
 *
 * A run that hit the slip cap did **not** develop the required pull, so its numbers
 * describe the cap rather than a working configuration. Presenting that identically
 * to a converged run would be misleading, which is why this sits above the results
 * rather than inside a diagnostics drawer.
 */
export function ConvergenceBanner({ converged, slipPercent }: Props) {
  const { colors, spacing, radius, typography } = useTheme();

  if (converged === true) {
    const tone = colors.status.ok;
    return (
      <View
        accessible
        accessibilityLabel="Solution converged. The tractor develops the required pull."
        style={[
          styles.banner,
          {
            backgroundColor: tone.surface,
            borderColor: tone.border,
            borderRadius: radius.md,
            padding: spacing.md,
            gap: spacing.sm,
          },
        ]}
      >
        <Feather name="check-circle" size={18} color={tone.base} />
        <Text style={[typography.body, { color: tone.text, flex: 1 }]}>
          Solution converged — the tractor develops the pull this operation needs.
        </Text>
      </View>
    );
  }

  const tone = colors.status.critical;
  const unknown = converged === null;

  return (
    <View
      accessible
      accessibilityLabel={
        unknown
          ? 'Convergence not reported by the engine.'
          : `Did not converge. Slip reached the ${SLIP_ENGINE_CAP_PCT} percent limit before the required pull developed.`
      }
      style={[
        styles.bannerColumn,
        {
          backgroundColor: tone.surface,
          borderColor: tone.border,
          borderRadius: radius.md,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Feather name={unknown ? 'help-circle' : 'alert-triangle'} size={18} color={tone.base} />
        <Text style={[typography.h5, { color: tone.text, flex: 1 }]}>
          {unknown ? 'Convergence not reported' : 'Did not converge'}
        </Text>
      </View>

      <Text style={[typography.body, { color: tone.text }]}>
        {unknown
          ? 'This simulation did not record a convergence flag, so the figures below cannot be confirmed as a settled solution.'
          : `Wheel slip reached the ${SLIP_ENGINE_CAP_PCT}% engineering limit${
              slipPercent !== null ? ` (${slipPercent.toFixed(1)}%)` : ''
            } before the tractor developed the required pull. The figures below describe that limit, not a working configuration.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  bannerColumn: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
