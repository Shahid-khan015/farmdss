import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/ThemeProvider';
import { COMBINATION_TYPE_META, type SimulationCombinationType } from '../../types/simulation';

/**
 * Stages the engine actually works through, in order. These mirror the DSS
 * derivation sequence so the wait communicates what is happening rather than
 * showing a generic spinner.
 */
const STAGES = [
  'Computing implement draft',
  'Balancing axle loads',
  'Iterating wheel slip',
  'Solving ballast and power',
];

type Props = {
  visible: boolean;
  mode: SimulationCombinationType;
};

export function RunProgressOverlay({ visible, mode }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const [stage, setStage] = useState(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      setStage(0);
      return;
    }
    // The API gives no progress events, so stages advance on a timer and stop at
    // the last one — it indicates sequence, never a percentage we cannot know.
    const timer = setInterval(() => {
      setStage((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, 700);
    return () => clearInterval(timer);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      spin.value = 0;
      spin.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(spin);
    }
    return () => cancelAnimation(spin);
  }, [visible, spin]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: colors.scrim }]}>
        <View
          accessible
          accessibilityLiveRegion="polite"
          accessibilityLabel={`Running simulation. ${STAGES[stage]}.`}
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.xl,
              gap: spacing.lg,
            },
          ]}
        >
          <Animated.View style={spinnerStyle}>
            <Feather name="loader" size={28} color={colors.primary} />
          </Animated.View>

          <View style={{ gap: spacing.xs, alignItems: 'center' }}>
            <Text style={[typography.h5, { color: colors.textPrimary }]}>Running simulation</Text>
            <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
              {COMBINATION_TYPE_META[mode].short}
            </Text>
          </View>

          <View style={{ gap: spacing.sm, alignSelf: 'stretch' }}>
            {STAGES.map((text, index) => {
              const done = index < stage;
              const active = index === stage;
              return (
                <View key={text} style={styles.stageRow}>
                  <Feather
                    name={done ? 'check-circle' : active ? 'circle' : 'circle'}
                    size={14}
                    color={
                      done ? colors.status.ok.base : active ? colors.primary : colors.borderStrong
                    }
                  />
                  <Text
                    style={[
                      typography.body,
                      {
                        color: done || active ? colors.textPrimary : colors.textTertiary,
                        fontWeight: active ? '600' : '400',
                      },
                    ]}
                  >
                    {text}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
