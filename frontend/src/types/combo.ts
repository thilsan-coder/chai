import type { Product, ProductVariant } from './menu';

export interface ComboItem {
  id: number;
  combo_id: number;
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  product?: Product;
  variant?: ProductVariant | null;
}

export interface Combo {
  id: number;
  name: string;
  tamil_name?: string | null;
  slug: string;
  description?: string | null;
  regular_price: number;
  combo_price: number;
  savings_amount: number;
  badge?: string | null;
  is_active: boolean;
  is_featured: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  items: ComboItem[];
  created_at: string;
  updated_at: string;
}

export interface ComboSummary {
  total_combos: number;
  active_combos: number;
  max_savings_lkr: number;
  average_discount_lkr: number;
}

export interface ComboListResponse {
  success: boolean;
  data: Combo[];
  summary: ComboSummary;
}

export interface CreateComboPayload {
  name: string;
  tamil_name?: string;
  description?: string;
  regular_price: number;
  combo_price: number;
  badge?: string;
  is_active?: boolean;
  is_featured?: boolean;
  items: {
    product_id: number;
    variant_id?: number | null;
    quantity: number;
  }[];
}
