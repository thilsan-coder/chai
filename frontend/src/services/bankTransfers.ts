import { apiRequest } from './api';
import type { Order } from '../types/order';
import type { BankTransferSummary, VerificationStatus } from '../types/bankTransfer';

export const bankTransferService = {
  /**
   * Get all bank transfer orders with summary metrics
   */
  async getTransfers(status: VerificationStatus | 'all' = 'all'): Promise<{
    orders: Order[];
    summary: BankTransferSummary;
  }> {
    const qs = status !== 'all' ? `?status=${status}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: Order[];
      summary: BankTransferSummary;
    }>(`/bank-transfers${qs}`);

    return {
      orders: res.data,
      summary: res.summary,
    };
  },

  /**
   * Approve and verify bank transfer slip
   */
  async verifyTransfer(orderId: number, notes?: string): Promise<Order> {
    const res = await apiRequest<{ success: boolean; message: string; data: Order }>(
      `/bank-transfers/${orderId}/verify`,
      {
        method: 'POST',
        body: JSON.stringify({ notes }),
      }
    );
    return res.data;
  },

  /**
   * Reject bank transfer slip
   */
  async rejectTransfer(orderId: number, reason: string): Promise<Order> {
    const res = await apiRequest<{ success: boolean; message: string; data: Order }>(
      `/bank-transfers/${orderId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
    return res.data;
  },

  /**
   * Update reference number or bank name
   */
  async updateReference(
    orderId: number,
    data: { bank_name?: string; bank_reference?: string }
  ): Promise<Order> {
    const res = await apiRequest<{ success: boolean; message: string; data: Order }>(
      `/bank-transfers/${orderId}/reference`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },
};
