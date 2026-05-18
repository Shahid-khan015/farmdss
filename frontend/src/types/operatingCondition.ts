import type { SoilHardness, SoilTexture } from '../constants/enums';

export type OperatingConditionPreset = {
  id: string;
  name: string;
  soil_texture: SoilTexture;
  soil_hardness: SoilHardness;
  cone_index?: number | null;
  depth?: number | null;
  speed?: number | null;
  field_area?: number | null;
  field_length?: number | null;
  field_width?: number | null;
  number_of_turns?: number | null;
  created_at: string;
  updated_at: string;
};

