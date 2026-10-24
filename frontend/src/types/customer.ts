import type { Order } from './order';

export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'vip';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  loyalty_points: number;
  total_spent: number;
  total_visits: number;
  tier: CustomerTier;
  notes?: string;
  is_active: boolean;
  orders_count?: number;
  orders?: Order[];
  created_at: string;
  updated_at: string;
}

export interface CustomerSummary {
  total_customers: number;
  total_points_in_circulation: number;
  total_revenue_from_members_lkr: number;
  vip_count: number;
  gold_count: number;
  silver_count: number;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  summary: CustomerSummary;
}

export interface CustomerLookupResponse {
  success: boolean;
  found: boolean;
  data: Customer | null;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface AdjustPointsPayload {
  points_delta: number;
  reason: string;
}
