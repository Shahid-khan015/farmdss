import React from 'react';
import {
  StyleProp,
  ViewStyle,
  Pressable,
  Animated,
  View,
  Text,
  StyleSheet,
  AccessibilityRole,
} from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { spacing, borderRadius, shadows, colors } from '../../theme';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';
type CardSpacing = 'compact' | 'default' | 'comfortable';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: CardVariant;
  pressable?: boolean;
  header?: string;
  spacing?: CardSpacing;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
}

const getVariantStyles = (variant: CardVariant) => {
  switch (variant) {
    case 'elevated':
      return {
        backgroundColor: colors.surface,
        borderWidth: 0,
        ...shadows.md,
      };
    case 'outlined':
      return {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.muted,
      };
    case 'filled':
      return {
        backgroundColor: '#F5F1EB',
        borderWidth: 0,
      };
    default: // 'default'
      return {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: '#E5E7EB',
      };
  }
};

const getPadding = (spacingType: CardSpacing) => {
  switch (spacingType) {
    case 'compact':
      return spacing.md;
    case 'comfortable':
      return spacing.xl;
    default: // 'default'
      return spacing.lg;
  }
};

export function Card({
  children,
  style,
  onPress,
  variant = 'default',
  pressable = false,
  header,
  spacing: spacingType = 'default',
  accessible = false,
  accessibilityLabel,
  accessibilityRole,
}: CardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (pressable) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
          speed: 20,
          bounciness: 0,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 0,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const variantStyles = getVariantStyles(variant);
  const paddingValue = getPadding(spacingType);

  const cardStyle: ViewStyle = {
    ...variantStyles,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  const content = (
    <View style={[cardStyle, style]}>
      {header && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{header}</Text>
        </View>
      )}
      <View style={{ padding: paddingValue }}>{children}</View>
    </View>
  );

  if (pressable) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole || 'button'}
      >
        <Animated.View style={animatedStyle}>{content}</Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

