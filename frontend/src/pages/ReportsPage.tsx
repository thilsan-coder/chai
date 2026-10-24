import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building,
  CreditCard,
  Banknote,
  Calendar,
  Clock,
  Printer,
  RefreshCw,
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { reportService } from '../services/reports';
import type {
  ReportDashboardData,
  DailySessionReport,
  ReportPeriod,
} from '../types/report';
import { formatCurrency, BUSINESS_CONFIG } from '../constants/theme';

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<ReportPeriod>('today');
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [dashboard, setDashboard] = useState<ReportDashboardData | null>(null);
  const [sessions, setSessions] = useState<DailySessionReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, sessData] = await Promise.all([
        reportService.getDashboard({
          period,
          start_date: period === 'custom' ? customStart : undefined,
          end_date: period === 'custom' ? customEnd : undefined,
        }),
        reportService.getDailySessions().catch(() => []),
      ]);
      setDashboard(dashData);
      setSessions(sessData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate financial reports';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [period, customStart, customEnd]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [dashData, sessData] = await Promise.all([
          reportService.getDashboard({
            period,
            start_date: period === 'custom' ? customStart : undefined,
            end_date: period === 'custom' ? customEnd : undefined,
          }),
          reportService.getDailySessions().catch(() => []),
        ]);
        if (isMounted) {
          setDashboard(dashData);
          setSessions(sessData);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to generate financial reports';
          setError(msg);
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [period, customStart, customEnd]);

  const handlePrint = () => {
    window.print();
  };

  const fin = dashboard?.financial_summary;
  const pay = dashboard?.payment_breakdown;
  const rec = dashboard?.cash_reconciliation;
  const ord = dashboard?.order_metrics;

  const isProfitable = (fin?.estimated_gross_profit_lkr ?? 0) >= 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                Financial Reports &amp; Business P&amp;L
                <span className="text-xs font-normal text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  லாப-நட்ட அறிக்கை
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Oonjal Chai 4:00 PM – 1:00 AM session accounting &amp; cash drawer reconciliation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Period Selection Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 no-print">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(
            [
              { key: 'today', label: "Today's Live Shift" },
              { key: 'yesterday', label: "Yesterday's Shift" },
              { key: 'this_week', label: 'This Week' },
              { key: 'this_month', label: 'This Month' },
              { key: 'custom', label: 'Custom Range' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setPeriod(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                period === t.key
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
            <span className="text-zinc-500 text-xs">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {dashboard?.period_info && (
          <div className="text-[11px] text-zinc-400 font-mono hidden md:block">
            {dashboard.period_info.label}
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-7 h-7 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Computing financial statements &amp; profit margins...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-400 space-y-2 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-sm font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchReports}
            className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Executive KPI Cards */}
          {fin && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Gross / Net Sales */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Net Sales Revenue</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-black text-zinc-100">
                  {formatCurrency(fin.net_sales_lkr)}
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                  <span>{ord?.total_orders ?? 0} Orders placed</span>
                  <span className="text-zinc-500">AOV: {formatCurrency(ord?.average_order_value_lkr ?? 0)}</span>
                </div>
              </div>

              {/* Operating Expenses */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Direct Expenses</span>
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-black text-rose-400">
                  {formatCurrency(fin.total_expenses_lkr)}
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                  <span>Gas, Milk, Packs &amp; CEB</span>
                  <span className="text-rose-400/80">Outflow</span>
                </div>
              </div>

              {/* Estimated Net P&L */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Estimated Net Profit</span>
                  <div
                    className={`p-2 rounded-xl border ${
                      isProfitable
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    {isProfitable ? <ArrowUpRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                </div>
                <p
                  className={`text-xl sm:text-2xl font-black ${
                    isProfitable ? 'text-amber-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(fin.estimated_gross_profit_lkr)}
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                  <span>Margin:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-0.5">
                    <Percent className="w-3 h-3" />
                    {fin.profit_margin_percent}%
                  </span>
                </div>
              </div>

              {/* Expected Till Cash Balance */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Till Cash in Hand</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Banknote className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-black text-blue-400">
                  {formatCurrency(rec?.expected_cash_in_till_lkr ?? 0)}
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                  <span>Cash In - Cash Out</span>
                  <span className="text-blue-300">Reconciled</span>
                </div>
              </div>
            </div>
          )}

          {/* Operational Deep Dive: Collections vs Drawer & Bestsellers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Box: Payment Collections & Till Reconciliation */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Collections &amp; Till Reconciliation</span>
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {BUSINESS_CONFIG.currency} Breakdown
                </span>
              </div>

              {/* Payment modes breakdown */}
              {pay && fin && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                        Cash at Counter ({pay.cash_orders_count} bills)
                      </span>
                      <span className="font-bold text-zinc-100">
                        {formatCurrency(pay.cash_sales_lkr)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${fin.net_sales_lkr > 0 ? (pay.cash_sales_lkr / fin.net_sales_lkr) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                        Card Machine POS ({pay.card_orders_count} bills)
                      </span>
                      <span className="font-bold text-zinc-100">
                        {formatCurrency(pay.card_sales_lkr)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${fin.net_sales_lkr > 0 ? (pay.card_sales_lkr / fin.net_sales_lkr) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-blue-400" />
                        Bank Direct Transfer &amp; QR ({pay.bank_orders_count + pay.qr_orders_count} bills)
                      </span>
                      <span className="font-bold text-zinc-100">
                        {formatCurrency(pay.bank_sales_lkr + pay.qr_sales_lkr)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${
                            fin.net_sales_lkr > 0
                              ? ((pay.bank_sales_lkr + pay.qr_sales_lkr) / fin.net_sales_lkr) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Drawer Reconciliation Summary */}
              {rec && (
                <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-amber-500/20 space-y-2">
                  <div className="text-xs font-semibold text-amber-400 flex items-center justify-between">
                    <span>Cash Drawer Calculation (Till Count)</span>
                    <span className="font-mono text-[10px]">Session End Expected</span>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">+ Cash Received from Bills:</span>
                      <span className="font-mono text-emerald-400">
                        +{formatCurrency(rec.cash_sales_collected_lkr)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">- Cash / Petty Cash Outflow:</span>
                      <span className="font-mono text-rose-400">
                        -{formatCurrency(rec.cash_expenses_paid_lkr)}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-zinc-800 flex justify-between font-bold text-sm">
                      <span className="text-zinc-100">= Physical Cash Expected in Drawer:</span>
                      <span className="font-mono text-amber-400">
                        {formatCurrency(rec.expected_cash_in_till_lkr)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Box: Bestsellers & Peak Hour Rush */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Top Selling Chai &amp; Fast Food</span>
                </h3>
                <span className="text-[11px] text-zinc-500">By Quantity</span>
              </div>

              {/* Bestseller Items List */}
              {dashboard?.bestselling_items && dashboard.bestselling_items.length > 0 ? (
                <div className="space-y-2">
                  {dashboard.bestselling_items.slice(0, 5).map((item, idx) => (
                    <div
                      key={item.name}
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-lg bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
                          #{idx + 1}
                        </span>
                        <span className="font-medium text-zinc-200 truncate">{item.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-zinc-100 font-mono">{item.quantity} sold</span>
                        <p className="text-[10px] text-amber-400 font-mono">
                          {formatCurrency(item.revenue_lkr)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No sales recorded in this period yet.
                </div>
              )}

              {/* 4 PM - 1 AM Hourly Rush Bar Chart */}
              {dashboard?.hourly_distribution && (
                <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Shift Hourly Distribution (4 PM - 1 AM)</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Peak Traffic</span>
                  </div>

                  <div className="grid grid-cols-10 gap-1 items-end h-20 pt-2">
                    {dashboard.hourly_distribution.map((h) => {
                      const maxOrders = Math.max(
                        1,
                        ...dashboard.hourly_distribution.map((x) => x.orders_count)
                      );
                      const heightPercent = Math.max(10, (h.orders_count / maxOrders) * 100);

                      return (
                        <div key={h.hour_num} className="flex flex-col items-center gap-1 h-full justify-end group">
                          <span className="text-[9px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                            {h.orders_count}
                          </span>
                          <div
                            className={`w-full rounded-t transition-all ${
                              h.orders_count > 0 ? 'bg-amber-500 group-hover:bg-amber-400' : 'bg-zinc-800'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                            title={`${h.hour_label}: ${h.orders_count} orders, ${formatCurrency(h.sales_lkr)}`}
                          />
                          <span className="text-[9px] text-zinc-500 truncate w-full text-center">
                            {h.hour_label.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Past 14 Business Shifts Performance Table */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Past 14 Business Sessions History</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Sri Lankan 4 PM – 1 AM session performance, net sales, expenses &amp; net P&amp;L
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-[11px] text-zinc-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Session Date</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Gross Sales</th>
                    <th className="py-3 px-4">Direct Expenses</th>
                    <th className="py-3 px-4">Net P&amp;L</th>
                    <th className="py-3 px-4 text-right">Cash vs Bank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-zinc-500">
                        No previous session records available.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((sess) => {
                      const profit = sess.net_profit_lkr;
                      const hasProfit = profit >= 0;

                      return (
                        <tr key={sess.business_date} className="hover:bg-zinc-850/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-zinc-100">{sess.formatted_date}</div>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Session: {sess.business_date}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono">{sess.total_orders} bills</td>
                          <td className="py-3 px-4 font-bold text-zinc-100 font-mono">
                            {formatCurrency(sess.net_sales_lkr)}
                          </td>
                          <td className="py-3 px-4 text-rose-400 font-mono">
                            {sess.total_expenses_lkr > 0 ? `-${formatCurrency(sess.total_expenses_lkr)}` : 'Rs. 0.00'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-bold font-mono ${
                                hasProfit ? 'text-amber-400' : 'text-red-400'
                              }`}
                            >
                              {formatCurrency(profit)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-y-0.5">
                            <div className="text-[11px] text-emerald-400 font-mono">
                              Cash: {formatCurrency(sess.cash_sales_lkr)}
                            </div>
                            <div className="text-[10px] text-blue-400 font-mono">
                              Bank: {formatCurrency(sess.bank_card_sales_lkr)}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
