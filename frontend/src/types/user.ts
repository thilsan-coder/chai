export type StaffRole = 'owner' | 'manager' | 'cashier' | 'kitchen' | 'stock_manager';

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  phone?: string | null;
  pin_code: string;
  is_active: boolean;
  created_at: string;
}

export interface StaffSummary {
  total_staff: number;
  active_staff: number;
  cashier_count: number;
  kitchen_count: number;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  role: StaffRole;
  phone?: string;
  pin_code: string;
  password?: string;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  role?: StaffRole;
  phone?: string;
  pin_code?: string;
  password?: string;
}
