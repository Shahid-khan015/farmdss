import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { spacing, typography } from '../../theme';

const AUTH_GREEN = '#1E6B3C';

type AuthStepIndicatorProps = {
  activeIndex: 0 | 1;
};

export function AuthStepIndicator({ activeIndex }: AuthStepIndicatorProps) {
  return (
    <View style={styles.row}>
      {['Role', 'Details'].map((label, index) => {
        const active = index <= activeIndex;
        return (
          <View key={label} style={styles.item}>
            <View style={[styles.dot, active && styles.dotActive]} />
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#E4E7EC',
  },
  dotActive: {
    backgroundColor: AUTH_GREEN,
  },
  label: {
    ...typography.bodySmall,
    color: '#475467',
  },
  labelActive: {
    color: '#344054',
    fontWeight: '600',
  },
});
