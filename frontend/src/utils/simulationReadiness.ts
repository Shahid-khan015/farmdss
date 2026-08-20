/**
 * Can this equipment be simulated at all?
 *
 * These checks mirror the backend's own preconditions — the required-field 422s in
 * `routes/simulations.py` and the ranges in `validate_operating_ranges` — so the user
 * finds out at selection time rather than after a failed run.
 *
 * This performs **no engineering calculation**. It only reports whether the record
 * carries the inputs the DSS engine requires.
 */

import { isActiveImplement } from '../constants/enums';
import type { Implement } from '../types/implement';
import type { Tractor } from '../types/tractor';
import { INPUT_RANGES, ROTOR_EFFICIENCY_RANGE } from './dssBands';

export type ReadinessIssue = {
  /** `blocker` guarantees the run fails; `warning` degrades a diagnostic only. */
  severity: 'blocker' | 'warning';
  message: string;
};

export type Readiness = {
  ready: boolean;
  issues: ReadinessIssue[];
};

function isMissing(value: number | null | undefined): boolean {
  return value === null || value === undefined || !Number.isFinite(Number(value));
}

const TRACTOR_REQUIRED: Array<{ key: keyof Tractor; label: string }> = [
  { key: 'pto_power', label: 'PTO power' },
  { key: 'wheelbase', label: 'Wheelbase' },
  { key: 'front_axle_weight', label: 'Front axle weight' },
  { key: 'rear_axle_weight', label: 'Rear axle weight' },
  { key: 'hitch_distance_from_rear', label: 'Hitch distance from rear axle' },
  { key: 'cg_distance_from_rear', label: 'CG distance from rear axle' },
  { key: 'transmission_efficiency', label: 'Transmission efficiency' },
  { key: 'power_reserve', label: 'Power reserve' },
];

/** Tyre geometry the engine needs for the wheel numeric and rolling resistance. */
const TYRE_REQUIRED: Array<{ key: keyof NonNullable<Tractor['tire_specification']>; label: string }> = [
  { key: 'front_overall_diameter', label: 'Front tyre overall diameter' },
  { key: 'front_section_width', label: 'Front tyre section width' },
  { key: 'rear_overall_diameter', label: 'Rear tyre overall diameter' },
  { key: 'rear_section_width', label: 'Rear tyre section width' },
];

export function checkTractorReadiness(tractor: Tractor | null | undefined): Readiness {
  if (!tractor) return { ready: false, issues: [{ severity: 'blocker', message: 'No tractor selected.' }] };

  const issues: ReadinessIssue[] = [];

  for (const { key, label } of TRACTOR_REQUIRED) {
    if (isMissing(tractor[key] as number | null | undefined)) {
      issues.push({ severity: 'blocker', message: `${label} is not set.` });
    }
  }

  const pto = Number(tractor.pto_power);
  if (Number.isFinite(pto) && pto <= INPUT_RANGES.pto_power.min) {
    issues.push({
      severity: 'blocker',
      message: `PTO power must be greater than ${INPUT_RANGES.pto_power.min} ${INPUT_RANGES.pto_power.unit} (this tractor has ${pto}).`,
    });
  }

  const tyres = tractor.tire_specification;
  if (!tyres) {
    issues.push({ severity: 'blocker', message: 'No tyre specification recorded.' });
  } else {
    for (const { key, label } of TYRE_REQUIRED) {
      if (isMissing(tyres[key] as number | null | undefined)) {
        issues.push({ severity: 'blocker', message: `${label} is not set.` });
      }
    }
    // The engine falls back rolling radius -> static loaded radius -> tractor field,
    // so a missing rolling radius is only a problem when every source is absent.
    const hasRearRadius =
      !isMissing(tyres.rear_rolling_radius) ||
      !isMissing(tyres.rear_static_loaded_radius) ||
      !isMissing(tractor.rear_wheel_rolling_radius);
    if (!hasRearRadius) {
      issues.push({ severity: 'blocker', message: 'No rear rolling radius on the tyres or tractor.' });
    }
    const hasFrontRadius =
      !isMissing(tyres.front_rolling_radius) || !isMissing(tyres.front_static_loaded_radius);
    if (!hasFrontRadius) {
      issues.push({ severity: 'blocker', message: 'No front rolling radius on the tyre specification.' });
    }
  }

  if (isMissing(tractor.max_engine_torque)) {
    issues.push({
      severity: 'warning',
      message: 'No maximum engine torque — the engine-torque pull limit (Pet) will not be reported.',
    });
  }

  return { ready: issues.every((i) => i.severity !== 'blocker'), issues };
}

/**
 * Fields a PASSIVE tool needs to run through the DSS draft equation
 * (`_require_implement_fields` in `routes/simulations.py`).
 */
const PASSIVE_IMPLEMENT_REQUIRED: Array<{ key: keyof Implement; label: string }> = [
  { key: 'width', label: 'Working width' },
  { key: 'weight', label: 'Weight' },
  { key: 'cg_distance_from_hitch', label: 'CG distance from hitch' },
  { key: 'asae_param_a', label: 'ASAE parameter A' },
  { key: 'asae_param_b', label: 'ASAE parameter B' },
  { key: 'asae_param_c', label: 'ASAE parameter C' },
];

/**
 * Fields an ACTIVE (PTO-powered) tool needs as the rotor of an active-passive
 * run (`_resolve_rotor_specs`). Deliberately excludes ASAE A/B/C: a powered
 * tool never goes through the passive draft equation, so the backend skips
 * `_require_implement_fields` for it entirely. Requiring them here made every
 * powered implement permanently unselectable in the rotor slot.
 */
const ACTIVE_IMPLEMENT_REQUIRED: Array<{ key: keyof Implement; label: string }> = [
  { key: 'weight', label: 'Weight' },
  { key: 'cg_distance_from_hitch', label: 'CG distance from hitch' },
  { key: 'rotor_mechanical_resistance', label: 'Rotor mechanical resistance' },
  { key: 'rotor_efficiency', label: 'Rotor efficiency' },
  { key: 'rotor_pto_power', label: 'Rotor PTO power' },
  { key: 'rotor_speed', label: 'Rotor speed' },
];

export function checkImplementReadiness(implement: Implement | null | undefined): Readiness {
  if (!implement) {
    return { ready: false, issues: [{ severity: 'blocker', message: 'No implement selected.' }] };
  }

  const issues: ReadinessIssue[] = [];
  const active = isActiveImplement(implement.implement_type);

  for (const { key, label } of active ? ACTIVE_IMPLEMENT_REQUIRED : PASSIVE_IMPLEMENT_REQUIRED) {
    if (isMissing(implement[key] as number | null | undefined)) {
      issues.push({ severity: 'blocker', message: `${label} is not set.` });
    }
  }

  if (active) {
    // Enforced by the schema (`ge=0.25, le=0.45`), so an out-of-band value is a
    // guaranteed 422 rather than something the engine can work with.
    const eta = Number(implement.rotor_efficiency);
    const { min, max } = ROTOR_EFFICIENCY_RANGE;
    if (Number.isFinite(eta) && (eta < min || eta > max)) {
      issues.push({
        severity: 'blocker',
        message: `Rotor efficiency must be between ${min} and ${max} (this implement is ${eta}).`,
      });
    }
  } else {
    // A rotor's working width is not an input to the DSS passive-draft model and
    // the backend does not range-check it, so this applies to passive tools only.
    const width = Number(implement.width);
    const { min, max, unit } = INPUT_RANGES.implement_width;
    if (Number.isFinite(width) && (width < min || width > max)) {
      issues.push({
        severity: 'blocker',
        message: `Working width must be between ${min} and ${max} ${unit} (this implement is ${width} ${unit}).`,
      });
    }
  }

  return { ready: issues.every((i) => i.severity !== 'blocker'), issues };
}

/** Short label for list/detail badges. */
export function readinessLabel(readiness: Readiness): string {
  if (readiness.ready) {
    const warnings = readiness.issues.length;
    return warnings > 0 ? 'Ready · 1 note' : 'Simulation ready';
  }
  const blockers = readiness.issues.filter((i) => i.severity === 'blocker').length;
  return blockers === 1 ? '1 field missing' : `${blockers} fields missing`;
}
