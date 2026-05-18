import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { colors } from '../../constants/colors';
import { spacing, typography, borderRadius } from '../../theme';

function getStatusConfig(loadStatus?: string | null, slip?: number | null) {
  const normalized = (loadStatus ?? '').trim().toLowerCase();

  if (normalized.includes('over')) {
    return {
      gradientStart: colors.danger,
      gradientEnd: '#EF6C63',
      icon: 'alert-triangle' as const,
      badgeLabel: 'Over Loaded',
    };
  }

  if (normalized.includes('under')) {
    return {
      gradientStart: colors.success,
      gradientEnd: '#66BB6A',
      icon: 'check-circle' as const,
      badgeLabel: 'Under Loaded',
    };
  }

  if (normalized.includes('proper')) {
    return {
      gradientStart: colors.warning,
      gradientEnd: '#D9A406',
      icon: 'info' as const,
      badgeLabel: 'Properly Loaded',
    };
  }

  if (slip == null || slip < 8 || slip > 15) {
    return {
      gradientStart: colors.warning,
      gradientEnd: '#D9A406',
      icon: 'info' as const,
      badgeLabel: loadStatus ?? 'Review Needed',
    };
  }

  return {
    gradientStart: colors.warning,
    gradientEnd: '#D9A406',
    icon: 'info' as const,
    badgeLabel: loadStatus ?? 'Properly Loaded',
  };
}

export function RecommendationCard({
  statusMessage,
  recommendations,
  slip,
  loadStatus,
}: {
  statusMessage?: string | null;
  recommendations?: string | null;
  slip?: number | null;
  loadStatus?: string | null;
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const dismissAnim = React.useRef(new Animated.Value(0)).current;

  const handleDismiss = () => {
    Animated.timing(dismissAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsDismissed(true));
  };

  if (isDismissed) return null;

  const statusConfig = getStatusConfig(loadStatus, slip);
  const opacity = dismissAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const scale = dismissAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.94],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <LinearGradient
        colors={[statusConfig.gradientStart, statusConfig.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.topBar}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerBadge}>
                <Text style={styles.statusEyebrow}>Tractor Load Status</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{statusConfig.badgeLabel}</Text>
              </View>
            </View>
            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => [
                styles.dismissButton,
                pressed && styles.dismissButtonPressed,
              ]}
            >
              <Feather name="x" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.heroRow}>
            <View style={styles.iconPanel}>
              <View style={styles.iconWrapper}>
                <Feather name={statusConfig.icon} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.iconPanelLabel}>Current State</Text>
            </View>

            <View style={styles.headerText}>
              <Text style={styles.statusTitle}>{loadStatus ?? 'Status Not Specified'}</Text>
              <Text style={styles.statusMessage}>{statusMessage ?? 'Review the current tractor loading before the next run.'}</Text>
            </View>
          </View>

          {recommendations ? (
            <View style={styles.recommendationsSection}>
              <View style={styles.recommendationsHeader}>
                <Feather name="lightbulb" size={16} color="#FFFFFF" />
                <Text style={styles.recommendationsTitle}>Recommended Action</Text>
              </View>
              <Text style={styles.recommendationsText}>{recommendations}</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  gradient: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  cardContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  kickerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  kickerBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  iconPanel: {
    width: 92,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  iconPanelLabel: {
    ...typography.labelSmall,
    color: 'rgba(255,255,255,0.82)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  statusEyebrow: {
    ...typography.labelSmall,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusPillText: {
    ...typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusTitle: {
    ...typography.h4,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    fontWeight: '700',
    lineHeight: 30,
  },
  statusMessage: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  dismissButton: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  dismissButtonPressed: {
    opacity: 0.7,
  },
  recommendationsSection: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  recommendationsTitle: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  recommendationsText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 22,
  },
});
