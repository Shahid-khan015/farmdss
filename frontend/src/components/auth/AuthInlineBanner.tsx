import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { spacing, typography, borderRadius } from '../../theme';

type AuthInlineBannerProps = {
  message: string;
  tone?: 'error' | 'success';
};

export function AuthInlineBanner({
  message,
  tone = 'error',
}: AuthInlineBannerProps) {
  return (
    <View
      style={[
        styles.banner,
        tone === 'error' ? styles.bannerError : styles.bannerSuccess,
      ]}
    >
      <Text
        style={[
          styles.text,
          tone === 'error' ? styles.textError : styles.textSuccess,
        ]}
        accessibilityLiveRegion="polite"
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  bannerError: {
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bannerSuccess: {
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#ABEFC6',
  },
  text: {
    ...typography.bodySmall,
  },
  textError: {
    color: '#B42318',
  },
  textSuccess: {
    color: '#067647',
  },
});
