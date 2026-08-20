import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';

export type WizardStep = { key: string; title: string };

type Props = {
  steps: WizardStep[];
  current: number;
  /** Steps the user has completed, enabling backward navigation. */
  furthestReached: number;
  onStepPress: (index: number) => void;
};

export function WizardProgressHeader({ steps, current, furthestReached, onStepPress }: Props) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <View style={styles.row}>
        {steps.map((step, index) => {
          const isCurrent = index === current;
          const isDone = index < current;
          const reachable = index <= furthestReached;

          return (
            <React.Fragment key={step.key}>
              {index > 0 ? (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: index <= current ? colors.primary : colors.border },
                  ]}
                />
              ) : null}
              <Pressable
                onPress={() => reachable && onStepPress(index)}
                disabled={!reachable}
                accessibilityRole="button"
                accessibilityState={{ selected: isCurrent, disabled: !reachable }}
                accessibilityLabel={`Step ${index + 1} of ${steps.length}: ${step.title}${
                  isDone ? ', completed' : ''
                }`}
                hitSlop={6}
                style={styles.stepButton}
              >
                <View
                  style={[
                    styles.bubble,
                    {
                      borderRadius: radius.full,
                      backgroundColor: isCurrent
                        ? colors.primary
                        : isDone
                          ? colors.primarySurface
                          : colors.surfaceSunken,
                      borderColor: isCurrent || isDone ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {isDone ? (
                    <Feather name="check" size={14} color={colors.primary} />
                  ) : (
                    <Text
                      style={[
                        typography.labelSmall,
                        {
                          color: isCurrent ? colors.textOnAccent : colors.textTertiary,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
              </Pressable>
            </React.Fragment>
          );
        })}
      </View>

      <View style={{ gap: 2 }}>
        <Text style={[typography.caption, { color: colors.textTertiary }]}>
          Step {current + 1} of {steps.length}
        </Text>
        <Text accessibilityRole="header" style={[typography.h4, { color: colors.textPrimary }]}>
          {steps[current]?.title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  connector: {
    flex: 1,
    height: 2,
  },
});
