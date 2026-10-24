import { apiRequest } from './api';
import type {
  Expense,
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseSummary,
  CreateExpensePayload,
} from '../types/expense';

export const expenseService = {
  /**
   * Get all expenses with summary metrics
   */
  async getExpenses(params?: {
    category?: ExpenseCategory;
    payment_method?: ExpensePaymentMethod;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }): Promise<{ expenses: Expense[]; summary: ExpenseSummary }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.payment_method) query.append('payment_method', params.payment_method);
    if (params?.date) query.append('date', params.date);
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{
      success: boolean;
      data: Expense[];
      summary: ExpenseSummary;
    }>(`/expenses${qs}`);

    return {
      expenses: res.data,
      summary: res.summary,
    };
  },

  /**
   * Get single expense
   */
  async getExpense(id: number): Promise<Expense> {
    const res = await apiRequest<{ success: boolean; data: Expense }>(`/expenses/${id}`);
    return res.data;
  },

  /**
   * Record new expense
   */
  async createExpense(data: CreateExpensePayload): Promise<Expense> {
    const res = await apiRequest<{ success: boolean; message: string; data: Expense }>(
      '/expenses',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Update expense details
   */
  async updateExpense(id: number, data: Partial<CreateExpensePayload>): Promise<Expense> {
    const res = await apiRequest<{ success: boolean; message: string; data: Expense }>(
      `/expenses/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Delete expense record
   */
  async deleteExpense(id: number): Promise<void> {
    await apiRequest<{ success: boolean; message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};
