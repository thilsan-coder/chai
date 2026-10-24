export type ReportPeriod = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export interface PeriodInfo {
  period: ReportPeriod;
  label: string;
  start: string;
  end: string;
  business_date: string;
}

export interface FinancialSummary {
  gross_sales_lkr: number;
  total_discount_lkr: number;
  net_sales_lkr: number;
  total_expenses_lkr: number;
  estimated_gross_profit_lkr: number;
  profit_margin_percent: number;
}

export interface PaymentBreakdown {
  cash_sales_lkr: number;
  cash_orders_count: number;
  card_sales_lkr: number;
  card_orders_count: number;
  bank_sales_lkr: number;
  bank_orders_count: number;
  qr_sales_lkr: number;
  qr_orders_count: number;
}

export interface CashReconciliation {
  cash_sales_collected_lkr: number;
  cash_expenses_paid_lkr: number;
  expected_cash_in_till_lkr: number;
}

export interface OrderMetrics {
  total_orders: number;
  completed_orders: number;
  dine_in_count: number;
  takeaway_count: number;
  average_order_value_lkr: number;
}

export interface BestsellingItem {
  name: string;
  quantity: number;
  revenue_lkr: number;
}

export interface HourlyDistribution {
  hour_num: number;
  hour_label: string;
  orders_count: number;
  sales_lkr: number;
}

export interface ExpenseCategoryReport {
  category: string;
  total_lkr: number;
  count: number;
}

export interface ReportDashboardData {
  period_info: PeriodInfo;
  financial_summary: FinancialSummary;
  payment_breakdown: PaymentBreakdown;
  cash_reconciliation: CashReconciliation;
  order_metrics: OrderMetrics;
  bestselling_items: BestsellingItem[];
  hourly_distribution: HourlyDistribution[];
  expense_categories: ExpenseCategoryReport[];
}

export interface DailySessionReport {
  business_date: string;
  formatted_date: string;
  total_orders: number;
  net_sales_lkr: number;
  total_expenses_lkr: number;
  net_profit_lkr: number;
  cash_sales_lkr: number;
  bank_card_sales_lkr: number;
}
