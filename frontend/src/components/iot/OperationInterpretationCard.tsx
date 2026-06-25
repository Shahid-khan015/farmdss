import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { Card } from '../common/Card';
import { colors } from '../../constants/colors';
import { spacing, typography } from '../../theme';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OperationInterpretationCardProps {
  interpretation: string | null;
  stateKey: string | null;
  stateColor: string | null;
  gpsChanged: boolean | null;
  ptoRotating: boolean | null;
  vibrating: boolean | null;
  signalsAvailable: boolean;
  lastUpdatedAt?: Date | null;
}

// ─── Icon mapping per state ───────────────────────────────────────────────────

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

const STATE_ICONS: Record<string, FeatherIconName> = {
  pto_field_work:    'zap',
  nonpto_field_work: 'activity',
  stationary_pto:    'anchor',
  engine_on_idle:    'pause-circle',
  engine_off:        'power',
  transit:           'navigation',
  unavailable:       'wifi-off',
};

const DEFAULT_COLOR = '#9CA3AF';

// ─── Signal Pill ─────────────────────────────────────────────────────────────

interface SignalPillProps {
  label: string;
  active: boolean | null;
  activeColor?: string;
}

function SignalPill({ label, active, activeColor = '#16A34A' }: SignalPillProps) {
  const isActive = active === true;
  const isUnknown = active === null;
  const dotColor = isUnknown ? '#9CA3AF' : isActive ? activeColor : '#EF4444';
  const bg = isUnknown ? '#F3F4F6' : isActive ? `${activeColor}18` : '#FEF2F2';
  const textColor = isUnknown ? '#6B7280' : isActive ? activeColor : '#DC2626';

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <View style={[styles.pillDot, { backgroundColor: dotColor }]} />
      <Text style={[styles.pillText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function OperationInterpretationCard({
  interpretation,
  stateKey,
  stateColor,
  gpsChanged,
  ptoRotating,
  vibrating,
  signalsAvailable,
  lastUpdatedAt,
}: OperationInterpretationCardProps) {
  const badgeColor = stateColor ?? DEFAULT_COLOR;
  const iconName: FeatherIconName = STATE_ICONS[stateKey ?? 'unavailable'] ?? 'help-circle';
  const displayText = interpretation ?? 'Operational state unavailable';
  const isUnavailable = !signalsAvailable || stateKey === 'unavailable';

  const secondsAgo =
    lastUpdatedAt != null
      ? Math.max(0, Math.floor((Date.now() - lastUpdatedAt.getTime()) / 1000))
      : null;

  return (
    <Card variant="elevated" spacing="comfortable" style={styles.card}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${badgeColor}18` }]}>
          <Feather name={iconName} size={20} color={badgeColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.cardTitle}>Operational State</Text>
          {secondsAgo != null ? (
            <Text style={styles.updatedText}>
              Updated {secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`}
            </Text>
          ) : null}
        </View>
        <View style={[styles.stateBadge, { backgroundColor: `${badgeColor}22`, borderColor: `${badgeColor}55` }]}>
          <View style={[styles.stateDot, { backgroundColor: badgeColor }]} />
        </View>
      </View>

      {/* Interpretation sentence */}
      <View style={[styles.interpretationBox, { borderLeftColor: badgeColor }]}>
        <Text
          style={[
            styles.interpretationText,
            isUnavailable && styles.interpretationTextMuted,
          ]}
        >
          {displayText}
        </Text>
      </View>

      {/* Signal pills */}
      <View style={styles.pillRow}>
        <SignalPill
          label="GPS Moving"
          active={gpsChanged}
          activeColor="#2563EB"
        />
        <SignalPill
          label="PTO Active"
          active={ptoRotating}
          activeColor="#CA8A04"
        />
        <SignalPill
          label="Vibration"
          active={vibrating}
          activeColor="#16A34A"
        />
      </View>
    </Card>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    ...typography.label,
    color: colors.text,
    fontWeight: '700',
  },
  updatedText: {
    ...typography.bodySmall,
    color: colors.muted,
    fontSize: 11,
  },
  stateBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  interpretationBox: {
    borderLeftWidth: 3,
    borderRadius: 4,
    paddingLeft: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    backgroundColor: '#F9FAFB',
  },
  interpretationText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 22,
  },
  interpretationTextMuted: {
    color: colors.muted,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillText: {
    ...typography.bodySmall,
    fontWeight: '600',
    fontSize: 12,
  },
});
