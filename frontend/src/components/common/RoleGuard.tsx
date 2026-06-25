import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';
import { spacing, typography } from '../../theme';

type Props = {
  allowedRoles: string[];
  children: React.ReactNode;
};

export function RoleGuard({ allowedRoles, children }: Props) {
  const { user } = useAuth();

  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Access restricted</Text>
      <Text style={styles.body}>This screen is available only to {allowedRoles.join(', ')} users.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
});
