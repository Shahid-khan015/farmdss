import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Eye, EyeOff } from 'lucide-react-native';

import { spacing, typography, borderRadius } from '../../theme';

const AUTH_GREEN = '#1E6B3C';

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad' | 'email-address';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  textContentType?: any;
  autoComplete?: any;
  prefix?: string;
  disabled?: boolean;
};

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoCorrect = false,
  textContentType,
  autoComplete,
  prefix,
  disabled = false,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.fieldShell}>
        {prefix ? (
          <View style={styles.prefixBox}>
            <Text style={styles.prefixText}>{prefix}</Text>
          </View>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          autoComplete={autoComplete}
          editable={!disabled}
          placeholderTextColor="#98A2B3"
          style={styles.input}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={10}
          >
            {showPassword ? (
              <EyeOff size={18} color="#98A2B3" />
            ) : (
              <Eye size={18} color="#98A2B3" />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: '#344054',
  },
  fieldShell: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  prefixBox: {
    alignSelf: 'stretch',
    minWidth: 52,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#D0D5DD',
    backgroundColor: '#F9FAFB',
  },
  prefixText: {
    ...typography.bodyLarge,
    color: '#101828',
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: '#101828',
    ...typography.bodyLarge,
  },
  eyeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
