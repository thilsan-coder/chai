import { apiRequest } from './api';
import type { StaffUser, StaffSummary, CreateStaffPayload, UpdateStaffPayload } from '../types/user';

export const userService = {
  /**
   * Fetch all staff members & credentials
   */
  async getUsers(): Promise<{ staff: StaffUser[]; summary: StaffSummary }> {
    const res = await apiRequest<{
      success: boolean;
      data: StaffUser[];
      summary: StaffSummary;
    }>('/users');

    return {
      staff: res.data,
      summary: res.summary,
    };
  },

  /**
   * Register a new staff member with 4-digit PIN
   */
  async createUser(payload: CreateStaffPayload): Promise<StaffUser> {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: StaffUser;
    }>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Update staff details or reset PIN
   */
  async updateUser(id: number, payload: UpdateStaffPayload): Promise<StaffUser> {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: StaffUser;
    }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Toggle staff active status
   */
  async toggleActive(id: number): Promise<StaffUser> {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: StaffUser;
    }>(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
    return res.data;
  },
};
