export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id?: number;
  product_id?: number;
  name: string;
  price: number;
  is_default?: boolean;
  is_available?: boolean;
  sort_order?: number;
}

export interface ProductAddon {
  id?: number;
  product_id?: number;
  name: string;
  price: number;
  is_available?: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  base_price: number;
  cost_price?: number | null;
  image_url?: string | null;
  is_available: boolean;
  is_featured: boolean;
  preparation_time_minutes: number;
  sort_order: number;
  category?: Category;
  variants?: ProductVariant[];
  addons?: ProductAddon[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormData {
  category_id: number;
  name: string;
  description?: string;
  base_price: number;
  cost_price?: number;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  preparation_time_minutes: number;
  variants: Array<{ id?: number; name: string; price: number; is_default: boolean }>;
  addons: Array<{ id?: number; name: string; price: number }>;
}
