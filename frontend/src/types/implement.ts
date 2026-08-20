import type { DiscHarrowConfiguration, ImplementType } from '../constants/enums';

export type Implement = {
  id: string;
  name: string;
  manufacturer?: string | null;
  implement_type: ImplementType;
  width?: number | null;
  weight?: number | null;
  cg_distance_from_hitch?: number | null;
  vertical_horizontal_ratio?: number | null;
  asae_param_a?: number | null;
  asae_param_b?: number | null;
  asae_param_c?: number | null;
  working_width_m?: number | null;
  hitch_type?: string | null;
  preset_speed_kmh?: number | null;
  preset_depth_cm?: number | null;
  preset_gearbox_temp_max_c?: number | null;

  /** Descriptive disc-harrow arrangement; does not affect the calculations. */
  configuration?: DiscHarrowConfiguration | null;

  /** Rotor specs — populated only for ACTIVE (PTO-powered) implement types. */
  rotor_mechanical_resistance?: number | null;
  rotor_efficiency?: number | null;
  rotor_pto_power?: number | null;
  rotor_speed?: number | null;
  rotor_dynamic_vertical_force?: number | null;

  is_library: boolean;
  created_at: string;
  updated_at: string;
};

export type ImplementCreate = Omit<Implement, 'id' | 'created_at' | 'updated_at'>;
export type ImplementUpdate = Partial<Omit<Implement, 'id' | 'created_at' | 'updated_at'>>;
