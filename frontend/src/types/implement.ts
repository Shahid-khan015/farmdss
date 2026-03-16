import type { ImplementType } from '../constants/enums';

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
  is_library: boolean;
  created_at: string;
  updated_at: string;
};

export type ImplementCreate = Omit<Implement, 'id' | 'created_at' | 'updated_at'>;
export type ImplementUpdate = Partial<Omit<Implement, 'id' | 'created_at' | 'updated_at'>>;

