/** Mirrors backend ``LoginResponse`` / ``UserResponse`` / ``ProfileResponse`` (snake_case JSON). */

export type UserRole = 'farmer' | 'operator' | 'owner' | 'researcher';

export interface ProfileResponse {
  id?: string | null;
  user_id?: string | null;
  farm_name?: string | null;
  farm_location?: string | null;
  total_land_hectares?: string | number | null;
  license_number?: string | null;
  experience_years?: number | null;
  wage_rate_per_hour?: string | number | null;
  wage_rate_per_hectare?: string | number | null;
  specialization?: string | null;
  business_name?: string | null;
  gst_number?: string | null;
  bank_account_number?: string | null;
  ifsc_code?: string | null;
  upi_id?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserResponse {
  id: string;
  phone_number: string;
  name: string;
  email?: string | null;
  role: UserRole | string;
  is_active: boolean;
  profile?: ProfileResponse | null;
  profile_completed?: boolean;
}

export interface FarmerOptionResponse {
  id: string;
  name: string;
  phone_number: string;
  farm_name?: string | null;
  farm_location?: string | null;
  total_land_hectares?: string | number | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface RegisterRequest {
  phone_number: string;
  password: string;
  name: string;
  email?: string | null;
  role: UserRole | string;
  business_name?: string | null;
  gst_number?: string | null;
  license_number?: string | null;
  experience_years?: number | null;
  wage_rate_per_hour?: string | number | null;
  wage_rate_per_hectare?: string | number | null;
  farm_name?: string | null;
  farm_location?: string | null;
  total_land_hectares?: string | number | null;
}
