import React, { createContext, useContext, useMemo } from 'react';
import { Platform } from 'react-native';
import type { TextStyle } from 'react-native';

import { darkPalette, lightPalette, type Palette, type StatusTone } from './palette';
import { borderRadius, spacing } from './spacing';
import { typography } from './typography';

/**
 * Monospaced, tabular figures for engineering values.
 *
 * `tabular-nums` keeps digits at a fixed advance width so a counting-up value does
 * not shift the layout, and the family is picked per platform ('Menlo' does not
 * exist on Android).
 */
const numericFontFamily = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace',
});

export const numericTextStyle: TextStyle = {
  fontFamily: numericFontFamily,
  fontVariant: ['tabular-nums'],
};

export type Theme = {
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof borderRadius;
  typography: typeof typography;
  /** Elevation presets that adapt to the active scheme. */
  elevation: {
    sm: object;
    md: object;
    lg: object;
  };
  numeric: TextStyle;
  isDark: boolean;
};

function buildElevation(isDark: boolean) {
  // Shadows read as mud on dark surfaces; dark mode leans on borders instead.
  const shadowColor = isDark ? '#000000' : '#0C1A13';
  const opacity = isDark ? 0.4 : 1;
  return {
    sm: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06 * opacity,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1 * opacity,
      shadowRadius: 10,
      elevation: 4,
    },
    lg: {
      shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.14 * opacity,
      shadowRadius: 22,
      elevation: 10,
    },
  };
}

const ThemeContext = createContext<Theme | null>(null);

/**
 * The app is pinned to the light palette; it deliberately does **not** follow the
 * device appearance.
 *
 * Only part of the UI consumes this provider. The rest still imports the static
 * light-only palette in `constants/colors.ts` (~47 files), so following the OS into
 * dark mode applies the dark palette to half the tree and leaves the other half
 * light — e.g. Paper's `TextInput` takes its near-white `onSurface` text colour from
 * the dark palette while `common/Input` keeps its hardcoded `#FFFFFF` field, giving
 * white text on a white box. That is invisible in Expo Go (which supplies a light
 * appearance) and only shows up in a release build on a phone with dark mode on.
 *
 * `app.json` declares `userInterfaceStyle: "light"` for the same reason. Do not
 * reintroduce `useColorScheme()` here until every `constants/colors` consumer has
 * been migrated to `useTheme()`; `darkPalette` is kept for that future work.
 */
const isDark = false;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<Theme>(
    () => ({
      colors: isDark ? darkPalette : lightPalette,
      spacing,
      radius: borderRadius,
      typography,
      elevation: buildElevation(isDark),
      numeric: numericTextStyle,
      isDark,
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used inside <ThemeProvider>.');
  }
  return theme;
}

/** Resolve a status tone to its colour set. */
export function useStatusTone(tone: StatusTone) {
  const { colors } = useTheme();
  return colors.status[tone];
}

export type { StatusTone };
