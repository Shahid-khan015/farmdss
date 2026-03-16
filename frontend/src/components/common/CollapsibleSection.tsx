import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { spacing, typography, borderRadius, colors } from '../../theme';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  accessibilityLabel?: string;
}

export function CollapsibleSection({
  title,
  icon,
  children,
  defaultExpanded = true,
  accessibilityLabel,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const rotateAnim = React.useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);

    Animated.timing(rotateAnim, {
      toValue: !isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggleExpand}
        accessible
        accessibilityLabel={accessibilityLabel || `${title}, ${isExpanded ? 'expanded' : 'collapsed'}`}
        accessibilityRole="button"
      >
        <View style={styles.header}>
          {icon && (
            <View style={styles.iconWrapper}>
              <Feather name={icon} size={20} color={colors.primary} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          <Animated.View
            style={[
              styles.chevron,
              {
                transform: [{ rotate: rotateInterpolate }],
              },
            ]}
          >
            <Feather name="chevron-down" size={20} color={colors.muted} />
          </Animated.View>
        </View>
      </Pressable>

      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h5,
    color: colors.text,
    flex: 1,
  },
  chevron: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
  },
});
