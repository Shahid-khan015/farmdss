/**
 * Semantic colour tokens for light and dark themes.
 *
 * Screens should consume these through `useTheme()` rather than importing raw hex
 * values, so status meaning stays consistent: `ok` always means "within the DSS
 * recommended band", `caution` means "outside it but usable", `critical` means
 * "the engine flagged this".
 */

export type StatusTone = 'ok' | 'caution' | 'critical' | 'info' | 'neutral';

export type Palette = {
  /** Screen background. */
  bg: string;
  /** Default card/sheet surface. */
  surface: string;
  /** Surface one step above `surface` (nested cards, wells). */
  surfaceRaised: string;
  /** Recessed surface for input wells and code blocks. */
  surfaceSunken: string;
  border: string;
  borderStrong: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  /** Text placed on `primary`/status fills. */
  textOnAccent: string;

  primary: string;
  primaryMuted: string;
  primarySurface: string;

  /** Status fills, borders and text, per tone. */
  status: Record<StatusTone, { base: string; surface: string; text: string; border: string }>;

  /** Categorical series colours for the result visualisations. */
  chart: string[];
  /** Neutral track behind gauges and bars. */
  chartTrack: string;

  /** Scrim for modals/overlays. */
  scrim: string;
};

export const lightPalette: Palette = {
  bg: '#F4F6F4',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSunken: '#EEF1EE',
  border: '#DFE4DF',
  borderStrong: '#C3CBC4',

  textPrimary: '#12211A',
  textSecondary: '#4C5A52',
  textTertiary: '#77857C',
  textOnAccent: '#FFFFFF',

  primary: '#1F6F4A',
  primaryMuted: '#4E9A73',
  primarySurface: '#E4F0E9',

  status: {
    ok: { base: '#1F7A45', surface: '#E3F2E8', text: '#14572F', border: '#A9D5BB' },
    caution: { base: '#A96A05', surface: '#FBF0DC', text: '#7A4C02', border: '#E8CB92' },
    critical: { base: '#B3261E', surface: '#FBE6E4', text: '#7F1A15', border: '#EDB4B0' },
    info: { base: '#1F5F8B', surface: '#E2EEF7', text: '#154663', border: '#A9CBE3' },
    neutral: { base: '#5A665F', surface: '#EEF1EE', text: '#3B453F', border: '#CFD7D1' },
  },

  chart: ['#1F6F4A', '#1F5F8B', '#A96A05', '#7A4FA3', '#0F8A8A', '#B3261E'],
  chartTrack: '#E3E8E4',

  scrim: 'rgba(9, 20, 15, 0.45)',
};

export const darkPalette: Palette = {
  bg: '#0E1512',
  surface: '#16201B',
  surfaceRaised: '#1E2A24',
  surfaceSunken: '#111A15',
  border: '#2A3830',
  borderStrong: '#3C4C43',

  textPrimary: '#E8EFEA',
  textSecondary: '#A9B8AE',
  textTertiary: '#7C8A82',
  textOnAccent: '#08120D',

  primary: '#5FCB92',
  primaryMuted: '#3E9A6C',
  primarySurface: '#16352528',

  status: {
    ok: { base: '#5FCB92', surface: '#142E20', text: '#9FE0BB', border: '#2C5B41' },
    caution: { base: '#E5B25C', surface: '#31260F', text: '#F0CE93', border: '#5E4A1E' },
    critical: { base: '#F2857C', surface: '#3A1815', text: '#F7B3AC', border: '#6B2B26' },
    info: { base: '#6FB3E0', surface: '#12293A', text: '#A6D2EF', border: '#26506B' },
    neutral: { base: '#93A29A', surface: '#1C2620', text: '#B9C6BE', border: '#35443B' },
  },

  chart: ['#5FCB92', '#6FB3E0', '#E5B25C', '#B48BD8', '#4FC5C5', '#F2857C'],
  chartTrack: '#25322B',

  scrim: 'rgba(0, 0, 0, 0.6)',
};
