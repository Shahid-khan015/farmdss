import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../constants/colors';
import { spacing, typography } from '../../theme';
import { OwnerScreenMenuButton } from './OwnerScreenMenuButton';

/** Body height of the fixed strip below the status bar (wrap padding + title row + border). */
export const OWNER_LIST_NAV_BODY_HEIGHT = spacing.lg + 40 + spacing.md + 1;

export function ownerListScrollPaddingTop(insetsTop: number) {
  return insetsTop + OWNER_LIST_NAV_BODY_HEIGHT;
}

type Props = { title: string };

/**
 * Same placement pattern as Session History for owner: fixed top bar, hamburger only (no back).
 */
export function OwnerListNavHeader({ title }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.fixedHeaderShell, { paddingTop: insets.top }]}>
      <View style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <OwnerScreenMenuButton />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeaderShell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 6,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
});
