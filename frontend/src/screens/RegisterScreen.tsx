import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Building2,
  FlaskConical,
  Sprout,
  Tractor,
} from 'lucide-react-native';

import {
  AuthField,
  AuthInlineBanner,
  AuthRoleCard,
  AuthScreenLayout,
  AuthStepIndicator,
} from '../components/auth';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import type { AuthStackParamList } from '../navigation/types';
import type { RegisterRequest, UserRole } from '../types/auth';
import { spacing, typography } from '../theme';
import { normalizeIndianPhone } from '../utils/authPhone';

const AUTH_GREEN = '#1E6B3C';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const ROLE_OPTIONS: Array<{
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'owner',
    label: 'Owner',
    description: 'I own tractors and hire operators',
    icon: <Building2 size={28} color={AUTH_GREEN} strokeWidth={2.2} />,
  },
  {
    value: 'operator',
    label: 'Operator',
    description: 'I operate tractors on fields',
    icon: <Tractor size={28} color={AUTH_GREEN} strokeWidth={2.2} />,
  },
  {
    value: 'farmer',
    label: 'Farmer',
    description: 'I hire machines for my fields',
    icon: <Sprout size={28} color={AUTH_GREEN} strokeWidth={2.2} />,
  },
  {
    value: 'researcher',
    label: 'Researcher',
    description: 'I study farm performance data',
    icon: <FlaskConical size={28} color={AUTH_GREEN} strokeWidth={2.2} />,
  },
];

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register } = useAuth();

  const [step, setStep] = useState<0 | 1>(0);
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [totalLandHectares, setTotalLandHectares] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleSpecificFields = useMemo(() => {
    switch (role) {
      case 'owner':
        return (
          <>
            <AuthField
              label="Business Name"
              value={businessName}
              onChangeText={setBusinessName}
              autoCapitalize="words"
            />
            <AuthField
              label="GST Number"
              value={gstNumber}
              onChangeText={setGstNumber}
              autoCapitalize="characters"
            />
          </>
        );
      case 'operator':
        return (
          <>
            <AuthField
              label="License Number"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              autoCapitalize="characters"
            />
            <AuthField
              label="Experience (Years)"
              value={experienceYears}
              onChangeText={setExperienceYears}
              keyboardType="number-pad"
            />
          </>
        );
      case 'farmer':
        return (
          <>
            <AuthField
              label="Farm Name"
              value={farmName}
              onChangeText={setFarmName}
              autoCapitalize="words"
            />
            <AuthField
              label="Farm Location"
              value={farmLocation}
              onChangeText={setFarmLocation}
              autoCapitalize="words"
            />
            <AuthField
              label="Total Land (Hectares)"
              value={totalLandHectares}
              onChangeText={setTotalLandHectares}
              keyboardType="number-pad"
            />
          </>
        );
      default:
        return null;
    }
  }, [
    role,
    businessName,
    gstNumber,
    licenseNumber,
    experienceYears,
    farmName,
    farmLocation,
    totalLandHectares,
  ]);

  const onNext = () => {
    if (!role) {
      setError('Choose a role to continue.');
      return;
    }
    setError(null);
    setStep(1);
  };

  const onSubmit = async () => {
    setError(null);
    if (!role) {
      setError('Choose a role to continue.');
      setStep(0);
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const normalizedPhone = normalizeIndianPhone(phone);

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!normalizedPhone) {
      setError('Phone number is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const payload: RegisterRequest = {
      name: trimmedName,
      phone_number: normalizedPhone,
      email: trimmedEmail || undefined,
      password,
      role,
    };

    if (role === 'owner') {
      payload.business_name = businessName.trim() || undefined;
      payload.gst_number = gstNumber.trim() || undefined;
    } else if (role === 'operator') {
      payload.license_number = licenseNumber.trim() || undefined;
      payload.experience_years = experienceYears ? Number(experienceYears) : undefined;
    } else if (role === 'farmer') {
      payload.farm_name = farmName.trim() || undefined;
      payload.farm_location = farmLocation.trim() || undefined;
      payload.total_land_hectares = totalLandHectares || undefined;
    }

    setLoading(true);
    try {
      await register(payload);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Login',
            params: {
              phone: normalizedPhone,
              successMessage: 'Account created successfully. Please sign in.',
            },
          },
        ],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout variant="simple" title="" subtitle="">
      <AuthStepIndicator activeIndex={step} />

      {step === 0 ? (
        <>
          <Text style={styles.heading}>Choose your role</Text>
          <Text style={styles.subheading}>Select how you&apos;ll use Farm DSS</Text>

          {error ? <AuthInlineBanner message={error} /> : null}

          <View style={styles.roleGrid}>
            {ROLE_OPTIONS.map((option) => (
              <AuthRoleCard
                key={option.value}
                title={option.label}
                description={option.description}
                icon={option.icon}
                selected={role === option.value}
                onPress={() => {
                  setRole(option.value);
                  setError(null);
                }}
              />
            ))}
          </View>

          <Button
            onPress={onNext}
            fullWidth
            size="lg"
            style={styles.primaryButton}
            accessibilityLabel="Next"
          >
            Next
          </Button>
        </>
      ) : (
        <>
          <Text style={styles.heading}>Your details</Text>
          <Text style={styles.subheading}>Fill in your information</Text>

          {error ? <AuthInlineBanner message={error} /> : null}

          <AuthField
            label="Full Name *"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
          />
          <AuthField
            label="Phone *"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            prefix="+91"
            placeholder="9876543210"
          />
          <AuthField
            label="Email (Optional)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <AuthField
            label="Password *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
          />
          <AuthField
            label="Confirm Password *"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            textContentType="newPassword"
          />

          {roleSpecificFields}

          <View style={styles.actionsRow}>
            <Pressable onPress={() => setStep(0)} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.actionsSpacer} />
            <Button
              onPress={onSubmit}
              loading={loading}
              size="lg"
              style={styles.primaryButton}
              fullWidth={false}
              accessibilityLabel="Create account"
            >
              Create Account
            </Button>
          </View>
        </>
      )}

      <View style={styles.signInRow}>
        <Text style={styles.signInPrompt}>Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={12}>
          <Text style={styles.signInLink}>Sign in</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typography.h1,
    color: '#101828',
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.bodyLarge,
    color: '#475467',
    marginBottom: spacing.xl,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: AUTH_GREEN,
    borderRadius: 16,
    minHeight: 56,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  backButton: {
    minWidth: 72,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    ...typography.bodyLarge,
    color: '#101828',
  },
  actionsSpacer: {
    width: spacing.xs,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  signInPrompt: {
    ...typography.body,
    color: '#475467',
  },
  signInLink: {
    ...typography.body,
    color: AUTH_GREEN,
    fontWeight: '700',
  },
});
