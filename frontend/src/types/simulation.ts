/**
 * Mirrors `backend/app/schemas/simulation.py`.
 *
 * The DSS engine is the single source of truth for every number here — nothing in
 * this file is computed client-side. Field names match the API payload exactly so
 * the two can be diffed by eye.
 */

/** DSS simulation modes. `single` = Section 3, `passive_passive` = §4, `active_passive` = §5. */
export type SimulationCombinationType = 'single' | 'passive_passive' | 'active_passive';

export type SimulationStatus = 'Stable' | 'Heavy Load' | 'Unstable' | 'Not Recommended';
export type SimulationConfidence = 'High' | 'Moderate' | 'Low';
/** DSS "Check Put value" table outcomes. */
export type LoadStatus =
  | 'Tractor is properly loaded'
  | 'Tractor is Underloaded'
  | 'Tractor is Overloaded';

/** Operating conditions, supplied inline when no preset is selected. */
export type OperatingConditionFields = {
  cone_index?: number | null;
  depth?: number | null;
  speed?: number | null;
  field_area?: number | null;
  field_length?: number | null;
  field_width?: number | null;
  number_of_turns?: number | null;
  soil_texture?: string | null;
  soil_hardness?: string | null;
};

/** PTO-driven rotor unit (DSS Section 5). All six are required for `active_passive`. */
export type RotorFields = {
  rotor_weight: number;
  rotor_cg_distance_from_hitch: number;
  rotor_mechanical_resistance: number;
  /** eta_r — the document constrains this to 0.25–0.45. */
  rotor_efficiency: number;
  rotor_pto_power: number;
  rotor_speed: number;
  /** Fv — the DSS names it but gives no formula; the engine defaults it to 0. */
  rotor_dynamic_vertical_force?: number | null;
};

type RunRequestBase = {
  name?: string | null;
  tractor_id: string;
  implement_id: string;
  operating_conditions_preset_id?: string | null;
} & OperatingConditionFields;

/**
 * Discriminated on `combination_type` so the compiler enforces the same
 * per-mode requirements as the backend's `validate_preset_or_custom`.
 */
export type SimulationRunRequest =
  | (RunRequestBase & {
      combination_type: 'single';
    })
  | (RunRequestBase & {
      combination_type: 'passive_passive';
      /** Second towed tool. */
      implement_2_id: string;
      /** ki — tool-interaction coefficient, 0.00–0.25. */
      interaction_coefficient: number;
    })
  /**
   * Active + Passive. The rotor is supplied either by selecting a PTO-powered
   * implement from the catalogue (`implement_2_id`, whose saved rotor specs the
   * backend resolves) or by giving all six rotor fields inline. When both are
   * present the inline values override the catalogue record field by field.
   */
  | (RunRequestBase & {
      combination_type: 'active_passive';
      implement_2_id: string;
    } & Partial<RotorFields>)
  | (RunRequestBase & {
      combination_type: 'active_passive';
      implement_2_id?: undefined;
    } & RotorFields);

/**
 * The engine's `results` blob.
 *
 * Every key is optional because the three modes emit different sets, and older
 * persisted simulations predate the newer diagnostics.
 */
export type SimulationResults = {
  // --- Headline ---
  /** N. DTotal for passive-passive, Deff for active-passive. */
  draft_force?: number;
  /** kW */
  drawbar_power?: number;
  /** % */
  slip?: number;
  /** % */
  traction_efficiency?: number;
  /** % */
  power_utilization?: number;
  /** kW */
  required_pto_power?: number;

  // --- Convergence & interpretation (never re-derive these on the client) ---
  /** False when the slip loop hit the 20% cap before developing the required pull. */
  converged?: boolean;
  status?: SimulationStatus | string;
  status_message?: string;
  load_status?: LoadStatus | string;
  confidence?: SimulationConfidence | string;
  warnings?: string[];
  recommendations?: string;
  recommendation_messages?: string[];
  /** Engine build marker, e.g. `dss_spec_v1`, `dss_spec_v1_passive_passive`. */
  calculation_mode?: string;

  // --- Traction detail ---
  /** mu — net traction coefficient. */
  coefficient_net_traction?: number;
  motion_resistance_ratio?: number;
  motion_resistance?: number;
  /** Kwef = Rf/Wt. DSS requires >= 0.20. */
  front_weight_utilization?: number;
  rear_weight_utilization?: number;

  // --- Field capacity ---
  /** ha/h */
  field_capacity_theoretical?: number;
  /** ha/h */
  field_capacity_actual?: number;
  /** %, clamped 50–95 by the engine. */
  field_efficiency?: number;
  /** %, the same ratio before clamping. */
  legacy_field_efficiency_raw?: number;
  /** h */
  total_time_hours?: number;

  // --- Fuel ---
  /** L/kW-h (ASABE 2001). */
  specific_fuel_consumption?: number;
  /** L/ha */
  fuel_consumption_per_hectare?: number;
  /** L/h, on the engine's preserved drawbar-power basis. */
  fuel_l_per_hour?: number;
  /** L/h on a PTO-power basis — diagnostic only, feeds nothing. */
  fuel_l_per_hour_pto_basis?: number;
  /** % */
  overall_efficiency?: number;

  // --- Ballast ---
  /** kg */
  ballast_front_required?: number;
  /** kg */
  ballast_rear_required?: number;

  // --- Engine diagnostics ---
  /** Wheel numeric Bn (Section 3) or Bn' (Section 4), rear/driven wheel. */
  legacy_mobility_number_rear?: number;
  /** Front wheel numeric — always the Section 3 Bn. */
  legacy_mobility_number_front?: number;
  /** mu_g */
  legacy_gross_traction_ratio?: number;
  /** N */
  legacy_front_axle_load_n?: number;
  /** N */
  legacy_rear_axle_load_n?: number;
  /** N. Pet, DSS Eq. 3.4. Null when the tractor has no torque figure. */
  engine_torque_limited_pull?: number | null;
  /** Soil-texture factor F actually used. */
  legacy_fi?: number;
  legacypy_over_d_ratio?: number;
  legacy_turning_time_seconds?: number;
  legacy_number_of_turns?: number;

  // --- Passive-passive (Section 4) ---
  combination_type?: SimulationCombinationType;
  /** N — tool 1 draft before the ki reduction. */
  draft_1?: number;
  /** N — tool 2 draft before the ki reduction. */
  draft_2?: number;
  interaction_coefficient?: number;

  // --- Active-passive (Section 5) ---
  /** N — passive tool draft Dp. */
  draft_passive?: number;
  /** N — rotor mechanical resistance Da. */
  draft_active_mechanical?: number;
  /** N — Ta, forward thrust from the rotor. */
  rotor_thrust?: number;
  /** N-m — MPTO. */
  pto_reaction_moment?: number;
  /** N — Weq = MPTO/L. */
  pto_equivalent_rear_load?: number;
  /** kW */
  rotor_pto_power?: number;
  /** kW — Pr, diagnostic. */
  rotor_mechanical_power?: number;
  /** N — Fr, diagnostic. */
  rotor_equivalent_force?: number;
  /** Xeff = (Ptr + PPTO)/Pt. */
  pto_power_fraction_effective?: number;
};

/** A persisted simulation as returned by the API. */
export type Simulation = {
  id: string;
  name?: string | null;
  tractor_id: string;
  implement_id: string;
  operating_conditions_preset_id?: string | null;

  combination_type: SimulationCombinationType;
  implement_2_id?: string | null;
  interaction_coefficient?: number | null;
  rotor_weight?: number | null;
  rotor_cg_distance_from_hitch?: number | null;
  rotor_mechanical_resistance?: number | null;
  rotor_efficiency?: number | null;
  rotor_pto_power?: number | null;
  rotor_speed?: number | null;
  rotor_dynamic_vertical_force?: number | null;

  cone_index?: number | null;
  depth?: number | null;
  speed?: number | null;
  field_area?: number | null;
  field_length?: number | null;
  field_width?: number | null;
  number_of_turns?: number | null;
  soil_texture?: string | null;
  soil_hardness?: string | null;

  results?: SimulationResults | null;

  // Promoted columns — duplicated from `results` by the backend for querying.
  draft_force?: number | null;
  drawbar_power?: number | null;
  slip?: number | null;
  traction_efficiency?: number | null;
  power_utilization?: number | null;
  field_capacity_theoretical?: number | null;
  field_capacity_actual?: number | null;
  field_efficiency?: number | null;
  fuel_consumption_per_hectare?: number | null;
  overall_efficiency?: number | null;
  ballast_front_required?: number | null;
  ballast_rear_required?: number | null;
  status_message?: string | null;
  recommendations?: string | null;
  status?: SimulationStatus | string | null;
  warnings?: string[] | null;
  confidence?: SimulationConfidence | string | null;
  recommendation_messages?: string[] | null;

  created_at: string;
  updated_at: string;
};

/** Labels and one-line explanations for each mode, used by the mode selector. */
export const COMBINATION_TYPE_META: Record<
  SimulationCombinationType,
  { label: string; short: string; description: string }
> = {
  single: {
    label: 'Single implement',
    short: 'Single',
    description: 'One conventional tillage tool pulled by the tractor.',
  },
  passive_passive: {
    label: 'Passive + passive',
    short: 'Passive pair',
    description:
      'Two towed tools on one toolbar. Their combined draft is reduced by the interaction coefficient.',
  },
  active_passive: {
    label: 'Active + passive',
    short: 'Active rotor',
    description:
      'A towed tool plus a PTO-driven rotor, whose forward thrust reduces the draft the tractor must pull.',
  },
};

/** True when the engine reported a converged solution. Absent = treat as unknown, not success. */
export function isConverged(results: SimulationResults | null | undefined): boolean | null {
  if (!results || results.converged === undefined) return null;
  return results.converged;
}
