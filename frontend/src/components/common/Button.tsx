import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  ActivityIndicator,
  AccessibilityRole,
} from 'react-native';
import { spacing, typography, borderRadius, colors, shadows } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: string | React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const getVariantStyles = (variant: ButtonVariant, disabled: boolean) => {
  const baseStyle = {
    borderRadius: borderRadius.md,
  };

  if (disabled) {
    return {
      ...baseStyle,
      backgroundColor: '#E5E7EB',
      borderWidth: 0,
    };
  }

  switch (variant) {
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: '#F5F1EB',
        borderWidth: 0,
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
      };
    case 'ghost':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
    case 'destructive':
      return {
        ...baseStyle,
        backgroundColor: colors.danger,
        borderWidth: 0,
      };
    default: // 'primary'
      return {
        ...baseStyle,
        backgroundColor: colors.primary,
        borderWidth: 0,
      };
  }
};

const getTextColor = (variant: ButtonVariant, disabled: boolean) => {
  if (disabled) return '#9CA3AF';

  switch (variant) {
    case 'secondary':
      return colors.text;
    case 'outline':
    case 'ghost':
      return colors.primary;
    case 'destructive':
      return colors.surface;
    default: // 'primary'
      return colors.surface;
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        fontSize: 12,
      };
    case 'lg':
      return {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        fontSize: 16,
      };
    default: // 'md'
      return {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        fontSize: 14,
      };
  }
};

const getMinHeight = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return 36;
    case 'lg':
      return 52;
    default: // 'md'
      return 44;
  }
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  rightIcon,
  fullWidth = false,
  style,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
      }).start();
    }
  };

  const variantStyles = getVariantStyles(variant, isDisabled);
  const textColor = getTextColor(variant, isDisabled);
  const sizeStyles = getSizeStyles(size);
  const minHeight = getMinHeight(size);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.button,
          variantStyles,
          {
            minHeight,
            width: fullWidth ? '100%' : 'auto',
            opacity: isDisabled ? 0.6 : 1,
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        {icon && <View style={styles.leftIcon}>{icon}</View>}

        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : typeof children === 'string' ? (
          <Text
            style={[
              styles.text,
              { color: textColor, fontSize: sizeStyles.fontSize },
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}

        {rightIcon && !loading && <View style={styles.rightIcon}>{rightIcon}</View>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  text: {
    ...typography.label,
    fontWeight: '600',
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
});
