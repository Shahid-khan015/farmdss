import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { useTheme } from '../../../theme/ThemeProvider';
import type { StatusTone } from '../../../theme/palette';

export type Threshold = {
  value: number;
  label: string;
};

type Props = {
  value: number | null;
  min?: number;
  max: number;
  /** Reference lines drawn on the track, e.g. the DSS 15% ballast target. */
  thresholds?: Threshold[];
  tone?: StatusTone;
  valueLabel: string;
  accessibilityLabel: string;
  height?: number;
};

/**
 * Horizontal bar with labelled reference lines.
 *
 * Used where the interesting question is "how does this sit relative to the DSS
 * limits", which a bare number cannot answer.
 */
export function ThresholdBar({
  value,
  min = 0,
  max,
  thresholds = [],
  tone = 'neutral',
  valueLabel,
  accessibilityLabel,
  height = 64,
}: Props) {
  const { colors, typography, numeric, spacing } = useTheme();
  const [width, setWidth] = React.useState(0);

  const barY = 18;
  const barHeight = 14;
  const span = max - min || 1;
  const toX = (v: number) => ((Math.max(min, Math.min(max, v)) - min) / span) * width;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ gap: spacing.xs }}
    >
      <View style={styles.header}>
        <Text style={[typography.h4, numeric, { color: colors.textPrimary }]}>{valueLabel}</Text>
      </View>

      {width > 0 ? (
        <Svg width={width} height={height}>
          <Rect
            x={0}
            y={barY}
            width={width}
            height={barHeight}
            rx={barHeight / 2}
            fill={colors.chartTrack}
          />

          {value !== null ? (
            <Rect
              x={0}
              y={barY}
              width={Math.max(toX(value), barHeight)}
              height={barHeight}
              rx={barHeight / 2}
              fill={colors.status[tone].base}
            />
          ) : null}

          {thresholds.map((threshold, index) => {
            const x = toX(threshold.value);
            return (
              <React.Fragment key={index}>
                <Line
                  x1={x}
                  y1={barY - 6}
                  x2={x}
                  y2={barY + barHeight + 6}
                  stroke={colors.textTertiary}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
                <SvgText
                  x={Math.min(Math.max(x, 12), width - 12)}
                  y={barY + barHeight + 20}
                  fill={colors.textTertiary}
                  fontSize={10}
                  textAnchor="middle"
                >
                  {threshold.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
});
