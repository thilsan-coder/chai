import type { Order } from './order';

export type FloorSection = 'indoor_ground' | 'outdoor_verandah' | 'balcony_swing' | 'ac_family';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface CafeTable {
  id: number;
  name: string;
  code: string;
  capacity: number;
  floor_section: FloorSection;
  status: TableStatus;
  current_order_id?: number | null;
  current_order?: Order | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface TableSummary {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  seated_capacity: number;
}
