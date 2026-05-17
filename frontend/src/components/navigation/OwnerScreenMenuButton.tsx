import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../../constants/colors';
import { useOwnerSidebar } from '../../contexts/OwnerSidebarContext';

type Props = {
  /** Match HomeScreen owner header control */
  variant?: 'home' | 'outlined';
};

export function OwnerScreenMenuButton({ variant = 'outlined' }: Props) {
  const { openSidebar } = useOwnerSidebar();
  const isHome = variant === 'home';

  return (
    <Pressable
      onPress={openSidebar}
      accessibilityRole="button"
      accessibilityLabel="Open sidebar"
      style={[styles.menuButton, isHome && styles.menuButtonHome]}
    >
      <Feather name="menu" size={20} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonHome: {
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
});
