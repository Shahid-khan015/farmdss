import React from 'react';
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

import { Card } from './Card';
import { borderRadius, spacing, typography, colors } from '../../theme';

type ActionVariant = 'solid' | 'outline' | 'danger';

type CardAction = {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant: ActionVariant;
};

type CardSpec = {
  icon: React.ReactNode;
  text: string;
};

export function ListEntityCard({
  title,
  subtitle,
  badge,
  specs,
  actions,
  onPress,
  accessibilityLabel,
  headerAccessory,
  style,
}: {
  title: string;
  subtitle: string;
  badge: {
    icon: React.ReactNode;
    label: string;
    textColor: string;
    backgroundColor: string;
  };
  specs: CardSpec[];
  actions?: CardAction[];
  onPress?: () => void;
  accessibilityLabel?: string;
  headerAccessory?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Card
      variant="elevated"
      spacing="default"
      pressable={!!onPress}
      onPress={onPress}
      style={[styles.card, style]}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.headerMeta}>
            <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
              {badge.icon}
              <Text style={[styles.badgeText, { color: badge.textColor }]}>{badge.label}</Text>
            </View>
            {headerAccessory}
          </View>
        </View>

        <View style={styles.specRow}>
          {specs.map((spec, index) => (
            <View key={`${spec.text}-${index}`} style={styles.specItem}>
              {spec.icon}
              <Text style={styles.specText}>{spec.text}</Text>
            </View>
          ))}
        </View>

        {actions?.length ? (
          <View style={styles.actionsRow}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                style={[
                  styles.actionButton,
                  action.variant === 'solid' && styles.primaryAction,
                  action.variant === 'outline' && styles.outlineAction,
                  action.variant === 'danger' && styles.dangerAction,
                ]}
                onPress={(event) => {
                  event.stopPropagation();
                  action.onPress();
                }}
              >
                {action.icon}
                <Text
                  style={[
                    styles.actionText,
                    action.variant === 'solid' && styles.primaryActionText,
                    action.variant === 'outline' && styles.outlineActionText,
                    action.variant === 'danger' && styles.dangerActionText,
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  headerMeta: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  content: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  specText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionText: {
    ...typography.label,
    fontWeight: '600',
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    color: '#FFFFFF',
  },
  outlineAction: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  outlineActionText: {
    color: colors.primary,
  },
  dangerAction: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF4D4F',
  },
  dangerActionText: {
    color: '#FF4D4F',
  },
});
