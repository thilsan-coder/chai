import type { Order } from './order';

export type KdsStation = 'all' | 'drinks' | 'food';

export interface KdsStats {
  active_queue: number;
  pending: number;
  preparing: number;
  ready: number;
  completed: number;
  avg_prep_time_minutes: number;
}

export interface KdsOrder extends Order {
  elapsedSeconds?: number;
}
