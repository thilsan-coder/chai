import { apiRequest } from './api';
import type { Combo, ComboSummary, CreateComboPayload } from '../types/combo';

export const comboService = {
  /**
   * Get all promotional combos with bundled items
   */
  async getCombos(activeOnly: boolean = false): Promise<{ combos: Combo[]; summary: ComboSummary }> {
    const qs = activeOnly ? '?active_only=1' : '';
    const res = await apiRequest<{
      success: boolean;
      data: Combo[];
      summary: ComboSummary;
    }>(`/combos${qs}`);

    return {
      combos: res.data,
      summary: res.summary,
    };
  },

  /**
   * Get single combo details
   */
  async getCombo(id: number): Promise<Combo> {
    const res = await apiRequest<{ success: boolean; data: Combo }>(`/combos/${id}`);
    return res.data;
  },

  /**
   * Create new combo bundle
   */
  async createCombo(data: CreateComboPayload): Promise<Combo> {
    const res = await apiRequest<{ success: boolean; message: string; data: Combo }>(
      '/combos',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Update combo bundle
   */
  async updateCombo(id: number, data: Partial<CreateComboPayload>): Promise<Combo> {
    const res = await apiRequest<{ success: boolean; message: string; data: Combo }>(
      `/combos/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Fast toggle active / inactive status
   */
  async toggleStatus(id: number): Promise<Combo> {
    const res = await apiRequest<{ success: boolean; message: string; data: Combo }>(
      `/combos/${id}/toggle-status`,
      {
        method: 'POST',
      }
    );
    return res.data;
  },

  /**
   * Delete combo
   */
  async deleteCombo(id: number): Promise<void> {
    await apiRequest<{ success: boolean; message: string }>(`/combos/${id}`, {
      method: 'DELETE',
    });
  },
};
