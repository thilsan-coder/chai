import { apiRequest } from './api';
import type {
  Customer,
  CustomerSummary,
  CustomerTier,
  CreateCustomerPayload,
  AdjustPointsPayload,
} from '../types/customer';

export const customerService = {
  /**
   * Get all active customers with summary
   */
  async getCustomers(params?: {
    tier?: CustomerTier;
    search?: string;
  }): Promise<{ customers: Customer[]; summary: CustomerSummary }> {
    const query = new URLSearchParams();
    if (params?.tier) query.append('tier', params.tier);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: Customer[];
      summary: CustomerSummary;
    }>(`/customers${qs}`);

    return {
      customers: res.data,
      summary: res.summary,
    };
  },

  /**
   * Fast phone lookup for POS billing
   */
  async lookup(phone: string): Promise<Customer | null> {
    if (!phone || phone.trim().length < 3) return null;
    const res = await apiRequest<{
      success: boolean;
      found: boolean;
      data: Customer | null;
    }>(`/customers/lookup?phone=${encodeURIComponent(phone.trim())}`);

    return res.found ? res.data : null;
  },

  /**
   * Get single customer with order history
   */
  async getCustomer(id: number): Promise<Customer> {
    const res = await apiRequest<{ success: boolean; data: Customer }>(`/customers/${id}`);
    return res.data;
  },

  /**
   * Create new customer
   */
  async createCustomer(data: CreateCustomerPayload): Promise<Customer> {
    const res = await apiRequest<{ success: boolean; message: string; data: Customer }>(
      '/customers',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Update customer profile
   */
  async updateCustomer(id: number, data: Partial<CreateCustomerPayload>): Promise<Customer> {
    const res = await apiRequest<{ success: boolean; message: string; data: Customer }>(
      `/customers/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Manual points adjustment (Bonus or correction)
   */
  async adjustPoints(id: number, payload: AdjustPointsPayload): Promise<Customer> {
    const res = await apiRequest<{ success: boolean; message: string; data: Customer }>(
      `/customers/${id}/points`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },
};
