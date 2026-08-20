import 'react-native-reanimated';
import 'react-native-gesture-handler';

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';

import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { queryClient } from './src/hooks/queryClient';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { lightPalette } from './src/theme/palette';

/**
 * Keep Paper's own theme in step with the app palette so its primitives match.
 *
 * Pinned to light for the same reason as `ThemeProvider` — see the note there. This
 * mapping is what feeds `TextInput`'s text colour, so letting it follow the OS while
 * `common/Input` hardcodes a white field is what produced white-on-white text boxes
 * in the release APK.
 */
function usePaperTheme() {
  const palette = lightPalette;
  const base = MD3LightTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      onPrimary: palette.textOnAccent,
      secondary: palette.primaryMuted,
      tertiary: palette.status.info.base,
      background: palette.bg,
      surface: palette.surface,
      surfaceVariant: palette.surfaceSunken,
      onSurface: palette.textPrimary,
      onSurfaceVariant: palette.textSecondary,
      outline: palette.border,
      error: palette.status.critical.base,
    },
  };
}

function Root() {
  const paperTheme = usePaperTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Root />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
