import { apiRequest } from './api';
import type { CafeTable, FloorSection, TableStatus, TableSummary } from '../types/table';

export const tableService = {
  /**
   * Get all cafe tables with active running orders and floor summary
   */
  async getTables(params?: {
    section?: FloorSection;
    status?: TableStatus;
  }): Promise<{ tables: CafeTable[]; summary: TableSummary }> {
    const query = new URLSearchParams();
    if (params?.section) query.append('section', params.section);
    if (params?.status) query.append('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: CafeTable[];
      summary: TableSummary;
    }>(`/tables${qs}`);

    return {
      tables: res.data,
      summary: res.summary,
    };
  },

  /**
   * Update table details or manual status
   */
  async updateTable(id: number, data: Partial<CafeTable>): Promise<CafeTable> {
    const res = await apiRequest<{ success: boolean; message: string; data: CafeTable }>(
      `/tables/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Transfer running order from Table A to Table B
   */
  async transferOrder(
    sourceTableId: number,
    destinationTableId: number
  ): Promise<{ source_table: CafeTable; destination_table: CafeTable }> {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: { source_table: CafeTable; destination_table: CafeTable };
    }>(`/tables/${sourceTableId}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ destination_table_id: destinationTableId }),
    });
    return res.data;
  },

  /**
   * Mark table as clean & available
   */
  async releaseTable(id: number): Promise<CafeTable> {
    const res = await apiRequest<{ success: boolean; message: string; data: CafeTable }>(
      `/tables/${id}/release`,
      {
        method: 'POST',
      }
    );
    return res.data;
  },
};
