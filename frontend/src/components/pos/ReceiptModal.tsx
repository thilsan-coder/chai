import React from 'react';
import type { Order } from '../../types/order';

interface ReceiptModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  order,
  onClose,
  onNewOrder,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.created_at).toLocaleString('en-LK', {
    timeZone: 'Asia/Colombo',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-2xl border border-oonjal-border bg-oonjal-card p-6 shadow-2xl">
        {/* Header Action */}
        <div className="flex items-center justify-between border-b border-oonjal-border pb-3 no-print">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Order Placed Successfully
          </span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 80mm Thermal Receipt Container */}
        <div
          id="thermal-receipt"
          className="my-4 rounded-xl bg-white p-5 font-mono text-zinc-900 shadow-inner max-h-[65vh] overflow-y-auto"
        >
          {/* Cafe Header */}
          <div className="text-center">
            <h2 className="text-xl font-black tracking-tight text-zinc-950">
              ஊஞ்சல் Chai
            </h2>
            <p className="text-[11px] font-semibold tracking-widest text-zinc-700 uppercase">
              Relax &amp; Refresh
            </p>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              Sri Lankan Chai Cafe &amp; Fast Food
            </p>
          </div>

          {/* Big Token Number Callout */}
          <div className="my-3 border-y-2 border-dashed border-zinc-900 py-2.5 text-center bg-zinc-100/60 rounded">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block">
              Token Number
            </span>
            <span className="text-3xl font-black tracking-tight text-zinc-950">
              #{order.token_number}
            </span>
            <div className="mt-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase">
              <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-white">
                {order.order_type === 'dine_in' ? 'Dine-In' : 'Takeaway'}
              </span>
              {order.table_number && (
                <span className="text-zinc-800">
                  {order.table_number}
                </span>
              )}
            </div>
          </div>

          {/* Order Details Metadata */}
          <div className="space-y-0.5 text-[10px] text-zinc-700">
            <div className="flex justify-between">
              <span>Order No:</span>
              <span className="font-bold">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formattedDate}</span>
            </div>
            {order.user && (
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{order.user.name}</span>
              </div>
            )}
            {order.customer_name && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{order.customer_name}</span>
              </div>
            )}
          </div>

          {/* Items Divider */}
          <div className="my-2 border-t border-dashed border-zinc-400" />

          {/* Items List */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-[10px] font-bold text-zinc-600 border-b border-zinc-300 pb-0.5">
              <span>Item Description</span>
              <span>Amount (Rs.)</span>
            </div>
            {order.items.map((item) => (
              <div key={item.id} className="leading-tight">
                <div className="flex justify-between font-semibold text-zinc-900">
                  <span>
                    {item.quantity} x {item.product_name}
                    {item.variant_name && ` (${item.variant_name})`}
                  </span>
                  <span>{Number(item.total_price).toFixed(2)}</span>
                </div>

                {/* Add-ons line */}
                {item.addons && item.addons.length > 0 && (
                  <div className="text-[9px] text-zinc-600 pl-2">
                    {item.addons.map((a) => `+ ${a.name}`).join(', ')}
                  </div>
                )}

                {/* Kitchen instruction note */}
                {item.notes && (
                  <div className="text-[9px] italic text-zinc-600 pl-2">
                    Note: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totals Divider */}
          <div className="my-2 border-t-2 border-dashed border-zinc-900" />

          {/* Calculations */}
          <div className="space-y-1 text-[11px] text-zinc-800">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {Number(order.subtotal).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>Discount:</span>
                <span>-Rs. {Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-zinc-950 pt-1 border-t border-zinc-300">
              <span>TOTAL (LKR):</span>
              <span>Rs. {Number(order.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-600 pt-0.5">
              <span>Payment Mode:</span>
              <span className="font-bold uppercase">{order.payment_method}</span>
            </div>

            {order.amount_tendered !== null && order.amount_tendered !== undefined && (
              <>
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>Cash Tendered:</span>
                  <span>Rs. {Number(order.amount_tendered).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-900">
                  <span>Change Given:</span>
                  <span>Rs. {Number(order.change_due || 0).toFixed(2)}</span>
                </div>
              </>
            )}

            {Boolean((order.points_earned && order.points_earned > 0) || (order.points_redeemed && order.points_redeemed > 0)) && (
              <div className="pt-1 mt-1 border-t border-dotted border-zinc-300 text-[10px]">
                {Boolean(order.points_redeemed && order.points_redeemed > 0) && (
                  <div className="flex justify-between text-amber-800">
                    <span>Points Redeemed:</span>
                    <span>-{order.points_redeemed} pts</span>
                  </div>
                )}
                {Boolean(order.points_earned && order.points_earned > 0) && (
                  <div className="flex justify-between font-semibold text-emerald-800">
                    <span>Points Earned (1pt/Rs.100):</span>
                    <span>+{order.points_earned} pts</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Thank You Note */}
          <div className="mt-4 border-t border-dashed border-zinc-400 pt-2 text-center text-[10px] text-zinc-600 leading-snug">
            <p className="font-bold">Thank you for visiting ஊஞ்சல் Chai!</p>
            <p>Please present Token #{order.token_number} at the pickup counter.</p>
          </div>
        </div>

        {/* Modal Buttons (Hidden when printing via print stylesheet) */}
        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 rounded-xl border border-oonjal-border bg-oonjal-surface py-2.5 text-xs font-bold text-oonjal-cream hover:bg-oonjal-surface-hover hover:border-oonjal-gold transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4 text-oonjal-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Slip
          </button>
          <button
            type="button"
            onClick={onNewOrder}
            className="flex-1 rounded-xl bg-oonjal-gold py-2.5 text-xs font-bold text-oonjal-black shadow-lg shadow-oonjal-gold/20 hover:bg-oonjal-gold-hover transition-all"
          >
            Next Order
          </button>
        </div>
      </div>
    </div>
  );
};
