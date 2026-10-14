export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type OrderType = 'dine-in' | 'takeaway';

export type PaymentMethod = 'cash' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tokenNumber: number;
  type: OrderType;
  tableNumber?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  customerName?: string;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  iconName: string;
}
