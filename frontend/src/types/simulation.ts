export type Simulation = {
  id: string;
  name?: string | null;
  tractor_id: string;
  implement_id: string;
  operating_conditions_preset_id?: string | null;

  cone_index?: number | null;
  depth?: number | null;
  speed?: number | null;
  field_area?: number | null;
  field_length?: number | null;
  field_width?: number | null;
  number_of_turns?: number | null;
  soil_texture?: string | null;
  soil_hardness?: string | null;

  results?: Record<string, any> | null;

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

  created_at: string;
  updated_at: string;
};

export type SimulationRunRequest = {
  name?: string | null;
  tractor_id: string;
  implement_id: string;
  operating_conditions_preset_id?: string | null;

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

