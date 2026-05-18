import type { DriveMode, TireType } from '../constants/enums';

export type TireSpecification = {
  id: string;
  tractor_id: string;
  tire_type: TireType;
  front_overall_diameter?: number | null;
  front_section_width?: number | null;
  front_static_loaded_radius?: number | null;
  front_rolling_radius?: number | null;
  rear_overall_diameter?: number | null;
  rear_section_width?: number | null;
  rear_static_loaded_radius?: number | null;
  rear_rolling_radius?: number | null;
  created_at: string;
  updated_at: string;
};

export type Tractor = {
  id: string;
  name: string;
  manufacturer?: string | null;
  model: string;
  pto_power?: number | null;
  rated_engine_speed?: number | null;
  max_engine_torque?: number | null;
  wheelbase?: number | null;
  front_axle_weight?: number | null;
  rear_axle_weight?: number | null;
  hitch_distance_from_rear?: number | null;
  cg_distance_from_rear?: number | null;
  rear_wheel_rolling_radius?: number | null;
  drive_mode: DriveMode;
  transmission_efficiency?: number | null;
  power_reserve?: number | null;
  is_library: boolean;
  tire_specification?: TireSpecification | null;
  created_at: string;
  updated_at: string;
};

export type TractorCreate = Omit<Tractor, 'id' | 'created_at' | 'updated_at' | 'tire_specification'> & {
  tire_specification?: Omit<TireSpecification, 'id' | 'tractor_id' | 'created_at' | 'updated_at'> | null;
};

export type TractorUpdate = Partial<
  Omit<Tractor, 'id' | 'created_at' | 'updated_at' | 'tire_specification'>
>;

