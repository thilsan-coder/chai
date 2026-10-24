import { apiRequest } from './api';
import type { CreateOrderPayload, DailySummary, Order, OrderStatus, PaymentStatus } from '../types/order';

export const orderService = {
  /**
   * Create a new order (POS checkout)
   */
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await apiRequest<{ success: boolean; message: string; data: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * List orders with optional filters
   */
  async getOrders(params?: {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    search?: string;
    today_only?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{ orders: Order[]; total: number; currentPage: number; lastPage: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.payment_status) query.append('payment_status', params.payment_status);
    if (params?.search) query.append('search', params.search);
    if (params?.today_only) query.append('today_only', '1');
    if (params?.page) query.append('page', params.page.toString());
    if (params?.per_page) query.append('per_page', params.per_page.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: Order[];
      meta: { current_page: number; last_page: number; per_page: number; total: number };
    }>(`/orders${qs}`);

    return {
      orders: res.data,
      total: res.meta.total,
      currentPage: res.meta.current_page,
      lastPage: res.meta.last_page,
    };
  },

  /**
   * Get single order details
   */
  async getOrder(id: number): Promise<Order> {
    const res = await apiRequest<{ success: boolean; data: Order }>(`/orders/${id}`);
    return res.data;
  },

  /**
   * Update order status or payment status
   */
  async updateOrderStatus(
    id: number,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus
  ): Promise<Order> {
    const body: Record<string, string> = {};
    if (status) body.status = status;
    if (paymentStatus) body.payment_status = paymentStatus;

    const res = await apiRequest<{ success: boolean; message: string; data: Order }>(
      `/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );
    return res.data;
  },

  /**
   * Get today's fast statistics for POS header
   */
  async getDailySummary(): Promise<DailySummary> {
    const res = await apiRequest<{ success: boolean; data: DailySummary }>('/orders/daily-summary');
    return res.data;
  },
};
