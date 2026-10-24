import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Award,
  Crown,
  Phone,
  Search,
  Gift,
  Clock,
  ShieldCheck,
  X,
  Check,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { customerService } from '../services/customers';
import type {
  Customer,
  CustomerSummary,
  CustomerTier,
  CreateCustomerPayload,
} from '../types/customer';
import { formatCurrency } from '../constants/theme';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedTier, setSelectedTier] = useState<CustomerTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<Customer | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerService.getCustomers({
        tier: selectedTier === 'all' ? undefined : selectedTier,
        search: searchQuery.trim() || undefined,
      });
      setCustomers(res.customers);
      setSummary(res.summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load customers';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedTier, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await customerService.getCustomers({
          tier: selectedTier === 'all' ? undefined : selectedTier,
          search: searchQuery.trim() || undefined,
        });
        if (isMounted) {
          setCustomers(res.customers);
          setSummary(res.summary);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load customers';
          setError(msg);
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedTier, searchQuery]);

  const getTierBadge = (tier: CustomerTier) => {
    switch (tier) {
      case 'vip':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20">
            <Crown className="w-3 h-3 text-purple-400" />
            ஊஞ்சல் VIP
          </span>
        );
      case 'gold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Award className="w-3 h-3 text-amber-400" />
            Gold Member
          </span>
        );
      case 'silver':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-700/60 text-zinc-200 border border-zinc-600">
            Silver
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40">
            Bronze
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
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                Customers & Loyalty Club
                <span className="text-xs font-normal text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  வாடிக்கையாளர்கள்
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                1 point per Rs. 100 spent • 1 point = Rs. 1 checkout discount
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCustomers}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Registered Members</p>
              <p className="text-xl font-bold text-zinc-100">{summary.total_customers}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">VIP & Gold Tier</p>
              <p className="text-xl font-bold text-purple-300">
                {summary.vip_count + summary.gold_count}{' '}
                <span className="text-xs font-normal text-zinc-500">
                  ({summary.vip_count} VIP)
                </span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Active Points Balance</p>
              <p className="text-xl font-bold text-amber-400">
                {summary.total_points_in_circulation.toLocaleString()} pts
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Member Spend (LKR)</p>
              <p className="text-xl font-bold text-emerald-400 truncate">
                {formatCurrency(summary.total_revenue_from_members_lkr)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        {/* Tier tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(
            [
              { key: 'all', label: 'All Members' },
              { key: 'vip', label: 'VIP' },
              { key: 'gold', label: 'Gold' },
              { key: 'silver', label: 'Silver' },
              { key: 'bronze', label: 'Bronze' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTier(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTier === tab.key
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone (077...)"
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

      {/* Main Customers List */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <p className="text-xs">Loading customer directory...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 space-y-2">
            <p className="text-sm font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchCustomers}
              className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-2">
            <Users className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
            <p className="text-sm font-medium text-zinc-300">No customers found</p>
            <p className="text-xs text-zinc-500">
              {searchQuery ? 'Try matching another name or phone number' : 'Add your first customer to start tracking loyalty points'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-[11px] text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Loyalty Points</th>
                  <th className="py-3 px-4">Visits & Spend</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-100 flex items-center gap-2">
                        {c.name}
                        {c.tier === 'vip' && <Crown className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      </div>
                      {c.notes && (
                        <p className="text-[11px] text-zinc-500 truncate max-w-xs">{c.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-mono">
                        <Phone className="w-3.5 h-3.5 text-amber-500/80" />
                        <span>{c.phone}</span>
                      </div>
                      {c.email && <p className="text-[10px] text-zinc-500 truncate">{c.email}</p>}
                    </td>
                    <td className="py-3 px-4">{getTierBadge(c.tier)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-400 text-sm">
                          {c.loyalty_points.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-500">pts</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        (= {formatCurrency(c.loyalty_points)} off)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-200">
                        {formatCurrency(c.total_spent)}
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{c.total_visits} orders placed</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setAdjustTarget(c)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-medium text-[11px] border border-zinc-700 transition-colors"
                        title="Adjust points"
                      >
                        Adjust Pts
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistoryTarget(c)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-[11px] border border-zinc-700 transition-colors"
                        title="View history"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <AddCustomerModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchCustomers();
          }}
        />
      )}

      {/* Adjust Points Modal */}
      {adjustTarget && (
        <AdjustPointsModal
          customer={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSuccess={() => {
            setAdjustTarget(null);
            fetchCustomers();
          }}
        />
      )}

      {/* Order History Modal */}
      {historyTarget && (
        <CustomerHistoryModal
          customer={historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
};

interface AddCustomerModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateCustomerPayload>({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Please provide customer name and phone number.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await customerService.createCustomer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register customer';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-zinc-100 text-sm">Register Oonjal Customer</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Farhan Rizvi"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Sri Lankan Mobile Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 077 123 4567"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Used for instant loyalty lookup at the POS billing counter.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. farhan@example.com"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Customer Preferences / Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Prefers Kadak Chai with extra ginger, swing balcony regular"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AdjustPointsModalProps {
  customer: Customer;
  onClose: () => void;
  onSuccess: () => void;
}

const AdjustPointsModal: React.FC<AdjustPointsModalProps> = ({ customer, onClose, onSuccess }) => {
  const [delta, setDelta] = useState<number>(50);
  const [isBonus, setIsBonus] = useState(true);
  const [reason, setReason] = useState('Welcome bonus / special customer perk');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide an adjustment reason.');
      return;
    }

    const pointsDelta = isBonus ? Math.abs(delta) : -Math.abs(delta);
    setSubmitting(true);
    setError(null);
    try {
      await customerService.adjustPoints(customer.id, {
        points_delta: pointsDelta,
        reason: reason.trim(),
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to adjust points';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-zinc-100 text-sm">Adjust Loyalty Points</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-zinc-200">{customer.name}</p>
              <p className="text-[11px] text-zinc-500 font-mono">{customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-400">Current Balance</p>
              <p className="font-bold text-amber-400">{customer.loyalty_points} pts</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsBonus(true)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isBonus
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
            >
              + Add Bonus Points
            </button>
            <button
              type="button"
              onClick={() => setIsBonus(false)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                !isBonus
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
            >
              - Deduct Points
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Points Quantity</label>
            <input
              type="number"
              min="1"
              max="5000"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Reason / Note</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Birthday reward, promotion, cashier correction"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? 'Applying...' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CustomerHistoryModalProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({ customer, onClose }) => {
  const [fullCustomer, setFullCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await customerService.getCustomer(customer.id);
        if (isMounted) {
          setFullCustomer(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [customer.id]);

  const orders = fullCustomer?.orders ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-zinc-100 text-sm">
                Order History: {customer.name}
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">{customer.phone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
              <p className="text-xs">Loading order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p className="text-xs">No orders recorded for this customer yet.</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">
                      #{ord.token_number}
                    </span>
                    <span className="font-mono text-zinc-400 text-[11px]">
                      {ord.order_number}
                    </span>
                  </div>
                  <span className="font-bold text-zinc-200">
                    {formatCurrency(Number(ord.total))}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="capitalize">{ord.order_type.replace('_', ' ')}</span>
                  <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                </div>

                {ord.items && ord.items.length > 0 && (
                  <div className="pt-2 border-t border-zinc-850 space-y-1">
                    {ord.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-[11px] text-zinc-400">
                        <span>
                          {it.quantity}x {it.product_name}
                          {it.variant_name ? ` (${it.variant_name})` : ''}
                        </span>
                        <span>{formatCurrency(Number(it.total_price))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
