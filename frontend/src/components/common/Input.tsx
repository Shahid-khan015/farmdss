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

/**
 * React Native widens `selectionColor`/`cursorColor` to `ColorValue | null`, while
 * Paper's TextInput only accepts `string | undefined`. Omitting them keeps the prop
 * spread type-safe; neither is used by this component.
 */
interface InputProps extends Omit<RNTextInputProps, 'selectionColor' | 'cursorColor'> {
  label?: string;
  error?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** react-native-paper ``TextInput`` adornment (e.g. ``TextInput.Icon``). */
  right?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Persistent unit suffix, e.g. ``kW``. Rendered as an affix rather than inside
   * ``placeholder`` so the unit stays visible once the field has a value.
   */
  unit?: string;
  /** Optional trailing note beside the label, e.g. an accepted range. */
  labelHint?: string;
  /** Marks the field as required for assistive technology and adds a visual cue. */
  required?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  rightIcon,
  right,
  containerStyle,
  unit,
  labelHint,
  required,
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

  // A unit affix and a custom `right` adornment would collide in the same slot.
  const rightAdornment =
    right ?? (unit ? <TextInput.Affix text={unit} textStyle={styles.unitAffix} /> : undefined);

  const composedLabel = [label, required ? '(required)' : null, unit ? `in ${unit}` : null]
    .filter(Boolean)
    .join(' ');
  const accessibilityLabel = props.accessibilityLabel ?? (composedLabel || undefined);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {required ? <Text style={styles.requiredMark}> *</Text> : null}
          </Text>
          {labelHint ? <Text style={styles.labelHint}>{labelHint}</Text> : null}
        </View>
      ) : null}
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        {icon && <View style={styles.leftIcon}>{icon}</View>}
        <TextInput
          mode="outlined"
          editable={editable}
          accessibilityLabel={accessibilityLabel}
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          right={rightAdornment}
          style={[
            styles.input,
            { opacity: editable ? 1 : 0.5 },
            style,
          ]}
          activeOutlineColor={colors.primary}
          outlineColor={error ? colors.danger : '#E5E7EB'}
        />
        {rightIcon && !rightAdornment ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
      </View>
      {helperText && (
        <Text
          accessibilityLiveRegion={error ? 'polite' : 'none'}
          style={[styles.helperText, error && styles.helperTextError]}
        >
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.text,
    flexShrink: 1,
  },
  labelHint: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  requiredMark: {
    color: colors.danger,
  },
  unitAffix: {
    ...typography.labelSmall,
    color: colors.muted,
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


