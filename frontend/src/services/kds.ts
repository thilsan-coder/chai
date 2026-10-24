import { apiRequest } from './api';
import type { Order, OrderStatus } from '../types/order';
import type { KdsStation, KdsStats } from '../types/kds';

export const kdsService = {
  /**
   * Fetch active kitchen tickets filtered by station
   */
  async getOrders(station: KdsStation = 'all'): Promise<Order[]> {
    const query = station !== 'all' ? `?station=${station}` : '';
    const res = await apiRequest<{ success: boolean; data: Order[]; count: number }>(
      `/kds/orders${query}`
    );
    return res.data;
  },

  /**
   * Fast status transition from KDS ticket
   */
  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const res = await apiRequest<{ success: boolean; message: string; data: Order }>(
      `/kds/orders/${orderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    return res.data;
  },

  /**
   * Fetch kitchen queue counts and average preparation speed
   */
  async getStats(): Promise<KdsStats> {
    const res = await apiRequest<{ success: boolean; data: KdsStats }>('/kds/stats');
    return res.data;
  },
};
