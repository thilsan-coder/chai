import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  X,
  Check,
  ShieldCheck,
  Receipt,
  User,
  Phone,
  Edit2,
} from 'lucide-react';
import { bankTransferService } from '../services/bankTransfers';
import type { Order } from '../types/order';
import type { BankTransferSummary, VerificationStatus } from '../types/bankTransfer';
import { formatCurrency } from '../constants/theme';

export const BankTransfersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<BankTransferSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | 'all'>('pending_verification');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [editingRefOrder, setEditingRefOrder] = useState<Order | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bankTransferService.getTransfers(selectedStatus);
      setOrders(res.orders);
      setSummary(res.summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load bank transfers';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await bankTransferService.getTransfers(selectedStatus);
        if (isMounted) {
          setOrders(res.orders);
          setSummary(res.summary);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load bank transfers';
          setError(msg);
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedStatus]);

  const handleVerify = async (order: Order) => {
    if (!window.confirm(`Approve & verify bank transfer of ${formatCurrency(order.total)} for Token #${order.token_number}?`)) {
      return;
    }

    try {
      setActionLoadingId(order.id);
      await bankTransferService.verifyTransfer(order.id);
      fetchTransfers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to verify transfer');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ord.order_number.toLowerCase().includes(q) ||
      (ord.bank_reference && ord.bank_reference.toLowerCase().includes(q)) ||
      (ord.customer_name && ord.customer_name.toLowerCase().includes(q)) ||
      (ord.customer_phone && ord.customer_phone.includes(q)) ||
      (ord.bank_name && ord.bank_name.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status?: string | null) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified &amp; Paid
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-300 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            Rejected (Unpaid)
          </span>
        );
      case 'pending_verification':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Pending Verification
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
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                Bank Transfer Verification
                <span className="text-xs font-normal text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  வங்கி சரிபார்ப்பு
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Owner approval workflow for ComBank, Sampath, HNB, and FriMi QR payments
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTransfers}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh transfers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Pending Approval</p>
              <p className="text-xl font-bold text-amber-400 font-mono">
                {formatCurrency(summary.pending_amount_lkr)}
              </p>
              <p className="text-[10px] text-zinc-500">{summary.pending_count} slips waiting</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Verified Today</p>
              <p className="text-xl font-bold text-emerald-400 font-mono">
                {formatCurrency(summary.verified_today_lkr)}
              </p>
              <p className="text-[10px] text-zinc-500">Credited to account</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Total Bank Volume</p>
              <p className="text-xl font-bold text-zinc-100 font-mono">
                {formatCurrency(summary.total_bank_volume_lkr)}
              </p>
              <p className="text-[10px] text-zinc-500">Bank &amp; QR orders</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Rejected Slips</p>
              <p className="text-xl font-bold text-red-400 font-mono">{summary.rejected_count}</p>
              <p className="text-[10px] text-zinc-500">Unpaid / invalid reference</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(
            [
              { key: 'pending_verification', label: 'Pending Approval' },
              { key: 'verified', label: 'Verified & Paid' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'all', label: 'All Transfers' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSelectedStatus(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === t.key
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {t.label}
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
            placeholder="Search by token, order, reference..."
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

      {/* Main Bank Transfers Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-7 h-7 animate-spin text-amber-500" />
            <p className="text-xs">Loading bank transfer queue...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 space-y-2">
            <p className="text-sm font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchTransfers}
              className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 space-y-2">
            <Building2 className="w-12 h-12 mx-auto text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No bank transfers found</p>
            <p className="text-xs text-zinc-500">
              Orders paid via Bank Transfer or QR at the counter will appear here for owner review
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-[11px] text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Token &amp; Order</th>
                  <th className="py-3 px-4">Bank &amp; Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount (LKR)</th>
                  <th className="py-3 px-4">Status &amp; Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          #{ord.token_number}
                        </span>
                        <span className="font-mono text-zinc-400 text-[11px]">
                          {ord.order_number}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {new Date(ord.created_at).toLocaleDateString()} at{' '}
                        {new Date(ord.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {ord.bank_name || (ord.payment_method === 'qr' ? 'FriMi / Genie QR' : 'Commercial Bank')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-300">
                        <Receipt className="w-3 h-3 text-zinc-500" />
                        <span>{ord.bank_reference || 'Ref: N/A'}</span>
                        <button
                          type="button"
                          onClick={() => setEditingRefOrder(ord)}
                          className="p-0.5 text-zinc-500 hover:text-amber-400 ml-1"
                          title="Edit reference"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
                        <User className="w-3 h-3 text-zinc-500" />
                        <span>{ord.customer_name || 'Counter Guest'}</span>
                      </div>
                      {ord.customer_phone && (
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span>{ord.customer_phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-zinc-100 text-sm font-mono">
                        {formatCurrency(Number(ord.total))}
                      </span>
                      <p className="text-[10px] text-zinc-500">{ord.items.length} items ordered</p>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div>{getStatusBadge(ord.verification_status)}</div>
                      {ord.verification_status === 'verified' && (
                        <div className="text-[10px] text-zinc-400">
                          By: {ord.verifier?.name || 'Owner'}
                        </div>
                      )}
                      {ord.verification_status === 'rejected' && ord.verification_notes && (
                        <div className="text-[10px] text-red-400 italic">
                          Note: {ord.verification_notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {ord.verification_status !== 'verified' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === ord.id}
                          onClick={() => handleVerify(ord)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      {ord.verification_status !== 'rejected' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === ord.id}
                          onClick={() => setRejectingOrder(ord)}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 font-medium text-xs border border-zinc-750 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Slip Modal */}
      {rejectingOrder && (
        <RejectModal
          order={rejectingOrder}
          onClose={() => setRejectingOrder(null)}
          onSuccess={() => {
            setRejectingOrder(null);
            fetchTransfers();
          }}
        />
      )}

      {/* Edit Reference Modal */}
      {editingRefOrder && (
        <EditReferenceModal
          order={editingRefOrder}
          onClose={() => setEditingRefOrder(null)}
          onSuccess={() => {
            setEditingRefOrder(null);
            fetchTransfers();
          }}
        />
      )}
    </div>
  );
};

interface RejectModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ order, onClose, onSuccess }) => {
  const [reason, setReason] = useState('Payment not credited to bank account');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      await bankTransferService.rejectTransfer(order.id, reason.trim());
      onSuccess();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reject transfer');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="w-5 h-5" />
            <h3 className="font-bold text-zinc-100 text-sm">Reject Bank Transfer</h3>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300">
          Rejecting transfer for Token <span className="font-bold text-amber-400 font-mono">#{order.token_number}</span> ({formatCurrency(order.total)}). The order will be marked as <span className="text-red-400 font-bold">Unpaid</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Rejection Reason *
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Funds not received in Commercial Bank statement"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-sm transition-all"
            >
              {submitting ? 'Rejecting...' : 'Confirm Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditReferenceModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

const EditReferenceModal: React.FC<EditReferenceModalProps> = ({ order, onClose, onSuccess }) => {
  const [bankName, setBankName] = useState(order.bank_name || 'Commercial Bank');
  const [bankRef, setBankRef] = useState(order.bank_reference || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bankTransferService.updateReference(order.id, {
        bank_name: bankName.trim(),
        bank_reference: bankRef.trim(),
      });
      onSuccess();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update reference');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Edit2 className="w-4 h-4" />
            <h3 className="font-bold text-zinc-100 text-sm">Update Bank Reference</h3>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Bank Name</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Commercial Bank">Commercial Bank (COMB)</option>
              <option value="Sampath Bank">Sampath Bank (Vishwa)</option>
              <option value="Hatton National Bank">Hatton National Bank (HNB)</option>
              <option value="Bank of Ceylon">Bank of Ceylon (BOC)</option>
              <option value="FriMi QR">FriMi Lanka QR</option>
              <option value="Genie QR">Dialog Genie QR</option>
              <option value="Koko Pay">Koko Pay</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Slip Reference / Transaction ID
            </label>
            <input
              type="text"
              value={bankRef}
              onChange={(e) => setBankRef(e.target.value)}
              placeholder="e.g. REF-829103"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow-sm transition-all"
            >
              {submitting ? 'Saving...' : 'Update Reference'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
