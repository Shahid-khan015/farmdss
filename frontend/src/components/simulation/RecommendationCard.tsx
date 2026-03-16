import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { colors } from '../../constants/colors';
import { spacing, typography, borderRadius } from '../../theme';

function getStatusConfig(slip?: number | null) {
  if (slip == null || slip < 8 || slip > 15) {
    return {
      gradientStart: colors.danger,
      gradientEnd: '#F77B68',
      icon: 'alert-circle',
    };
  }

  return {
    gradientStart: colors.success,
    gradientEnd: '#66BB6A',
    icon: 'check-circle',
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

  const statusConfig = getStatusConfig(slip);
  const opacity = dismissAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const scale = dismissAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
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
          <View style={styles.header}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Feather name={statusConfig.icon} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.statusTitle}>
                Tractor is {loadStatus ?? 'Not Specified'}
              </Text>
              <Text style={styles.statusMessage}>{statusMessage ?? '—'}</Text>
            </View>
            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => [
                styles.dismissButton,
                pressed && styles.dismissButtonPressed,
              ]}
            >
              <Feather name="x" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {recommendations && (
            <View style={styles.recommendationsSection}>
              <View style={styles.recommendationsHeader}>
                <Feather name="lightbulb" size={16} color="#FFFFFF" />
                <Text style={styles.recommendationsTitle}>Recommendations</Text>
              </View>
              <Text style={styles.recommendationsText}>{recommendations}</Text>
            </View>
          )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  headerText: {
    flex: 1,
  },
  statusTitle: {
    ...typography.h5,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  statusMessage: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  dismissButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonPressed: {
    opacity: 0.7,
  },
  recommendationsSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  recommendationsTitle: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recommendationsText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
});
