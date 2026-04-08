import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native-paper';
import { Tractor } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../constants/colors';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing, typography } from '../../theme';

const AUTH_GREEN = '#1E6B3C';

type AuthScreenLayoutProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'simple' | 'split';
};

export function AuthScreenLayout({
  title,
  subtitle,
  children,
  footer,
  variant = 'simple',
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const split = variant === 'split' && isDesktop;

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.shell, split ? styles.shellSplit : styles.shellSimple]}>
            {split ? <IllustrationPanel /> : null}

            <View style={[styles.formPanel, split ? styles.formPanelSplit : styles.formPanelSimple]}>
              <View style={styles.mobileMark}>
                <View style={styles.mobileMarkBadge}>
                  <Tractor color="#FFFFFF" size={22} strokeWidth={2.4} />
                </View>
              </View>

              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

              <View style={styles.content}>{children}</View>
              {footer ? <View style={styles.footer}>{footer}</View> : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function IllustrationPanel() {
  return (
    <LinearGradient
      colors={['#10321E', '#195132', '#1E6B3C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.illustration}
    >
      <View style={styles.illustrationBadge}>
        <Tractor color="#DFF5E6" size={34} strokeWidth={2.2} />
      </View>
      <Text style={styles.illustrationName}>Farm DSS</Text>
      <Text style={styles.illustrationVersion}>Version 1.0.0</Text>
      <Text style={styles.illustrationTagline}>
        Smart farming decisions, powered by sensors
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  shell: {
    alignSelf: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  shellSplit: {
    maxWidth: 1120,
    minHeight: 700,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    shadowColor: '#0D2014',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 10,
  },
  shellSimple: {
    maxWidth: 420,
  },
  illustration: {
    flex: 1,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxl * 2,
    justifyContent: 'center',
  },
  illustrationBadge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  illustrationName: {
    ...typography.h1,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  illustrationVersion: {
    ...typography.label,
    color: '#B9D7C3',
    marginBottom: spacing.xl,
  },
  illustrationTagline: {
    ...typography.h3,
    color: '#EAF6EE',
    maxWidth: 320,
  },
  formPanel: {
    justifyContent: 'center',
  },
  formPanelSplit: {
    flex: 1,
    paddingHorizontal: 56,
    paddingVertical: 64,
  },
  formPanelSimple: {
    paddingVertical: spacing.xxl,
  },
  mobileMark: {
    marginBottom: spacing.xl,
  },
  mobileMarkBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: AUTH_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: '#101828',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.muted,
    marginBottom: spacing.xl,
  },
  content: {
    gap: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
