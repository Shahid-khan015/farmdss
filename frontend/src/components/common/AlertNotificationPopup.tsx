import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { colors } from '../../constants/colors';
import type { AlertResponse as ServiceAlertResponse } from '../../services/AlertService';
import type { AlertResponse as SessionAlertResponse, AlertSummaryItem } from '../../services/SessionService';
import { spacing, typography } from '../../theme';

type AlertLike = ServiceAlertResponse | SessionAlertResponse | AlertSummaryItem;

function resolveSeverity(alert?: AlertLike | null): 'critical' | 'warning' | 'normal' {
  if (alert?.severity_color === 'red' || alert?.alert_status === 'critical') return 'critical';
  if (alert?.severity_color === 'orange' || alert?.alert_status === 'warning') return 'warning';
  return 'normal';
}

function paletteForSeverity(severity: 'critical' | 'warning' | 'normal') {
  if (severity === 'critical') {
    return {
      backgroundColor: '#FDECEC',
      borderColor: '#E6B8B7',
      accentColor: '#C00000',
      icon: 'x-circle' as const,
      title: 'Error',
    };
  }

  if (severity === 'warning') {
    return {
      backgroundColor: '#FFF8DB',
      borderColor: '#E9D9A3',
      accentColor: '#B7791F',
      icon: 'alert-triangle' as const,
      title: 'Warning',
    };
  }

  return {
    backgroundColor: '#FFF8DB',
    borderColor: '#E9D9A3',
    accentColor: '#A16207',
    icon: 'bell' as const,
    title: 'Alert',
  };
}

interface AlertNotificationPopupProps {
  alert?: AlertLike | null;
  onClose?: () => void;
  subtitle?: string | null;
}

export function AlertNotificationPopup({
  alert,
  onClose,
  subtitle,
}: AlertNotificationPopupProps) {
  if (!alert) return null;

  const severity = resolveSeverity(alert);
  const palette = paletteForSeverity(severity);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <Feather name={palette.icon} size={18} color={palette.accentColor} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.message}>
          <Text style={[styles.title, { color: palette.accentColor }]}>{`${palette.title}: `}</Text>
          <Text style={[styles.message, { color: palette.accentColor }]}>{alert.message}</Text>
        </Text>
        <Text style={styles.meta}>
          {alert.feed_key.replace(/_/g, ' ')}
          {subtitle ? ` | ${subtitle}` : ''}
        </Text>
      </View>

      {onClose ? (
        <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button">
          <Feather name="x" size={16} color={palette.accentColor} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 56,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  message: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  meta: {
    ...typography.labelSmall,
    color: colors.muted,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
