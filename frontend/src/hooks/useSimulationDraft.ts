/**
 * Wizard state for building a `SimulationRunRequest`.
 *
 * Holds every field as a string (what the inputs produce) and converts to the typed
 * request only at submit time. Nothing here computes engineering values — it decides
 * which fields the chosen DSS mode requires and whether they are filled in.
 */

import { useCallback, useMemo, useReducer } from 'react';

import type {
  SimulationCombinationType,
  SimulationRunRequest,
} from '../types/simulation';
import { KI_RANGE, ROTOR_EFFICIENCY_RANGE, INPUT_RANGES } from '../utils/dssBands';

export type ConditionMode = 'preset' | 'custom';

/**
 * Top level of the reference implement-flow diagram. Purely a UI grouping —
 * `combinationType` remains the wire format ('single' = conventional).
 */
export type TillageClass = 'conventional' | 'combi';

export function tillageClassOf(mode: SimulationCombinationType): TillageClass {
  return mode === 'single' ? 'conventional' : 'combi';
}

export type SimulationDraft = {
  combinationType: SimulationCombinationType;
  tractorId: string;
  implementId: string;
  /** Passive-passive second tool. */
  implement2Id: string;
  /** Active-passive rotor selected from the catalogue (optional). */
  rotorImplementId: string;
  /** ki, as typed. */
  interactionCoefficient: string;

  rotorWeight: string;
  rotorCgDistanceFromHitch: string;
  rotorMechanicalResistance: string;
  rotorEfficiency: string;
  rotorPtoPower: string;
  rotorSpeed: string;
  rotorDynamicVerticalForce: string;

  conditionMode: ConditionMode;
  presetId: string;

  soilTexture: string;
  soilHardness: string;
  coneIndex: string;
  depth: string;
  speed: string;
  fieldLength: string;
  fieldWidth: string;
  fieldArea: string;

  name: string;
  /** Fields whose current value came from the non-DSS soil suggestion table. */
  suggestedFields: string[];
};

const INITIAL: SimulationDraft = {
  combinationType: 'single',
  tractorId: '',
  implementId: '',
  implement2Id: '',
  rotorImplementId: '',
  interactionCoefficient: '0.10',

  rotorWeight: '',
  rotorCgDistanceFromHitch: '',
  rotorMechanicalResistance: '',
  rotorEfficiency: '0.35',
  rotorPtoPower: '',
  rotorSpeed: '540',
  rotorDynamicVerticalForce: '',

  conditionMode: 'custom',
  presetId: '',

  soilTexture: 'Medium',
  soilHardness: 'Firm',
  coneIndex: '',
  depth: '',
  speed: '',
  fieldLength: '',
  fieldWidth: '',
  fieldArea: '',

  name: '',
  suggestedFields: [],
};

type Action =
  | { type: 'set'; field: keyof SimulationDraft; value: string }
  | { type: 'setMode'; value: SimulationCombinationType }
  | { type: 'setConditionMode'; value: ConditionMode }
  | { type: 'applySuggestions'; values: Partial<SimulationDraft>; fields: string[] }
  | { type: 'clearSuggestion'; field: string }
  | { type: 'reset'; seed?: Partial<SimulationDraft> };

function reducer(state: SimulationDraft, action: Action): SimulationDraft {
  switch (action.type) {
    case 'set': {
      const next = { ...state, [action.field]: action.value } as SimulationDraft;
      // Typing over a suggested value makes it the user's own.
      next.suggestedFields = state.suggestedFields.filter((f) => f !== action.field);
      return next;
    }
    case 'setMode': {
      if (action.value === state.combinationType) return state;
      // Drop selections that the new mode cannot use, so a stale tool 2 or a
      // half-typed rotor never leaks into the next request.
      const next: SimulationDraft = { ...state, combinationType: action.value };
      if (action.value !== 'passive_passive') next.implement2Id = '';
      if (action.value !== 'active_passive') {
        next.rotorImplementId = '';
        next.rotorWeight = '';
        next.rotorCgDistanceFromHitch = '';
        next.rotorMechanicalResistance = '';
        next.rotorPtoPower = '';
        next.rotorDynamicVerticalForce = '';
        next.rotorEfficiency = INITIAL.rotorEfficiency;
        next.rotorSpeed = INITIAL.rotorSpeed;
      }
      return next;
    }
    case 'setConditionMode':
      return { ...state, conditionMode: action.value };
    case 'applySuggestions':
      return {
        ...state,
        ...action.values,
        suggestedFields: Array.from(new Set([...state.suggestedFields, ...action.fields])),
      };
    case 'clearSuggestion':
      return { ...state, suggestedFields: state.suggestedFields.filter((f) => f !== action.field) };
    case 'reset':
      return { ...INITIAL, ...action.seed };
    default:
      return state;
  }
}

function num(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/** Per-field problems, keyed by draft field name. */
export type DraftErrors = Partial<Record<keyof SimulationDraft, string>>;

function validateNumber(
  value: string,
  label: string,
  bounds?: { min?: number; max?: number; exclusiveMin?: boolean; unit?: string },
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return `${label} must be a number.`;
  if (!bounds) return null;
  const unit = bounds.unit ? ` ${bounds.unit}` : '';
  if (bounds.exclusiveMin && bounds.min != null && n <= bounds.min) {
    return `${label} must be greater than ${bounds.min}${unit}.`;
  }
  if (!bounds.exclusiveMin && bounds.min != null && n < bounds.min) {
    return `${label} must be at least ${bounds.min}${unit}.`;
  }
  if (bounds.max != null && n > bounds.max) {
    return `${label} must be at most ${bounds.max}${unit}.`;
  }
  return null;
}

export function useSimulationDraft(seed?: Partial<SimulationDraft>) {
  const [draft, dispatch] = useReducer(reducer, { ...INITIAL, ...seed });

  const set = useCallback((field: keyof SimulationDraft, value: string) => {
    dispatch({ type: 'set', field, value });
  }, []);

  const setMode = useCallback((value: SimulationCombinationType) => {
    dispatch({ type: 'setMode', value });
  }, []);

  const setConditionMode = useCallback((value: ConditionMode) => {
    dispatch({ type: 'setConditionMode', value });
  }, []);

  const applySuggestions = useCallback(
    (values: Partial<SimulationDraft>, fields: string[]) => {
      dispatch({ type: 'applySuggestions', values, fields });
    },
    [],
  );

  const reset = useCallback((nextSeed?: Partial<SimulationDraft>) => {
    dispatch({ type: 'reset', seed: nextSeed });
  }, []);

  /** Step 1: mode + equipment. */
  const equipmentErrors = useMemo<DraftErrors>(() => {
    const errors: DraftErrors = {};
    if (!draft.tractorId) errors.tractorId = 'Select a tractor.';
    if (!draft.implementId) errors.implementId = 'Select an implement.';

    if (draft.combinationType === 'passive_passive') {
      if (!draft.implement2Id) {
        errors.implement2Id = 'Select the second tool.';
      } else if (draft.implement2Id === draft.implementId) {
        errors.implement2Id = 'The second tool must be different from the first.';
      }
      errors.interactionCoefficient =
        validateNumber(draft.interactionCoefficient, 'Interaction coefficient', {
          min: KI_RANGE.min,
          max: KI_RANGE.max,
        }) ?? undefined;
    }

    if (draft.combinationType === 'active_passive') {
      if (draft.rotorImplementId) {
        // Specs come from the selected rotor implement; anything typed here is
        // an optional per-run override, so it is range-checked but not required.
        const optional = (value: string, label: string, bounds?: Parameters<typeof validateNumber>[2]) =>
          value.trim() ? validateNumber(value, label, bounds) ?? undefined : undefined;
        errors.rotorEfficiency = optional(draft.rotorEfficiency, 'Rotor efficiency', {
          min: ROTOR_EFFICIENCY_RANGE.min,
          max: ROTOR_EFFICIENCY_RANGE.max,
        });
        errors.rotorPtoPower = optional(draft.rotorPtoPower, 'Rotor PTO power', { min: 0, exclusiveMin: true, unit: 'kW' });
        errors.rotorSpeed = optional(draft.rotorSpeed, 'Rotor speed', { min: 0, exclusiveMin: true, unit: 'rpm' });
        errors.rotorWeight = optional(draft.rotorWeight, 'Rotor weight', { min: 0, exclusiveMin: true, unit: 'kg' });
        errors.rotorCgDistanceFromHitch = optional(draft.rotorCgDistanceFromHitch, 'Rotor CG distance', { min: 0, unit: 'm' });
        errors.rotorMechanicalResistance = optional(draft.rotorMechanicalResistance, 'Rotor mechanical resistance', { min: 0, unit: 'N' });
      } else {
        errors.rotorWeight = validateNumber(draft.rotorWeight, 'Rotor weight', { min: 0, exclusiveMin: true, unit: 'kg' }) ?? undefined;
        errors.rotorCgDistanceFromHitch =
          validateNumber(draft.rotorCgDistanceFromHitch, 'Rotor CG distance', { min: 0, unit: 'm' }) ?? undefined;
        errors.rotorMechanicalResistance =
          validateNumber(draft.rotorMechanicalResistance, 'Rotor mechanical resistance', { min: 0, unit: 'N' }) ?? undefined;
        errors.rotorEfficiency =
          validateNumber(draft.rotorEfficiency, 'Rotor efficiency', {
            min: ROTOR_EFFICIENCY_RANGE.min,
            max: ROTOR_EFFICIENCY_RANGE.max,
          }) ?? undefined;
        errors.rotorPtoPower = validateNumber(draft.rotorPtoPower, 'Rotor PTO power', { min: 0, exclusiveMin: true, unit: 'kW' }) ?? undefined;
        errors.rotorSpeed = validateNumber(draft.rotorSpeed, 'Rotor speed', { min: 0, exclusiveMin: true, unit: 'rpm' }) ?? undefined;
      }
    }

    (Object.keys(errors) as Array<keyof SimulationDraft>).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });
    return errors;
  }, [draft]);

  /** Step 2: operating conditions. */
  const conditionErrors = useMemo<DraftErrors>(() => {
    const errors: DraftErrors = {};
    if (draft.conditionMode === 'preset') {
      if (!draft.presetId) errors.presetId = 'Select a preset.';
      return errors;
    }

    errors.coneIndex =
      validateNumber(draft.coneIndex, 'Cone index', {
        min: INPUT_RANGES.cone_index.min,
        max: INPUT_RANGES.cone_index.max,
        unit: INPUT_RANGES.cone_index.unit,
      }) ?? undefined;
    errors.depth =
      validateNumber(draft.depth, 'Depth', {
        min: INPUT_RANGES.depth.min,
        max: INPUT_RANGES.depth.max,
        unit: INPUT_RANGES.depth.unit,
      }) ?? undefined;
    errors.speed =
      validateNumber(draft.speed, 'Speed', {
        min: INPUT_RANGES.speed.min,
        max: INPUT_RANGES.speed.max,
        unit: INPUT_RANGES.speed.unit,
      }) ?? undefined;
    errors.fieldLength = validateNumber(draft.fieldLength, 'Field length', { min: 0, exclusiveMin: true, unit: 'm' }) ?? undefined;
    errors.fieldWidth = validateNumber(draft.fieldWidth, 'Field width', { min: 0, exclusiveMin: true, unit: 'm' }) ?? undefined;
    errors.fieldArea = validateNumber(draft.fieldArea, 'Field area', { min: 0, exclusiveMin: true, unit: 'ha' }) ?? undefined;

    (Object.keys(errors) as Array<keyof SimulationDraft>).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });
    return errors;
  }, [draft]);

  const stepValid = useMemo(
    () => ({
      equipment: Object.keys(equipmentErrors).length === 0,
      conditions: Object.keys(conditionErrors).length === 0,
    }),
    [equipmentErrors, conditionErrors],
  );

  /**
   * Build the API payload. Returns null when the draft is incomplete, so callers
   * cannot accidentally submit a partial request.
   */
  const buildRequest = useCallback((): SimulationRunRequest | null => {
    if (!stepValid.equipment || !stepValid.conditions) return null;

    const conditions =
      draft.conditionMode === 'preset'
        ? { operating_conditions_preset_id: draft.presetId }
        : {
            cone_index: num(draft.coneIndex),
            depth: num(draft.depth),
            speed: num(draft.speed),
            field_area: num(draft.fieldArea),
            field_length: num(draft.fieldLength),
            field_width: num(draft.fieldWidth),
            soil_texture: draft.soilTexture,
            soil_hardness: draft.soilHardness,
          };

    const base = {
      name: draft.name.trim() || null,
      tractor_id: draft.tractorId,
      implement_id: draft.implementId,
      ...conditions,
    };

    if (draft.combinationType === 'passive_passive') {
      return {
        ...base,
        combination_type: 'passive_passive',
        implement_2_id: draft.implement2Id,
        interaction_coefficient: num(draft.interactionCoefficient) ?? 0,
      };
    }

    if (draft.combinationType === 'active_passive') {
      const dynamicVertical = num(draft.rotorDynamicVerticalForce);

      if (draft.rotorImplementId) {
        // Catalogue rotor: send only the fields the user actually overrode, so
        // the backend falls back to the implement's saved specs for the rest.
        const overrides: Partial<Record<string, number>> = {};
        const maybe = (field: string, value: string) => {
          const n = num(value);
          if (n !== null) overrides[field] = n;
        };
        maybe('rotor_weight', draft.rotorWeight);
        maybe('rotor_cg_distance_from_hitch', draft.rotorCgDistanceFromHitch);
        maybe('rotor_mechanical_resistance', draft.rotorMechanicalResistance);
        maybe('rotor_efficiency', draft.rotorEfficiency);
        maybe('rotor_pto_power', draft.rotorPtoPower);
        maybe('rotor_speed', draft.rotorSpeed);
        if (dynamicVertical !== null) overrides.rotor_dynamic_vertical_force = dynamicVertical;

        return {
          ...base,
          combination_type: 'active_passive',
          implement_2_id: draft.rotorImplementId,
          ...overrides,
        };
      }

      return {
        ...base,
        combination_type: 'active_passive',
        rotor_weight: num(draft.rotorWeight) ?? 0,
        rotor_cg_distance_from_hitch: num(draft.rotorCgDistanceFromHitch) ?? 0,
        rotor_mechanical_resistance: num(draft.rotorMechanicalResistance) ?? 0,
        rotor_efficiency: num(draft.rotorEfficiency) ?? 0,
        rotor_pto_power: num(draft.rotorPtoPower) ?? 0,
        rotor_speed: num(draft.rotorSpeed) ?? 0,
        ...(dynamicVertical !== null ? { rotor_dynamic_vertical_force: dynamicVertical } : {}),
      };
    }

    return { ...base, combination_type: 'single' };
  }, [draft, stepValid]);

  const setTillageClass = useCallback(
    (value: TillageClass) => {
      // Conventional has exactly one mode; entering Combi keeps whichever combi
      // sub-mode was last chosen, defaulting to passive-passive.
      if (value === 'conventional') {
        dispatch({ type: 'setMode', value: 'single' });
      } else if (draft.combinationType === 'single') {
        dispatch({ type: 'setMode', value: 'passive_passive' });
      }
    },
    [draft.combinationType],
  );

  return {
    draft,
    set,
    setMode,
    setTillageClass,
    tillageClass: tillageClassOf(draft.combinationType),
    setConditionMode,
    applySuggestions,
    reset,
    equipmentErrors,
    conditionErrors,
    stepValid,
    buildRequest,
  };
}

/**
 * Turn a persisted simulation into a draft seed, for "Re-run" from history.
 *
 * Every stored input is round-tripped so the user can change one variable and
 * run again — which is what makes two runs meaningfully comparable.
 */
export function draftSeedFromSimulation(sim: {
  combination_type?: SimulationCombinationType | null;
  tractor_id?: string | null;
  implement_id?: string | null;
  implement_2_id?: string | null;
  interaction_coefficient?: number | string | null;
  rotor_weight?: number | string | null;
  rotor_cg_distance_from_hitch?: number | string | null;
  rotor_mechanical_resistance?: number | string | null;
  rotor_efficiency?: number | string | null;
  rotor_pto_power?: number | string | null;
  rotor_speed?: number | string | null;
  rotor_dynamic_vertical_force?: number | string | null;
  operating_conditions_preset_id?: string | null;
  cone_index?: number | string | null;
  depth?: number | string | null;
  speed?: number | string | null;
  field_length?: number | string | null;
  field_width?: number | string | null;
  field_area?: number | string | null;
  soil_texture?: string | null;
  soil_hardness?: string | null;
  name?: string | null;
}): Partial<SimulationDraft> {
  const str = (value: number | string | null | undefined): string =>
    value === null || value === undefined ? '' : String(value);

  const mode: SimulationCombinationType = sim.combination_type ?? 'single';
  // implement_2_id is tool 2 for passive-passive, but the rotor for active-passive.
  const isActivePassive = mode === 'active_passive';

  const seed: Partial<SimulationDraft> = {
    combinationType: mode,
    tractorId: sim.tractor_id ?? '',
    implementId: sim.implement_id ?? '',
    implement2Id: isActivePassive ? '' : sim.implement_2_id ?? '',
    rotorImplementId: isActivePassive ? sim.implement_2_id ?? '' : '',
    name: sim.name ? `${sim.name} (re-run)` : '',
    conditionMode: sim.operating_conditions_preset_id ? 'preset' : 'custom',
    presetId: sim.operating_conditions_preset_id ?? '',
    suggestedFields: [],
  };

  if (sim.interaction_coefficient !== null && sim.interaction_coefficient !== undefined) {
    seed.interactionCoefficient = str(sim.interaction_coefficient);
  }
  if (isActivePassive) {
    seed.rotorWeight = str(sim.rotor_weight);
    seed.rotorCgDistanceFromHitch = str(sim.rotor_cg_distance_from_hitch);
    seed.rotorMechanicalResistance = str(sim.rotor_mechanical_resistance);
    seed.rotorPtoPower = str(sim.rotor_pto_power);
    seed.rotorDynamicVerticalForce = str(sim.rotor_dynamic_vertical_force);
    if (sim.rotor_efficiency !== null && sim.rotor_efficiency !== undefined) {
      seed.rotorEfficiency = str(sim.rotor_efficiency);
    }
    if (sim.rotor_speed !== null && sim.rotor_speed !== undefined) {
      seed.rotorSpeed = str(sim.rotor_speed);
    }
  }

  seed.coneIndex = str(sim.cone_index);
  seed.depth = str(sim.depth);
  seed.speed = str(sim.speed);
  seed.fieldLength = str(sim.field_length);
  seed.fieldWidth = str(sim.field_width);
  seed.fieldArea = str(sim.field_area);
  if (sim.soil_texture) seed.soilTexture = sim.soil_texture;
  if (sim.soil_hardness) seed.soilHardness = sim.soil_hardness;

  return seed;
}

/** Human labels for backend field names, used by ErrorState. */
export const BACKEND_FIELD_LABELS: Record<string, string> = {
  speed: 'Operating speed',
  depth: 'Tillage depth',
  cone_index: 'Soil cone index',
  implement_width: 'Implement working width',
  pto_power: 'Tractor PTO power',
  field_area: 'Field area',
  field_length: 'Field length',
  field_width: 'Field width',
  interaction_coefficient: 'Interaction coefficient (ki)',
  implement_2_id: 'Second implement',
  rotor_weight: 'Rotor weight',
  rotor_cg_distance_from_hitch: 'Rotor CG distance from hitch',
  rotor_mechanical_resistance: 'Rotor mechanical resistance',
  rotor_efficiency: 'Rotor efficiency (ηr)',
  rotor_pto_power: 'Rotor PTO power',
  rotor_speed: 'Rotor speed',
  __request__: 'Request',
};

/** Which wizard step owns a given backend field, for error routing. */
export function stepForBackendField(field: string): 0 | 1 {
  const equipmentFields = new Set([
    'implement_2_id',
    'interaction_coefficient',
    'rotor_weight',
    'rotor_cg_distance_from_hitch',
    'rotor_mechanical_resistance',
    'rotor_efficiency',
    'rotor_pto_power',
    'rotor_speed',
    'implement_width',
    'pto_power',
  ]);
  return equipmentFields.has(field) ? 0 : 1;
}
