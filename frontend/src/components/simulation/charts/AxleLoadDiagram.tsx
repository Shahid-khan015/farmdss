import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { useTheme } from '../../../theme/ThemeProvider';
import { formatQuantity } from '../../../theme/units';
import { KWEF_MINIMUM, kwefTone } from '../../../utils/dssBands';

type Props = {
  frontLoadN: number | null;
  rearLoadN: number | null;
  /** Kwef = Rf/Wt, the DSS front-axle utilisation ratio. */
  frontUtilization: number | null;
  rearUtilization: number | null;
};

/**
 * Side elevation of the tractor showing how dynamic weight splits across the axles.
 *
 * The front/rear proportions are drawn straight from the engine's `Rf`/`Rr`, and the
 * front axle is flagged when Kwef falls below the DSS steering minimum of 0.20.
 */
export function AxleLoadDiagram({
  frontLoadN,
  rearLoadN,
  frontUtilization,
  rearUtilization,
}: Props) {
  const { colors, spacing, radius, typography, numeric } = useTheme();
  const [width, setWidth] = React.useState(0);

  const total = (frontLoadN ?? 0) + (rearLoadN ?? 0);
  const frontShare = total > 0 && frontLoadN !== null ? frontLoadN / total : 0;
  const frontTone = kwefTone(frontUtilization);
  const belowMinimum = frontUtilization !== null && frontUtilization < KWEF_MINIMUM;

  const height = 128;
  const groundY = height - 26;
  const wheelR = 18;
  const frontCx = width * 0.24;
  const rearCx = width * 0.76;

  const summary = `Front axle ${formatQuantity(frontLoadN, 'force')}, rear axle ${formatQuantity(
    rearLoadN,
    'force',
  )}.${belowMinimum ? ' Front axle below the 0.20 minimum utilisation.' : ''}`;

  return (
    <View style={{ gap: spacing.sm }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg
          width={width}
          height={height}
          accessibilityRole="image"
          accessibilityLabel={summary}
        >
          {/* Ground line */}
          <Line
            x1={0}
            y1={groundY + wheelR}
            x2={width}
            y2={groundY + wheelR}
            stroke={colors.border}
            strokeWidth={2}
          />

          {/* Chassis */}
          <Rect
            x={frontCx}
            y={groundY - 26}
            width={rearCx - frontCx}
            height={12}
            rx={4}
            fill={colors.borderStrong}
          />
          {/* Cab block over the rear axle */}
          <Rect
            x={rearCx - 34}
            y={groundY - 56}
            width={40}
            height={32}
            rx={5}
            fill={colors.surfaceSunken}
            stroke={colors.borderStrong}
            strokeWidth={1.5}
          />

          {/* Wheels sized by their share of the dynamic load */}
          <Circle
            cx={frontCx}
            cy={groundY}
            r={wheelR}
            fill={colors.status[frontTone].surface}
            stroke={colors.status[frontTone].base}
            strokeWidth={3}
          />
          <Circle
            cx={rearCx}
            cy={groundY - 4}
            r={wheelR + 6}
            fill={colors.status.ok.surface}
            stroke={colors.status.ok.base}
            strokeWidth={3}
          />

          {/* Load split ribbon */}
          <Rect x={0} y={8} width={width} height={8} rx={4} fill={colors.chartTrack} />
          <Rect
            x={0}
            y={8}
            width={Math.max(width * frontShare, 4)}
            height={8}
            rx={4}
            fill={colors.status[frontTone].base}
          />
        </Svg>
      ) : (
        <View style={{ height }} />
      )}

      <View style={styles.legend}>
        <View
          style={[
            styles.legendItem,
            {
              backgroundColor: colors.status[frontTone].surface,
              borderColor: colors.status[frontTone].border,
              borderRadius: radius.md,
              padding: spacing.sm,
            },
          ]}
        >
          <Text style={[typography.caption, { color: colors.status[frontTone].text }]}>Front axle</Text>
          <Text style={[typography.h5, numeric, { color: colors.textPrimary }]}>
            {formatQuantity(frontLoadN, 'force')}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
            Kwef {frontUtilization !== null ? frontUtilization.toFixed(2) : '—'}
            {belowMinimum ? ` · below ${KWEF_MINIMUM.toFixed(2)}` : ''}
          </Text>
        </View>

        <View
          style={[
            styles.legendItem,
            {
              backgroundColor: colors.surfaceSunken,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.sm,
            },
          ]}
        >
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Rear axle</Text>
          <Text style={[typography.h5, numeric, { color: colors.textPrimary }]}>
            {formatQuantity(rearLoadN, 'force')}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
            {rearUtilization !== null ? `Ratio ${rearUtilization.toFixed(2)}` : '—'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    gap: 8,
  },
  legendItem: {
    flex: 1,
    borderWidth: 1,
    gap: 2,
  },
});
