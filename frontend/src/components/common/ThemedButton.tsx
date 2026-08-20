import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';

import { useTheme } from '../../theme/ThemeProvider';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type Props = {
  children: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const SIZE = {
  sm: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36, fontSize: 12 },
  md: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 44, fontSize: 14 },
  lg: { paddingVertical: 14, paddingHorizontal: 20, minHeight: 52, fontSize: 16 },
} as const;

/**
 * Theme-aware button matching the same palette every other themed component
 * (`useTheme()`) draws from — the legacy `components/common/Button` reads a
 * separate, static, non-adaptive colour set (`constants/colors.ts`), which is
 * a visibly different green and doesn't respond to the device's colour scheme.
 * Kept deliberately small: same variants the result/history/setup actions
 * actually use, not a full design-system component.
 *
 * Lives in `common/` (not `simulation/`) because `ErrorState` — a genuinely
 * generic component — depends on it; a common/ component must not import from
 * a feature folder.
 */
export function ThemedButton({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
}: Props) {
  const { colors, radius, typography } = useTheme();
  const isDisabled = disabled || loading;
  const scale = React.useRef(new Animated.Value(1)).current;
  const sizing = SIZE[size];

  const press = (toValue: number) => {
    if (isDisabled) return;
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
  };

  const { background, border, textColor } = React.useMemo(() => {
    if (isDisabled) {
      return { background: colors.surfaceSunken, border: 'transparent', textColor: colors.textTertiary };
    }
    switch (variant) {
      case 'outline':
        return { background: 'transparent', border: colors.primary, textColor: colors.primary };
      case 'ghost':
        return { background: 'transparent', border: 'transparent', textColor: colors.primary };
      case 'destructive':
        return { background: colors.status.critical.base, border: 'transparent', textColor: colors.textOnAccent };
      default:
        return { background: colors.primary, border: 'transparent', textColor: colors.textOnAccent };
    }
  }, [variant, isDisabled, colors]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => press(0.97)}
      onPressOut={() => press(1)}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={style}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: background,
            borderColor: border,
            borderWidth: border === 'transparent' ? 0 : 2,
            borderRadius: radius.md,
            paddingVertical: sizing.paddingVertical,
            paddingHorizontal: sizing.paddingHorizontal,
            minHeight: sizing.minHeight,
            width: fullWidth ? '100%' : undefined,
            opacity: isDisabled ? 0.7 : 1,
            transform: [{ scale }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Text
            numberOfLines={1}
            style={[typography.label, { color: textColor, fontSize: sizing.fontSize, fontWeight: '600' }]}
          >
            {children}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
