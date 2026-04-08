import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { colors } from '../../constants/colors';
import { spacing, typography } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  title: string;
  subtitle?: string;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
};

export function DashboardAuthHeader({ title, subtitle, showMenuButton = false, onMenuPress }: Props) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showMenuButton ? (
          <Pressable
            onPress={onMenuPress}
            accessibilityRole="button"
            accessibilityLabel="Open sidebar"
            style={styles.menuButton}
          >
            <Feather name="menu" size={20} color={colors.primary} />
          </Pressable>
        ) : null}
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
      </View>
      {user ? (
        <Pressable
          onPress={() => logout()}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={styles.signOutBtn}
        >
          <Text style={styles.signOutLabel}>Sign out</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titles: { flex: 1, minWidth: 0 },
  title: { ...typography.h3, color: colors.text, fontWeight: '700' },
  sub: { ...typography.bodySmall, color: colors.muted, marginTop: spacing.xs },
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
  signOutBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  signOutLabel: { ...typography.labelSmall, color: colors.primary, fontWeight: '600' },
});
