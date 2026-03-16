import { useEffect, useRef, useState } from 'react';
import type { SoilTexture, SoilHardness } from '../constants/enums';
import { getRecommendedSoilParameters } from '../utils/soilParameters';
import { calculateFieldAreaHa } from '../utils/fieldCalculations';

type AutoFieldKey = 'coneIndex' | 'depth' | 'speed';

type AutoFlags = Record<AutoFieldKey, boolean>;

export type AutoFillValues = {
  coneIndex: string;
  depth: string;
  speed: string;
  fieldLength: string;
  fieldWidth: string;
  fieldArea: string;
};

export type AutoFillMeta = {
  autoFlags: AutoFlags;
  hasAppliedFromSoil: boolean;
  fieldAreaFormula?: string;
};

export type UseAutoFillPresetOptions = {
  soilTexture: SoilTexture | null;
  soilHardness: SoilHardness | null;
  /**
   * Optional initial values to seed the form with.
   */
  initialValues?: Partial<AutoFillValues>;
};

export type UseAutoFillPresetResult = {
  values: AutoFillValues;
  meta: AutoFillMeta;
  handlers: {
    onConeIndexChange: (next: string) => void;
    onDepthChange: (next: string) => void;
    onSpeedChange: (next: string) => void;
    onFieldLengthChange: (next: string) => void;
    onFieldWidthChange: (next: string) => void;
    resetToDefaults: () => void;
  };
};

const DEFAULT_VALUES: AutoFillValues = {
  coneIndex: '1200',
  depth: '15',
  speed: '5',
  fieldArea: '2',
  fieldLength: '200',
  fieldWidth: '100',
};

/**
 * Manages intelligent auto-fill for operating condition fields based on
 * soil texture/hardness and basic geometry for field area.
 */
export function useAutoFillPreset(
  options: UseAutoFillPresetOptions,
): UseAutoFillPresetResult {
  const { soilTexture, soilHardness, initialValues } = options;

  const [values, setValues] = useState<AutoFillValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  const [autoFlags, setAutoFlags] = useState<AutoFlags>({
    coneIndex: true,
    depth: true,
    speed: true,
  });

  const [hasAppliedFromSoil, setHasAppliedFromSoil] = useState(false);
  const [fieldAreaFormula, setFieldAreaFormula] = useState<string | undefined>();

  const prevSoilRef = useRef<{
    texture: SoilTexture | null;
    hardness: SoilHardness | null;
  }>({
    texture: null,
    hardness: null,
  });

  // Auto-fill when soil parameters change and at least one field is still auto.
  useEffect(() => {
    if (!soilTexture || !soilHardness) return;

    const prev = prevSoilRef.current;
    if (prev.texture === soilTexture && prev.hardness === soilHardness) {
      return;
    }

    prevSoilRef.current = { texture: soilTexture, hardness: soilHardness };

    if (!autoFlags.coneIndex && !autoFlags.depth && !autoFlags.speed) {
      return;
    }

    const rec = getRecommendedSoilParameters(soilTexture, soilHardness);

    setValues((current) => ({
      ...current,
      coneIndex: autoFlags.coneIndex
        ? String(Math.round(rec.coneIndex))
        : current.coneIndex,
      depth: autoFlags.depth ? String(rec.depth) : current.depth,
      speed: autoFlags.speed ? rec.speed.toFixed(1) : current.speed,
    }));

    setHasAppliedFromSoil(true);
  }, [soilTexture, soilHardness, autoFlags]);

  // Recalculate field area when dimensions change.
  useEffect(() => {
    const lengthNum = parseFloat(values.fieldLength);
    const widthNum = parseFloat(values.fieldWidth);

    const result = calculateFieldAreaHa(lengthNum, widthNum);
    if (!result) {
      setValues((current) => ({
        ...current,
        fieldArea: '',
      }));
      setFieldAreaFormula(undefined);
      return;
    }

    setValues((current) => ({
      ...current,
      fieldArea: result.formatted,
    }));
    setFieldAreaFormula(
      `${lengthNum} m × ${widthNum} m = ${result.formatted} ha`,
    );
  }, [values.fieldLength, values.fieldWidth]);

  const markManualAndSet = (key: AutoFieldKey, next: string) => {
    setValues((current) => ({
      ...current,
      [key]: next,
    }));
    setAutoFlags((current) => ({
      ...current,
      [key]: false,
    }));
  };

  const onConeIndexChange = (next: string) => {
    markManualAndSet('coneIndex', next);
  };

  const onDepthChange = (next: string) => {
    markManualAndSet('depth', next);
  };

  const onSpeedChange = (next: string) => {
    markManualAndSet('speed', next);
  };

  const onFieldLengthChange = (next: string) => {
    setValues((current) => ({
      ...current,
      fieldLength: next,
    }));
  };

  const onFieldWidthChange = (next: string) => {
    setValues((current) => ({
      ...current,
      fieldWidth: next,
    }));
  };

  const resetToDefaults = () => {
    setAutoFlags({
      coneIndex: true,
      depth: true,
      speed: true,
    });
    setHasAppliedFromSoil(false);
    setFieldAreaFormula(undefined);

    setValues((current) => ({
      ...current,
      ...DEFAULT_VALUES,
    }));
  };

  return {
    values,
    meta: {
      autoFlags,
      hasAppliedFromSoil,
      fieldAreaFormula,
    },
    handlers: {
      onConeIndexChange,
      onDepthChange,
      onSpeedChange,
      onFieldLengthChange,
      onFieldWidthChange,
      resetToDefaults,
    },
  };
}

