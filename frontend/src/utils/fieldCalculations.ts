/**
 * Calculates field area in hectares from length and width in metres.
 *
 * Formula:
 *   area_ha = (length_m * width_m) / 10_000
 */
export function calculateFieldAreaHa(
  lengthMeters: number,
  widthMeters: number,
): { areaHa: number; formatted: string } | null {
  if (!Number.isFinite(lengthMeters) || !Number.isFinite(widthMeters)) {
    return null;
  }
  if (lengthMeters <= 0 || widthMeters <= 0) {
    return null;
  }

  const areaHa = (lengthMeters * widthMeters) / 10_000;
  const rounded = Math.round(areaHa * 100) / 100;
  const formatted = rounded.toFixed(2);

  return { areaHa: rounded, formatted };
}

