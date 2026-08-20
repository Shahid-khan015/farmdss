import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  label: string;
  /** Symbol shown beside the label, e.g. `ki` or `ηr`. */
  symbol?: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  decimals: number;
  error?: string;
  /** Explains what the value means and where its range comes from. */
  help?: string;
  /** Optional labels for the two ends of the scale. */
  minHint?: string;
  maxHint?: string;
};

/**
 * Bounded numeric control for the two DSS coefficients that have documented ranges
 * (ki 0–0.25, ηr 0.25–0.45).
 *
 * Uses steppers plus a proportional track rather than a draggable slider: these
 * values need exact entry, and a 0.01 drag target is not reliably hittable on a phone.
 */
export function RangeStepper({
  label,
  symbol,
  value,
  onChange,
  min,
  max,
  step,
  decimals,
  error,
  help,
  minHint,
  maxHint,
}: Props) {
  const { colors, spacing, radius, typography, numeric } = useTheme();

  const numberValue = Number(value);
  const valid = Number.isFinite(numberValue);
  const clampedFraction = useMemo(() => {
    if (!valid) return 0;
    const fraction = (numberValue - min) / (max - min);
    return Math.max(0, Math.min(1, fraction));
  }, [numberValue, valid, min, max]);

  const nudge = (direction: 1 | -1) => {
    const base = valid ? numberValue : min;
    const next = Math.min(max, Math.max(min, base + direction * step));
    onChange(next.toFixed(decimals));
  };

  const atMin = valid && numberValue <= min;
  const atMax = valid && numberValue >= max;

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.labelRow}>
        <Text style={[typography.label, { color: colors.textPrimary }]}>
          {label}
          {symbol ? <Text style={{ color: colors.textTertiary }}>{`  ${symbol}`}</Text> : null}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
          {min.toFixed(decimals)}–{max.toFixed(decimals)}
        </Text>
      </View>

      <View
        style={[
          styles.control,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.status.critical.base : colors.border,
            borderRadius: radius.md,
            padding: spacing.sm,
          },
        ]}
      >
        <Pressable
          onPress={() => nudge(-1)}
          disabled={atMin}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          hitSlop={8}
          style={[
            styles.stepButton,
            { backgroundColor: colors.surfaceSunken, borderRadius: radius.sm, opacity: atMin ? 0.4 : 1 },
          ]}
        >
          <Feather name="minus" size={18} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.valueArea}>
          <Text
            accessibilityLiveRegion="polite"
            style={[typography.monoLarge, numeric, { color: colors.textPrimary }]}
          >
            {valid ? numberValue.toFixed(decimals) : '—'}
          </Text>
          <View
            style={[styles.track, { backgroundColor: colors.chartTrack, borderRadius: radius.full }]}
          >
            <View
              style={{
                width: `${clampedFraction * 100}%`,
                height: '100%',
                backgroundColor: colors.primary,
                borderRadius: radius.full,
              }}
            />
          </View>
          {minHint || maxHint ? (
            <View style={styles.hintRow}>
              <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{minHint}</Text>
              <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{maxHint}</Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={() => nudge(1)}
          disabled={atMax}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          hitSlop={8}
          style={[
            styles.stepButton,
            { backgroundColor: colors.surfaceSunken, borderRadius: radius.sm, opacity: atMax ? 0.4 : 1 },
          ]}
        >
          <Feather name="plus" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      {help ? (
        <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>{help}</Text>
      ) : null}
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[typography.bodySmall, { color: colors.status.critical.text }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  stepButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueArea: {
    flex: 1,
    gap: 6,
    alignItems: 'center',
  },
  track: {
    width: '100%',
    height: 6,
    overflow: 'hidden',
  },
  hintRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
