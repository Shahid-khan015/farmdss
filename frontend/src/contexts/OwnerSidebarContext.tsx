import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../constants/colors';
import { useAuth } from './AuthContext';
import { navigationRef } from '../navigation/navigationRef';
import { borderRadius, spacing, typography } from '../theme';

type OwnerSidebarContextValue = {
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const OwnerSidebarContext = createContext<OwnerSidebarContextValue | null>(null);

export function useOwnerSidebar(): OwnerSidebarContextValue {
  const ctx = useContext(OwnerSidebarContext);
  if (!ctx) {
    return {
      openSidebar: () => {},
      closeSidebar: () => {},
      toggleSidebar: () => {},
    };
  }
  return ctx;
}

type SidebarItem = { id: string; label: string; icon: React.ComponentProps<typeof Feather>['name']; onPress: () => void };

function useOwnerSidebarItems(onNavigate: () => void): SidebarItem[] {
  return useMemo(
    () => [
      {
        id: 'configuration',
        label: 'Configuration',
        icon: 'sliders',
        onPress: () => {
          onNavigate();
          navigationRef.navigate('Configuration');
        },
      },
      {
        id: 'simulations',
        label: 'Simulations',
        icon: 'activity',
        onPress: () => {
          onNavigate();
          navigationRef.navigate('SimulationStackScreen');
        },
      },
      {
        id: 'iot',
        label: 'IoT Dashboard',
        icon: 'radio',
        onPress: () => {
          onNavigate();
          navigationRef.navigate('IoTStackScreen');
        },
      },
      {
        id: 'charges',
        label: 'Charges',
        icon: 'dollar-sign',
        onPress: () => {
          onNavigate();
          navigationRef.navigate('OperationCharges');
        },
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'bar-chart-2',
        onPress: () => {
          onNavigate();
          navigationRef.navigate('Reports');
        },
      },
    ],
    [onNavigate],
  );
}

function OwnerSidebarModal({
  visible,
  onClose,
  items,
  onSignOut,
}: {
  visible: boolean;
  onClose: () => void;
  items: SidebarItem[];
  onSignOut: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sidebarOverlay}>
        <View style={[styles.sidebar, { paddingTop: insets.top + spacing.xl }]}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Menu</Text>
            <Pressable onPress={onClose} style={styles.sidebarClose} accessibilityRole="button" accessibilityLabel="Close sidebar">
              <Feather name="x" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.sidebarItems}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.sidebarItem}
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Feather name={item.icon} size={18} color={colors.primary} />
                <Text style={styles.sidebarItemText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.sidebarSignOut}
            onPress={onSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Feather name="log-out" size={18} color={colors.danger} />
            <Text style={styles.sidebarSignOutText}>Sign out</Text>
          </Pressable>
        </View>
        <Pressable style={styles.sidebarBackdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss sidebar" />
      </View>
    </Modal>
  );
}

export function OwnerSidebarProvider({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const isOwner = user?.role === 'owner';
  const [visible, setVisible] = useState(false);

  const closeSidebar = useCallback(() => setVisible(false), []);
  const openSidebar = useCallback(() => {
    if (isOwner) setVisible(true);
  }, [isOwner]);
  const toggleSidebar = useCallback(() => {
    if (!isOwner) return;
    setVisible((v) => !v);
  }, [isOwner]);

  const afterNav = closeSidebar;
  const items = useOwnerSidebarItems(afterNav);

  const onSignOut = useCallback(() => {
    closeSidebar();
    logout();
  }, [closeSidebar, logout]);

  const value = useMemo(
    () => ({
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }),
    [openSidebar, closeSidebar, toggleSidebar],
  );

  return (
    <OwnerSidebarContext.Provider value={value}>
      {children}
      {isOwner ? <OwnerSidebarModal visible={visible} onClose={closeSidebar} items={items} onSignOut={onSignOut} /> : null}
    </OwnerSidebarContext.Provider>
  );
}

const styles = StyleSheet.create({
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
  },
  sidebar: {
    width: 280,
    maxWidth: '82%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopRightRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  sidebarBackdrop: {
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sidebarTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  sidebarClose: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarItems: {
    gap: spacing.sm,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  sidebarItemText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  sidebarSignOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: 'auto',
  },
  sidebarSignOutText: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '700',
  },
});
