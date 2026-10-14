import { apiRequest } from './api';

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'cashier' | 'kitchen' | 'stock_manager';
  phone?: string;
  is_active: boolean;
}

export interface SystemStatus {
  success: boolean;
  name: string;
  version: string;
  timezone: string;
  server_time: string;
  business_hours: {
    opens: string;
    closes: string;
    is_live: boolean;
  };
  database: {
    connected: boolean;
    name: string;
  };
}

export const authService = {
  async getSystemStatus(): Promise<SystemStatus> {
    return apiRequest<SystemStatus>('/system/status');
  },

  async loginWithEmail(email: string, password: string): Promise<{ token: string; user: StaffUser }> {
    const res = await apiRequest<{ token: string; user: StaffUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { token: res.token, user: res.user };
  },

  async loginWithPin(pin_code: string): Promise<{ token: string; user: StaffUser }> {
    const res = await apiRequest<{ token: string; user: StaffUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin_code }),
    });
    return { token: res.token, user: res.user };
  },

  async getStaffProfile(): Promise<StaffUser> {
    const res = await apiRequest<{ user: StaffUser }>('/auth/me');
    return res.user;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('oonjal_auth_token');
      localStorage.removeItem('oonjal_user');
    }
  },
};
