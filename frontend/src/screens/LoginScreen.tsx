import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import {
  AuthField,
  AuthInlineBanner,
  AuthScreenLayout,
} from '../components/auth';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import type { AuthStackParamList } from '../navigation/types';
import { spacing, typography } from '../theme';
import { normalizeIndianPhone, stripIndianCountryCode } from '../utils/authPhone';

const AUTH_GREEN = '#1E6B3C';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
type LoginRoute = RouteProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<LoginRoute>();
  const { login } = useAuth();
  const [phone, setPhone] = useState(stripIndianCountryCode(route.params?.phone));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    route.params?.successMessage ?? null
  );

  React.useEffect(() => {
    setPhone(stripIndianCountryCode(route.params?.phone));
    setSuccessMessage(route.params?.successMessage ?? null);
  }, [route.params?.phone, route.params?.successMessage]);

  const onSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    const phoneNumber = normalizeIndianPhone(phone);
    if (!phoneNumber || !password) {
      setError('Enter phone number and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ phone_number: phoneNumber, password });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      variant="split"
      title="Welcome back"
      subtitle="Sign in to Farm DSS"
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerPrompt}>Don&apos;t have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Register')} hitSlop={12}>
            <Text style={styles.footerLink}>Register</Text>
          </Pressable>
        </View>
      }
    >
      {successMessage ? <AuthInlineBanner message={successMessage} tone="success" /> : null}
      {error ? <AuthInlineBanner message={error} /> : null}

      <AuthField
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        prefix="+91"
        placeholder="9876543210"
      />

      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        autoComplete="password"
      />

      <Button
        onPress={onSubmit}
        loading={loading}
        fullWidth
        size="lg"
        style={styles.signInButton}
        accessibilityLabel="Sign in"
      >
        Sign in
      </Button>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  signInButton: {
    backgroundColor: AUTH_GREEN,
    borderRadius: 16,
    minHeight: 56,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerPrompt: {
    ...typography.body,
    color: '#475467',
  },
  footerLink: {
    ...typography.body,
    color: AUTH_GREEN,
    fontWeight: '700',
  },
});
