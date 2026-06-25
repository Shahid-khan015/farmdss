import type { SoilTexture, SoilHardness } from '../constants/enums';

export type RecommendedSoilParameters = {
  coneIndex: number;
  depth: number;
  speed: number;
};

/**
 * Returns recommended cone index (kPa), working depth (cm) and speed (km/h)
 * for a given combination of soil texture and hardness.
 *
 * Heuristic is based on typical ranges from tillage engineering:
 * - Finer textures and harder conditions → higher cone index.
 * - Harder soils → shallower depth and lower speed.
 * - Softer/tilled soils → deeper depth and higher speed.
 */
export function getRecommendedSoilParameters(
  texture: SoilTexture,
  hardness: SoilHardness,
): RecommendedSoilParameters {
  const textureFactor: Record<SoilTexture, number> = {
    Fine: 1.2,
    Medium: 1.0,
    Coarse: 0.8,
  };

  const hardnessBaseConeIndex: Record<SoilHardness, number> = {
    Hard: 2000,
    Firm: 1500,
    Tilled: 900,
    Soft: 600,
  };

  const hardnessDepth: Record<SoilHardness, number> = {
    Hard: 12,
    Firm: 18,
    Tilled: 22,
    Soft: 26,
  };

  const hardnessSpeed: Record<SoilHardness, number> = {
    Hard: 3.0,
    Firm: 4.5,
    Tilled: 5.5,
    Soft: 6.0,
  };

  const baseCone = hardnessBaseConeIndex[hardness] ?? 1200;
  const factor = textureFactor[texture] ?? 1.0;

  // Clamp cone index to typical draft model range.
  const coneIndex = clampNumber(baseCone * factor, 200, 2500);
  const depth = clampNumber(hardnessDepth[hardness] ?? 18, 5, 30);
  const speed = clampNumber(hardnessSpeed[hardness] ?? 5, 2, 10);

  return { coneIndex, depth, speed };
}

/**
 * Ensures a number stays within the specified range.
 */
export function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Returns a list of recommended cone index options for a given soil texture.
 */
export function getRecommendedConeIndexOptions(texture: SoilTexture) {
  switch (texture) {
    case 'Fine':
      return [
        { label: '1700 kPa', value: '1700' },
        { label: '1800 kPa', value: '1800' },
        { label: '1900 kPa', value: '1900' },
        { label: '2000 kPa', value: '2000' },
      ];
    case 'Medium':
      return [
        { label: '1100 kPa', value: '1100' },
        { label: '1200 kPa', value: '1200' },
        { label: '1300 kPa', value: '1300' },
        { label: '1400 kPa', value: '1400' },
        { label: '1500 kPa', value: '1500' },
      ];
    case 'Coarse':
      return [
        { label: '700 kPa', value: '700' },
        { label: '800 kPa', value: '800' },
        { label: '900 kPa', value: '900' },
        { label: '1000 kPa', value: '1000' },
      ];
    default:
      return [];
  }
}

