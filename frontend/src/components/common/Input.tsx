import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  Text,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { spacing, typography, borderRadius, colors } from '../../theme';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  rightIcon,
  containerStyle,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  editable = true,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColorAnim = React.useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
    onFocusProp?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
    onBlurProp?.(e);
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.danger : '#E5E7EB', colors.primary],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        {icon && <View style={styles.leftIcon}>{icon}</View>}
        <TextInput
          mode="outlined"
          editable={editable}
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            { opacity: editable ? 1 : 0.5 },
            style,
          ]}
          activeOutlineColor={colors.primary}
          outlineColor={error ? colors.danger : '#E5E7EB'}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {helperText && (
        <Text style={[styles.helperText, error && styles.helperTextError]}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  inputWrapperFocused: {
    // Subtle glow effect on focus
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    ...typography.body,
  },
  leftIcon: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  rightIcon: {
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  helperTextError: {
    color: colors.danger,
  },
});


