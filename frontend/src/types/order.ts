export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'partially_paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'qr' | 'split';

export interface OrderAddon {
  id?: number;
  name: string;
  price: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  product_name: string;
  variant_id?: number;
  variant_name?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  addons?: OrderAddon[];
  notes?: string;
}

export interface Order {
  id: number;
  order_number: string;
  token_number: number;
  order_type: OrderType;
  table_number?: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  points_earned?: number;
  points_redeemed?: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amount_tendered?: number;
  change_due?: number;
  notes?: string;
  user_id?: number;
  user?: {
    id: number;
    name: string;
  };
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  cartItemId: string;
  productId: number;
  productName: string;
  categoryName?: string;
  variantId?: number;
  variantName?: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  addons: OrderAddon[];
  notes?: string;
}

export interface CreateOrderPayload {
  order_type: OrderType;
  table_number?: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  points_redeemed?: number;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  amount_tendered?: number;
  change_due?: number;
  notes?: string;
  items: {
    product_id?: number;
    product_name: string;
    variant_id?: number;
    variant_name?: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    addons?: OrderAddon[];
    notes?: string;
  }[];
}

export interface DailySummary {
  date: string;
  total_orders: number;
  total_sales_lkr: number;
  pending: number;
  preparing: number;
  ready: number;
  completed: number;
  last_token: number;
}
