import { TextStyle } from 'react-native';

export const typography = {
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  } as TextStyle,
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  } as TextStyle,
  h5: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  // Body
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  } as TextStyle,
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  } as TextStyle,

  // Mono (for numbers)
  mono: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    fontFamily: 'Menlo',
  } as TextStyle,
  monoLarge: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    fontFamily: 'Menlo',
  } as TextStyle,

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  } as TextStyle,
  labelSmall: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  } as TextStyle,

  // Uppercase labels
  caption: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,
} as const;
