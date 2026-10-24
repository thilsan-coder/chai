import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  Plus,
  Flame,
  Zap,
  ShoppingBag,
  Package,
  Wrench,
  Heart,
  Sparkles,
  Search,
  X,
  Check,
  RefreshCw,
  Building,
  CreditCard,
  Banknote,
  Receipt,
  Calendar,
  Trash2,
  Edit2,
} from 'lucide-react';
import { expenseService } from '../services/expenses';
import type {
  Expense,
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseSummary,
  CreateExpensePayload,
} from '../types/expense';
import { formatCurrency } from '../constants/theme';

const EXPENSE_PRESETS = [
  {
    title: 'Litro 12.5kg LP Gas Cylinder Refill',
    category: 'gas_cylinder' as ExpenseCategory,
    amount: 4200,
    payment_method: 'cash' as ExpensePaymentMethod,
    paid_to: 'Pettah Gas Agency',
  },
  {
    title: 'Fresh Cow Milk Delivery (30 Litres)',
    category: 'market_produce' as ExpenseCategory,
    amount: 7500,
    payment_method: 'cash' as ExpensePaymentMethod,
    paid_to: 'Gampaha Fresh Dairy',
  },
  {
    title: 'Fresh Mint, Lemons & Fresh Ginger',
    category: 'market_produce' as ExpenseCategory,
    amount: 1850,
    payment_method: 'petty_cash' as ExpensePaymentMethod,
    paid_to: 'Manning Market Pettah',
  },
  {
    title: 'Clay Kulhad Chai Pots (500 pcs Bulk)',
    category: 'packaging' as ExpenseCategory,
    amount: 5000,
    payment_method: 'bank_transfer' as ExpensePaymentMethod,
    paid_to: 'Kelaniya Pottery Works',
  },
  {
    title: 'Staff Night Shift Food & Tea Welfare',
    category: 'staff_welfare' as ExpenseCategory,
    amount: 1500,
    payment_method: 'petty_cash' as ExpensePaymentMethod,
    paid_to: 'Local Food Corner',
  },
  {
    title: 'CEB Commercial Electricity Bill',
    category: 'utilities' as ExpenseCategory,
    amount: 16500,
    payment_method: 'bank_transfer' as ExpensePaymentMethod,
    paid_to: 'Ceylon Electricity Board',
  },
];

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [selectedMethod, setSelectedMethod] = useState<ExpensePaymentMethod | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await expenseService.getExpenses({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        payment_method: selectedMethod === 'all' ? undefined : selectedMethod,
        search: searchQuery.trim() || undefined,
      });
      setExpenses(res.expenses);
      setSummary(res.summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load expenses';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedMethod, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await expenseService.getExpenses({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          payment_method: selectedMethod === 'all' ? undefined : selectedMethod,
          search: searchQuery.trim() || undefined,
        });
        if (isMounted) {
          setExpenses(res.expenses);
          setSummary(res.summary);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load expenses';
          setError(msg);
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedMethod, searchQuery]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      setDeletingId(id);
      await expenseService.deleteExpense(id);
      fetchExpenses();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryBadge = (category: ExpenseCategory) => {
    switch (category) {
      case 'gas_cylinder':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <Flame className="w-3 h-3 text-orange-400" />
            Gas Refill
          </span>
        );
      case 'market_produce':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ShoppingBag className="w-3 h-3 text-emerald-400" />
            Milk & Market
          </span>
        );
      case 'packaging':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Package className="w-3 h-3 text-amber-400" />
            Clay Pots & Cups
          </span>
        );
      case 'utilities':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Zap className="w-3 h-3 text-blue-400" />
            Electricity / Water
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Wrench className="w-3 h-3 text-purple-400" />
            Repairs & Boiler
          </span>
        );
      case 'staff_welfare':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Heart className="w-3 h-3 text-rose-400" />
            Staff Welfare
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            Miscellaneous
          </span>
        );
    }
  };

  const getMethodBadge = (method: ExpensePaymentMethod) => {
    switch (method) {
      case 'petty_cash':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
            <Banknote className="w-3.5 h-3.5" />
            Petty Cash
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-medium">
            <Building className="w-3.5 h-3.5" />
            Bank Transfer
          </span>
        );
      case 'card':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-purple-400 font-medium">
            <CreditCard className="w-3.5 h-3.5" />
            Card
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <Banknote className="w-3.5 h-3.5" />
            Cash
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                Daily Cafe Expenses &amp; Petty Cash
                <span className="text-xs font-normal text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  தினசரி செலவுகள்
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Track gas refills, fresh milk, clay cups, CEB electricity &amp; staff welfare
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchExpenses}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Record Expense</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Today's Session Outflow</p>
              <p className="text-xl font-bold text-amber-400">
                {formatCurrency(summary.today_expenses_lkr)}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Total Recorded Outflow</p>
              <p className="text-xl font-bold text-zinc-100">
                {formatCurrency(summary.total_expenses_lkr)}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Cash &amp; Petty Cash</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(summary.cash_petty_expenses_lkr)}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Bank &amp; Direct Transfer</p>
              <p className="text-xl font-bold text-blue-400">
                {formatCurrency(summary.bank_expenses_lkr)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown Horizontal Pills */}
      {summary && summary.category_breakdown.length > 0 && (
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Expense Breakdown by Category
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {summary.category_breakdown.map((cat) => (
              <div
                key={cat.key}
                onClick={() => setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400 truncate">
                  <span className="truncate">{cat.label}</span>
                  <span className="font-mono text-[10px] text-zinc-500">{cat.count}</span>
                </div>
                <div className="font-bold text-zinc-100 text-sm mt-1">
                  {formatCurrency(cat.total_lkr)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        {/* Category filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(
            [
              { key: 'all', label: 'All Expenses' },
              { key: 'gas_cylinder', label: 'Gas Refills' },
              { key: 'market_produce', label: 'Dairy & Market' },
              { key: 'packaging', label: 'Packaging' },
              { key: 'utilities', label: 'Utilities' },
              { key: 'maintenance', label: 'Maintenance' },
              { key: 'staff_welfare', label: 'Staff' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedCategory(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.key
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Payment Method Filter */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value as ExpensePaymentMethod | 'all')}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Payment Types</option>
            <option value="cash">Cash In Hand</option>
            <option value="petty_cash">Petty Cash Drawer</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Card</option>
          </select>

          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, vendor, slip..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Expenses Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <p className="text-xs">Loading expenses ledger...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 space-y-2">
            <p className="text-sm font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchExpenses}
              className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-2">
            <Wallet className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
            <p className="text-sm font-medium text-zinc-300">No expenses recorded</p>
            <p className="text-xs text-zinc-500">
              {searchQuery ? 'Try another keyword' : 'Click "+ Record Expense" to add your first expense slip'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-[11px] text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Expense &amp; Category</th>
                  <th className="py-3 px-4">Amount (LKR)</th>
                  <th className="py-3 px-4">Payment &amp; Vendor</th>
                  <th className="py-3 px-4">Date &amp; Shift</th>
                  <th className="py-3 px-4">Staff</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-100 flex items-center gap-2">
                        {exp.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryBadge(exp.category)}
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {exp.expense_number}
                        </span>
                      </div>
                      {exp.notes && (
                        <p className="text-[11px] text-zinc-400 italic mt-0.5 max-w-sm">
                          {exp.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-amber-400 text-sm">
                        {formatCurrency(Number(exp.amount))}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-y-1">
                      <div>{getMethodBadge(exp.payment_method)}</div>
                      {exp.paid_to && (
                        <p className="text-[11px] text-zinc-400">To: {exp.paid_to}</p>
                      )}
                      {exp.receipt_number && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                          <Receipt className="w-3 h-3 text-zinc-600" />
                          <span>{exp.receipt_number}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      <div>{new Date(exp.expense_date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-zinc-500">
                        Session: {exp.business_date}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      <span>{exp.user?.name || 'Owner / Cashier'}</span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingExpense(exp)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-amber-400 transition-colors"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === exp.id}
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record New Expense Modal */}
      {isRecordModalOpen && (
        <ExpenseModal
          onClose={() => setIsRecordModalOpen(false)}
          onSuccess={() => {
            setIsRecordModalOpen(false);
            fetchExpenses();
          }}
        />
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => {
            setEditingExpense(null);
            fetchExpenses();
          }}
        />
      )}
    </div>
  );
};

interface ExpenseModalProps {
  expense?: Expense;
  onClose: () => void;
  onSuccess: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ expense, onClose, onSuccess }) => {
  const isEditing = Boolean(expense);
  const [formData, setFormData] = useState<CreateExpensePayload>(() => ({
    category: expense?.category || 'gas_cylinder',
    title: expense?.title || '',
    amount: expense ? Number(expense.amount) : 0,
    payment_method: expense?.payment_method || 'cash',
    paid_to: expense?.paid_to || '',
    receipt_number: expense?.receipt_number || '',
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
    notes: expense?.notes || '',
  }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreset = (preset: (typeof EXPENSE_PRESETS)[0]) => {
    setFormData({
      ...formData,
      title: preset.title,
      category: preset.category,
      amount: preset.amount,
      payment_method: preset.payment_method,
      paid_to: preset.paid_to,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amount <= 0) {
      setError('Please provide a valid title and amount greater than 0.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && expense) {
        await expenseService.updateExpense(expense.id, {
          ...formData,
          title: formData.title.trim(),
          paid_to: formData.paid_to?.trim() || undefined,
          receipt_number: formData.receipt_number?.trim() || undefined,
          notes: formData.notes?.trim() || undefined,
        });
      } else {
        await expenseService.createExpense({
          ...formData,
          title: formData.title.trim(),
          paid_to: formData.paid_to?.trim() || undefined,
          receipt_number: formData.receipt_number?.trim() || undefined,
          notes: formData.notes?.trim() || undefined,
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save expense';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-zinc-100 text-sm">
              {isEditing ? `Edit Expense: ${expense?.expense_number}` : 'Record Cafe Expense'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Presets Row (Only shown when creating new) */}
          {!isEditing && (
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Quick Sri Lankan Presets:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EXPENSE_PRESETS.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    + {p.title} (Rs. {p.amount})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Expense Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="gas_cylinder">Gas Cylinder (Litro/Laugfs)</option>
                <option value="market_produce">Daily Market &amp; Fresh Milk</option>
                <option value="packaging">Clay Pots &amp; Packaging</option>
                <option value="utilities">CEB Electricity &amp; Water</option>
                <option value="maintenance">Repairs &amp; Tea Boiler</option>
                <option value="staff_welfare">Staff Food &amp; Welfare</option>
                <option value="rent_rates">Shop Rent &amp; Council Rates</option>
                <option value="cleaning_misc">Hygiene &amp; Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Payment Method *
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_method: e.target.value as ExpensePaymentMethod,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="cash">Cash In Hand</option>
                <option value="petty_cash">Petty Cash Drawer</option>
                <option value="bank_transfer">Bank Direct Debit / Transfer</option>
                <option value="card">Company Debit Card</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Expense Description / Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Litro 12.5kg LP Gas Cylinder Refill"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Amount (LKR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                placeholder="4200.00"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Paid To / Vendor (Optional)
              </label>
              <input
                type="text"
                value={formData.paid_to}
                onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
                placeholder="e.g. Pettah Gas Agency"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Receipt / Bill No (Optional)
              </label>
              <input
                type="text"
                value={formData.receipt_number}
                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                placeholder="e.g. INV-9821"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Notes &amp; Particulars (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Replaced empty cylinder on stove 1 for evening Dum Chai brewing"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Update Expense' : 'Save Expense'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
