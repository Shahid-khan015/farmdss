import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

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
 * Drawn in a fixed 320x188 user space and scaled to the measured width, so the
 * proportions hold on any screen rather than distorting with the container.
 *
 * The two axles are the subject of the drawing, not incidental detail: each one
 * gets a dashed centreline through the hub and a reaction column below the ground
 * line whose height is that axle's share of the dynamic load. The front axle
 * carries the Kwef tone, so a steering-weight problem is visible on the axle it
 * concerns rather than only in the legend.
 */
export function AxleLoadDiagram({
  frontLoadN,
  rearLoadN,
  frontUtilization,
  rearUtilization,
}: Props) {
  const { colors, spacing, radius, typography, numeric } = useTheme();
  const [width, setWidth] = React.useState(0);

  const frontTone = kwefTone(frontUtilization);
  const belowMinimum = frontUtilization !== null && frontUtilization < KWEF_MINIMUM;

  // --- fixed drawing space -------------------------------------------------
  const VB_W = 320;
  const VB_H = 188;
  const GROUND_Y = 126;
  const FRONT_CX = 80;
  const FRONT_R = 22;
  const REAR_CX = 236;
  const REAR_R = 34;
  /** Underside of the body. The wheels sit outboard of it in a side view, so
   *  they are drawn last and legitimately overlap it. */
  const BODY_BASE = 88;
  const frontCy = GROUND_Y - FRONT_R;
  const rearCy = GROUND_Y - REAR_R;

  // Reaction columns are scaled against the heavier axle so both stay visible;
  // the ratio between them is still exactly Rf : Rr.
  const heaviest = Math.max(frontLoadN ?? 0, rearLoadN ?? 0);
  const COLUMN_MAX = 30;
  const columnH = (load: number | null) =>
    heaviest > 0 && load !== null ? Math.max((load / heaviest) * COLUMN_MAX, 3) : 0;
  const frontColumnH = columnH(frontLoadN);
  const rearColumnH = columnH(rearLoadN);

  const tyre = colors.borderStrong;
  const bodyFill = colors.primary;
  const bodyShade = colors.primaryMuted;

  const summary = `Side view of the tractor. Front axle ${formatQuantity(
    frontLoadN,
    'force',
  )}, rear axle ${formatQuantity(rearLoadN, 'force')}.${
    belowMinimum ? ' Front axle below the 0.20 minimum utilisation.' : ''
  }`;

  /** Tyre: rubber ring, rim, hub, and tread ticks around the circumference. */
  const wheel = (cx: number, cy: number, r: number, hubColor: string, ringColor: string) => (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={colors.surfaceSunken} stroke={tyre} strokeWidth={6} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const inner = r - r * 0.06;
        const outer = r + r * 0.09;
        return (
          <Line
            key={i}
            x1={cx + Math.cos(a) * inner}
            y1={cy + Math.sin(a) * inner}
            x2={cx + Math.cos(a) * outer}
            y2={cy + Math.sin(a) * outer}
            stroke={tyre}
            strokeWidth={r * 0.09}
            strokeLinecap="round"
          />
        );
      })}
      <Circle cx={cx} cy={cy} r={r * 0.46} fill={colors.surface} stroke={ringColor} strokeWidth={2.5} />
      {/* Axle hub - the axle itself, and where its centreline passes through. */}
      <Circle cx={cx} cy={cy} r={r * 0.17} fill={hubColor} />
    </G>
  );

  return (
    <View style={{ gap: spacing.sm }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg
          width={width}
          height={Math.min(width * (VB_H / VB_W), 220)}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          accessibilityRole="image"
          accessibilityLabel={summary}
        >
          {/* Axle centrelines, drawn behind the machine */}
          <Line
            x1={FRONT_CX}
            y1={16}
            x2={FRONT_CX}
            y2={GROUND_Y + 8 + frontColumnH}
            stroke={colors.status[frontTone].border}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <Line
            x1={REAR_CX}
            y1={16}
            x2={REAR_CX}
            y2={GROUND_Y + 8 + rearColumnH}
            stroke={colors.textTertiary}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          {/* Wheelbase dimension between the two axle centres */}
          <Line x1={FRONT_CX} y1={22} x2={REAR_CX} y2={22} stroke={colors.textTertiary} strokeWidth={1} />
          <Line x1={FRONT_CX} y1={18} x2={FRONT_CX} y2={26} stroke={colors.textTertiary} strokeWidth={1} />
          <Line x1={REAR_CX} y1={18} x2={REAR_CX} y2={26} stroke={colors.textTertiary} strokeWidth={1} />
          <Rect x={140} y={14} width={36} height={15} rx={4} fill={colors.surface} />
          <SvgText
            x={158}
            y={25}
            fontSize={10}
            fill={colors.textTertiary}
            textAnchor="middle"
          >
            wheelbase
          </SvgText>

          {/* --- machine ---------------------------------------------------- */}
          {/* Rear fender: a true semicircular band over the driving wheel.
              Outer and inner arcs are exact semicircles (chord = 2r), so SVG
              never has to rescale the radii to make the path drawable. */}
          <Path
            d={`M ${REAR_CX - 42} ${BODY_BASE} A 42 42 0 0 1 ${REAR_CX + 42} ${BODY_BASE} L ${REAR_CX + 36} ${BODY_BASE} A 36 36 0 0 0 ${REAR_CX - 36} ${BODY_BASE} Z`}
            fill={bodyShade}
          />
          {/* Chassis beam between the axles */}
          <Rect x={FRONT_CX - 6} y={BODY_BASE} width={REAR_CX - FRONT_CX + 12} height={12} rx={3} fill={bodyShade} />
          {/* Bonnet over the front axle */}
          <Path
            d={`M 46 ${BODY_BASE} L 46 68 Q 46 62 52 62 L 152 62 L 152 ${BODY_BASE} Z`}
            fill={bodyFill}
          />
          {/* Grille */}
          <Rect x={46} y={70} width={7} height={14} rx={2} fill={colors.surfaceSunken} />
          {/* Exhaust stack */}
          <Rect x={132} y={38} width={6} height={24} rx={2} fill={bodyShade} />
          {/* Cab */}
          <Path
            d={`M 148 ${BODY_BASE} L 152 44 L 224 44 L 228 ${BODY_BASE} Z`}
            fill={bodyFill}
          />
          {/* Cab roof */}
          <Rect x={144} y={36} width={88} height={9} rx={3} fill={bodyShade} />
          {/* Window */}
          <Path
            d={`M 158 82 L 161 52 L 216 52 L 219 82 Z`}
            fill={colors.surfaceSunken}
            opacity={0.9}
          />

          {/* Wheels last so the hubs read on top of the body */}
          {wheel(REAR_CX, rearCy, REAR_R, colors.status.ok.base, colors.status.ok.base)}
          {wheel(FRONT_CX, frontCy, FRONT_R, colors.status[frontTone].base, colors.status[frontTone].base)}

          {/* Ground */}
          <Line
            x1={0}
            y1={GROUND_Y}
            x2={VB_W}
            y2={GROUND_Y}
            stroke={colors.borderStrong}
            strokeWidth={2.5}
          />

          {/* Ground-reaction columns: height is each axle's share of the load */}
          <Rect
            x={FRONT_CX - 9}
            y={GROUND_Y + 4}
            width={18}
            height={frontColumnH}
            rx={3}
            fill={colors.status[frontTone].base}
          />
          <Rect
            x={REAR_CX - 9}
            y={GROUND_Y + 4}
            width={18}
            height={rearColumnH}
            rx={3}
            fill={colors.status.ok.base}
          />

          {/* Axle captions */}
          <SvgText
            x={FRONT_CX}
            y={GROUND_Y + 52}
            fontSize={11}
            fontWeight="600"
            fill={colors.status[frontTone].text}
            textAnchor="middle"
          >
            FRONT AXLE
          </SvgText>
          <SvgText
            x={REAR_CX}
            y={GROUND_Y + 52}
            fontSize={11}
            fontWeight="600"
            fill={colors.textSecondary}
            textAnchor="middle"
          >
            REAR AXLE
          </SvgText>
        </Svg>
      ) : (
        <View style={{ height: 160 }} />
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
