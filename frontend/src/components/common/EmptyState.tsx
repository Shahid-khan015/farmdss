import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { ThemedButton } from './ThemedButton';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  /** One sentence on what to do next — an empty state should always have an exit. */
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  compact,
}: Props) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={description ? `${title}. ${description}` : title}
      style={[
        styles.container,
        { padding: compact ? spacing.lg : spacing.xxxl, gap: spacing.md },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: colors.surfaceSunken,
            borderColor: colors.border,
            borderRadius: radius.full,
            width: compact ? 44 : 56,
            height: compact ? 44 : 56,
          },
        ]}
      >
        <Feather name={icon} size={compact ? 20 : 24} color={colors.textTertiary} />
      </View>

      <View style={{ gap: spacing.xs, alignItems: 'center' }}>
        <Text style={[typography.h5, { color: colors.textPrimary, textAlign: 'center' }]}>
          {title}
        </Text>
        {description ? (
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            {description}
          </Text>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <ThemedButton variant="outline" size="sm" onPress={onAction}>
          {actionLabel}
        </ThemedButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
