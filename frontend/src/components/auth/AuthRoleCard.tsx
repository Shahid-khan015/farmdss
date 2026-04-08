import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from 'react-native-paper';

import { spacing, typography, borderRadius } from '../../theme';

const AUTH_GREEN = '#1E6B3C';

type AuthRoleCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
};

export function AuthRoleCard({
  title,
  description,
  icon,
  selected,
  onPress,
}: AuthRoleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {selected ? (
        <View style={styles.badge}>
          <Check color="#FFFFFF" size={14} strokeWidth={3} />
        </View>
      ) : null}
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 20,
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    minHeight: 168,
    position: 'relative',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: AUTH_GREEN,
    backgroundColor: '#EAF6EE',
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: AUTH_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    color: '#101828',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: '#475467',
  },
});
