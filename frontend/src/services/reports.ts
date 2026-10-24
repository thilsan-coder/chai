import { apiRequest } from './api';
import type {
  ReportDashboardData,
  DailySessionReport,
  ReportPeriod,
} from '../types/report';

export const reportService = {
  /**
   * Get financial dashboard report & P&L metrics for selected period
   */
  async getDashboard(params?: {
    period?: ReportPeriod;
    start_date?: string;
    end_date?: string;
  }): Promise<ReportDashboardData> {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: ReportDashboardData;
    }>(`/reports/dashboard${qs}`);

    return res.data;
  },

  /**
   * Get history of past 14 business sessions
   */
  async getDailySessions(): Promise<DailySessionReport[]> {
    const res = await apiRequest<{
      success: boolean;
      data: DailySessionReport[];
    }>('/reports/daily-sessions');

    return res.data;
  },
};
