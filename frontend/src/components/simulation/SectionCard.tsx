import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  /** Optional heading rendered above the card content. */
  title?: string;
  icon?: keyof typeof Feather.glyphMap;
  /** Optional element (e.g. a count or pill) shown at the end of the title row. */
  accessory?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Tightens vertical rhythm for cards holding a single short row. */
  compact?: boolean;
};

/**
 * The single card container for themed screens: same surface, border, radius
 * and padding everywhere, so a screen built from several of these reads as one
 * layout instead of a mix of bare sections and ad-hoc boxes.
 */
export function SectionCard({ title, icon, accessory, children, style, compact }: Props) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: compact ? spacing.md : spacing.lg,
          gap: compact ? spacing.sm : spacing.md,
        },
        style,
      ]}
    >
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {icon ? <Feather name={icon} size={16} color={colors.textSecondary} /> : null}
            <Text accessibilityRole="header" style={[typography.h5, { color: colors.textPrimary }]}>
              {title}
            </Text>
          </View>
          {accessory}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
});
