export type ExpenseCategory =
  | 'gas_cylinder'
  | 'market_produce'
  | 'packaging'
  | 'utilities'
  | 'maintenance'
  | 'staff_welfare'
  | 'rent_rates'
  | 'cleaning_misc';

export type ExpensePaymentMethod = 'cash' | 'petty_cash' | 'bank_transfer' | 'card';

export interface Expense {
  id: number;
  expense_number: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  payment_method: ExpensePaymentMethod;
  paid_to?: string;
  receipt_number?: string;
  expense_date: string;
  business_date: string;
  notes?: string;
  user_id?: number;
  user?: {
    id: number;
    name: string;
    role: string;
  };
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryBreakdown {
  key: ExpenseCategory;
  label: string;
  total_lkr: number;
  count: number;
}

export interface ExpenseSummary {
  total_expenses_lkr: number;
  today_expenses_lkr: number;
  cash_petty_expenses_lkr: number;
  bank_expenses_lkr: number;
  total_count: number;
  filtered_total_lkr: number;
  category_breakdown: CategoryBreakdown[];
}

export interface ExpenseListResponse {
  success: boolean;
  data: Expense[];
  summary: ExpenseSummary;
}

export interface CreateExpensePayload {
  category: ExpenseCategory;
  title: string;
  amount: number;
  payment_method: ExpensePaymentMethod;
  paid_to?: string;
  receipt_number?: string;
  expense_date?: string;
  notes?: string;
}
