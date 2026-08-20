import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { useTheme } from '../../../theme/ThemeProvider';
import type { StatusTone } from '../../../theme/palette';

export type GaugeBand = {
  from: number;
  to: number;
  tone: StatusTone;
  label?: string;
};

type Props = {
  /** Value in the same units as `min`/`max`. Null renders an explicit "not reported" gauge. */
  value: number | null;
  min: number;
  max: number;
  /** Coloured zones drawn on the track, e.g. the DSS properly-loaded window. */
  bands?: GaugeBand[];
  valueLabel: string;
  caption?: string;
  tone?: StatusTone;
  size?: number;
  accessibilityLabel: string;
};

const START_ANGLE = -220;
const SWEEP = 260;

function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, radius: number, from: number, to: number) {
  const start = polar(cx, cy, radius, from);
  const end = polar(cx, cy, radius, to);
  const largeArc = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * Radial gauge with meaning-bearing bands.
 *
 * The bands come from documented DSS thresholds, so the colour tells the user where
 * the engine's own limits are rather than expressing an opinion of our own.
 */
export function GaugeArc({
  value,
  min,
  max,
  bands = [],
  valueLabel,
  caption,
  tone = 'neutral',
  size = 180,
  accessibilityLabel,
}: Props) {
  const { colors, typography, numeric } = useTheme();

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 16;
  const strokeWidth = 12;

  const toAngle = (v: number) => {
    const clamped = Math.max(min, Math.min(max, v));
    const fraction = (clamped - min) / (max - min || 1);
    return START_ANGLE + fraction * SWEEP;
  };

  const needleAngle = value === null ? null : toAngle(value);
  const needlePoint = useMemo(
    () => (needleAngle === null ? null : polar(cx, cy, radius, needleAngle)),
    [needleAngle, cx, cy, radius],
  );

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={styles.container}
    >
      <Svg width={size} height={size * 0.78} viewBox={`0 0 ${size} ${size * 0.78}`}>
        <G>
          <Path
            d={arcPath(cx, cy, radius, START_ANGLE, START_ANGLE + SWEEP)}
            stroke={colors.chartTrack}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {bands.map((band, index) => (
            <Path
              key={index}
              d={arcPath(cx, cy, radius, toAngle(band.from), toAngle(band.to))}
              stroke={colors.status[band.tone].base}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              opacity={0.9}
              fill="none"
            />
          ))}

          {needlePoint ? (
            <Circle
              cx={needlePoint.x}
              cy={needlePoint.y}
              r={strokeWidth / 2 + 3}
              fill={colors.surface}
              stroke={colors.status[tone].base}
              strokeWidth={3}
            />
          ) : null}
        </G>
      </Svg>

      <View style={styles.readout} pointerEvents="none">
        <Text style={[typography.h2, numeric, { color: colors.textPrimary }]}>{valueLabel}</Text>
        {caption ? (
          <Text style={[typography.bodySmall, { color: colors.textTertiary, textAlign: 'center' }]}>
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  readout: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 24,
  },
});
