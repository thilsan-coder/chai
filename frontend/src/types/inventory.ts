export type InventoryCategory =
  | 'dairy'
  | 'tea_spices'
  | 'bakery_meats'
  | 'packaging'
  | 'beverages'
  | 'syrups_extras';

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  supplied_categories?: string | null;
  notes?: string | null;
  inventory_items_count?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  code: string;
  category: InventoryCategory;
  unit: string;
  current_stock: number;
  min_stock_alert: number;
  cost_per_unit: number;
  supplier_id?: number | null;
  supplier?: Supplier | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id: number;
  inventory_item_id: number;
  movement_type: 'purchase_in' | 'order_consumption' | 'waste_spoilage' | 'adjustment';
  quantity: number;
  balance_after: number;
  cost_price?: number | null;
  reference?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ProductRecipe {
  id: number;
  product_id: number;
  variant_id?: number | null;
  inventory_item_id: number;
  quantity_required: number;
  inventory_item?: InventoryItem;
  variant?: {
    id: number;
    name: string;
  } | null;
}

export interface InventorySummary {
  total_items: number;
  low_stock_count: number;
  total_valuation_lkr: number;
}
