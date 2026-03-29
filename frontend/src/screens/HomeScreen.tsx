import React, { useEffect } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../constants/colors';
import { spacing, typography, borderRadius } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface StatCard {
  id: string;
  label: string;
  value: number;
  icon: string;
  color: string;
}

export function HomeScreen() {
  const nav = useNavigation<any>();
  const { stats, isLoading, error } = useDashboardStats();
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const gridGap = spacing.md;
  const horizontalPadding = spacing.lg * 2;
  const twoColumnCardWidth = (width - horizontalPadding - gridGap) / 2;

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateAnim = React.useRef(new Animated.ValueXY({ x: 0, y: 20 })).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim.y, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const statCards: StatCard[] = stats
    ? [
        {
          id: 'tractors',
          label: 'Tractors',
          value: stats.tractors,
          icon: 'truck',
          color: colors.primary,
        },
        {
          id: 'implements',
          label: 'Implements',
          value: stats.implements,
          icon: 'tool',
          color: colors.secondary,
        },
        {
          id: 'simulations',
          label: 'Simulations',
          value: stats.simulations,
          icon: 'activity',
          color: colors.accent,
        },
        {
          id: 'avg-load',
          label: 'Avg Load',
          value: 87,
          icon: 'zap',
          color: colors.warning,
        },
      ]
    : [];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <Animated.View
        style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim.y }],
          },
        ]}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Tractor Performance DSS
        </Text>
      </Animated.View>

      {/* Run Simulation Button */}
      <Animated.View
        style={[
          styles.runSimButtonWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim.y }],
          },
        ]}
      >
        <Button
          onPress={() =>
            nav.navigate('SimulationsTab', { screen: 'SimulationSetup' })
          }
          style={styles.runSimButton}
        >
          <View style={styles.runSimButtonContent}>
            <Feather name="play-circle" size={20} color="#FFFFFF" />
            <Text style={styles.runSimButtonText}>Run Simulation</Text>
          </View>
        </Button>
      </Animated.View>

      {/* Stats Grid */}
      {!isLoading && !error && (
        <Animated.View
          style={[
            styles.statsGrid,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim.y }],
            },
          ]}
        >
          {statCards.map((stat) => (
            <Card
              key={stat.id}
              variant="elevated"
              spacing="comfortable"
              style={[
                styles.statCard,
                { width: isCompact ? width - horizontalPadding : twoColumnCardWidth },
              ]}
              accessible
              accessibilityLabel={`${stat.label}: ${stat.value}`}
            >
              <View style={styles.statCardLayout}>
                {/* Top Row: Label and Icon */}
                <View style={styles.statCardTop}>
                  <Text style={styles.statLabel}>{stat.label.toUpperCase()}</Text>
                  <View
                    style={[
                      styles.statIconWrapper,
                      { backgroundColor: `${stat.color}20` },
                    ]}
                  >
                    <Feather name={stat.icon} size={24} color={stat.color} />
                  </View>
                </View>

                {/* Middle: Large Value */}
                <Text style={styles.statValue}>{stat.value}</Text>

                {/* Bottom: Manage Link */}
                <Pressable
                  onPress={() => {
                    if (stat.id === 'tractors') {
                      nav.navigate('TractorsTab', { screen: 'TractorList' });
                    } else if (stat.id === 'implements') {
                      nav.navigate('ImplementsTab', { screen: 'ImplementList' });
                    } else if (stat.id === 'simulations') {
                      nav.navigate('SimulationsTab', { screen: 'SimulationHistory' });
                    }
                  }}
                  style={styles.manageLink}
                >
                  <Text style={styles.manageLinkText}>Manage →</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </Animated.View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={typography.body}>Loading statistics...</Text>
        </View>
      )}

      {error && (
        <Card variant="outlined" style={styles.errorCard}>
          <Text style={{ color: colors.danger }}>
            Error: {error.message}
          </Text>
        </Card>
      )}

      {/* Quick Actions Section */}
      <Animated.View
        style={[
          styles.actionsSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim.y }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <Card
          variant="elevated"
          spacing="default"
          pressable
          onPress={() =>
            nav.navigate('TractorsTab', { screen: 'TractorForm' })
          }
          accessibilityLabel="Add a new tractor"
        >
          <View style={styles.actionItem}>
            <View style={[styles.actionIconWrapper, { backgroundColor: '#4CAF5020' }]}>
              <Feather name="truck" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add Tractor</Text>
              <Text style={styles.actionDesc}>Register a new tractor profile</Text>
            </View>
          </View>
        </Card>

        <Card
          variant="elevated"
          spacing="default"
          pressable
          onPress={() =>
            nav.navigate('ImplementsTab', { screen: 'ImplementForm' })
          }
          accessibilityLabel="Add a new implement"
        >
          <View style={styles.actionItem}>
            <View style={[styles.actionIconWrapper, { backgroundColor: '#79554820' }]}>
              <Feather name="tool" size={24} color={colors.secondary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add Implement</Text>
              <Text style={styles.actionDesc}>Define implement parameters</Text>
            </View>
          </View>
        </Card>

        <Card
          variant="elevated"
          spacing="default"
          pressable
          onPress={() =>
            nav.navigate('SimulationsTab', { screen: 'SimulationHistory' })
          }
          accessibilityLabel="View simulation history"
        >
          <View style={styles.actionItem}>
            <View style={[styles.actionIconWrapper, { backgroundColor: '#2196F320' }]}>
              <Feather name="history" size={24} color={colors.accent} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View History</Text>
              <Text style={styles.actionDesc}>Compare past simulations</Text>
            </View>
          </View>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  headerSection: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.muted,
  },
  runSimButtonWrapper: {
    marginBottom: spacing.xl,
  },
  runSimButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  runSimButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  runSimButtonText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCard: {
    alignSelf: 'flex-start',
  },
  statCardLayout: {
    gap: spacing.sm,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    fontWeight: '600',
    fontSize: 11,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginVertical: spacing.sm,
  },
  manageLink: {
    alignSelf: 'flex-start',
  },
  manageLinkText: {
    ...typography.labelSmall,
    color: colors.accent,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    marginBottom: spacing.lg,
  },
  actionsSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.h5,
    color: colors.text,
  },
  actionDesc: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});