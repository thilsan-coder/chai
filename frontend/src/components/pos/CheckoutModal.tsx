import React, { useState } from 'react';
import type { PaymentMethod } from '../../types/order';

interface CheckoutModalProps {
  isOpen: boolean;
  total: number;
  itemCount: number;
  orderType: string;
  tableNumber?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (data: {
    paymentMethod: PaymentMethod;
    amountTendered?: number;
    changeDue?: number;
    notes?: string;
  }) => void;
}

interface ModalContentProps {
  total: number;
  itemCount: number;
  orderType: string;
  tableNumber?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (data: {
    paymentMethod: PaymentMethod;
    amountTendered?: number;
    changeDue?: number;
    notes?: string;
  }) => void;
}

const SRI_LANKAN_DENOMINATIONS = [500, 1000, 2000, 5000];

const CheckoutModalContent: React.FC<ModalContentProps> = ({
  total,
  itemCount,
  orderType,
  tableNumber,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountTendered, setAmountTendered] = useState<number>(total);
  const [notes, setNotes] = useState<string>('');

  const changeDue = Math.max(0, amountTendered - total);
  const isCashInsufficient = paymentMethod === 'cash' && amountTendered < total;

  const handleQuickCash = (amount: number) => {
    setAmountTendered(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCashInsufficient) return;

    onConfirm({
      paymentMethod,
      amountTendered: paymentMethod === 'cash' ? amountTendered : undefined,
      changeDue: paymentMethod === 'cash' ? changeDue : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-oonjal-border bg-oonjal-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-oonjal-border pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-oonjal-gold">
              Point of Sale
            </span>
            <h3 className="text-xl font-bold text-oonjal-cream">Payment &amp; Token Dispatch</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-oonjal-surface-hover hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Order Summary Pill */}
          <div className="flex items-center justify-between rounded-xl bg-oonjal-surface p-3 border border-oonjal-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-oonjal-gold/20 px-2 py-0.5 text-xs font-bold text-oonjal-gold uppercase">
                  {orderType === 'dine_in' ? 'Dine-In' : 'Takeaway'}
                </span>
                {tableNumber && (
                  <span className="text-xs font-semibold text-zinc-300">
                    ({tableNumber})
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-400 mt-1 block">
                Total {itemCount} item(s) ordered
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block uppercase">Payable Total</span>
              <span className="text-xl font-extrabold text-oonjal-gold">
                Rs. {total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-oonjal-gold bg-oonjal-gold/15 text-oonjal-gold shadow-sm'
                    : 'border-oonjal-border bg-oonjal-surface text-zinc-300 hover:border-oonjal-border-light'
                }`}
              >
                <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs font-bold">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'border-oonjal-gold bg-oonjal-gold/15 text-oonjal-gold shadow-sm'
                    : 'border-oonjal-border bg-oonjal-surface text-zinc-300 hover:border-oonjal-border-light'
                }`}
              >
                <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-xs font-bold">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-oonjal-gold bg-oonjal-gold/15 text-oonjal-gold shadow-sm'
                    : 'border-oonjal-border bg-oonjal-surface text-zinc-300 hover:border-oonjal-border-light'
                }`}
              >
                <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="text-xs font-bold">Bank / QR</span>
              </button>
            </div>
          </div>

          {/* Cash Calculations */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3 rounded-xl border border-oonjal-border bg-oonjal-surface p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Cash Received (LKR)
                </label>
                <button
                  type="button"
                  onClick={() => handleQuickCash(total)}
                  className="text-xs font-bold text-oonjal-gold hover:underline"
                >
                  Exact (Rs. {total})
                </button>
              </div>

              {/* Sri Lankan Quick Denomination Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {SRI_LANKAN_DENOMINATIONS.map((denom) => (
                  <button
                    key={denom}
                    type="button"
                    onClick={() => handleQuickCash(denom)}
                    className="rounded-lg border border-oonjal-border bg-oonjal-card py-1.5 text-xs font-bold text-zinc-300 hover:border-oonjal-gold hover:text-white transition-colors"
                  >
                    Rs. {denom}
                  </button>
                ))}
              </div>

              <input
                type="number"
                step="any"
                min="0"
                value={amountTendered || ''}
                onChange={(e) => setAmountTendered(Number(e.target.value))}
                className="w-full rounded-xl border border-oonjal-border bg-oonjal-card px-4 py-2.5 text-lg font-bold text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
              />

              {/* Change due result */}
              <div className="flex items-center justify-between border-t border-oonjal-border/60 pt-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase">Change to Return:</span>
                {isCashInsufficient ? (
                  <span className="text-sm font-bold text-red-400">
                    Short by Rs. {(total - amountTendered).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                ) : (
                  <span className="text-xl font-black text-emerald-400">
                    Rs. {changeDue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Order Notes / Reference (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via ComBank slip #124, VIP guest..."
              className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream placeholder-zinc-500 focus:border-oonjal-gold focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-oonjal-border pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border border-oonjal-border px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-oonjal-surface-hover transition-colors"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCashInsufficient}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all shadow-lg ${
                isSubmitting || isCashInsufficient
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-oonjal-border'
                  : 'bg-oonjal-gold text-oonjal-black shadow-oonjal-gold/20 hover:bg-oonjal-gold-hover hover:scale-[1.01]'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-oonjal-black border-t-transparent animate-spin" />
                  Processing Order...
                </span>
              ) : (
                'Confirm & Print Token'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  total,
  itemCount,
  orderType,
  tableNumber,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <CheckoutModalContent
      key={`checkout_${total}_${itemCount}`}
      total={total}
      itemCount={itemCount}
      orderType={orderType}
      tableNumber={tableNumber}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
};
