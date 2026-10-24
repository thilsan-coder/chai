import React from 'react';
import type { CartItem, OrderType } from '../../types/order';

interface CartPanelProps {
  items: CartItem[];
  orderType: OrderType;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  discount: number;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderTypeChange: (type: OrderType) => void;
  onTableNumberChange: (table: string) => void;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onDiscountChange: (discount: number) => void;
  onOpenCheckout: () => void;
}

const SRI_LANKAN_TABLES = ['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08', 'T-09', 'T-10', 'Counter 1', 'Counter 2'];

export const CartPanel: React.FC<CartPanelProps> = ({
  items,
  orderType,
  tableNumber,
  customerName,
  customerPhone,
  discount,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderTypeChange,
  onTableNumberChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onDiscountChange,
  onOpenCheckout,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-oonjal-border bg-oonjal-card p-4 shadow-xl">
      {/* Top Section: Order Type and Table / Customer info */}
      <div className="space-y-3 border-b border-oonjal-border pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-oonjal-cream text-base">Current Order</h3>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Order Type Toggle: Dine-In vs Takeaway */}
        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-oonjal-surface p-1 border border-oonjal-border">
          <button
            type="button"
            onClick={() => onOrderTypeChange('dine_in')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
              orderType === 'dine_in'
                ? 'bg-oonjal-gold text-oonjal-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Dine-In
          </button>
          <button
            type="button"
            onClick={() => onOrderTypeChange('takeaway')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
              orderType === 'takeaway'
                ? 'bg-oonjal-gold text-oonjal-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Takeaway (Parcel)
          </button>
        </div>

        {/* Table Selector for Dine-in */}
        {orderType === 'dine_in' && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-zinc-400 shrink-0">Table:</label>
            <select
              value={tableNumber}
              onChange={(e) => onTableNumberChange(e.target.value)}
              className="w-full rounded-lg border border-oonjal-border bg-oonjal-surface px-2.5 py-1.5 text-xs text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
            >
              <option value="">Select Table</option>
              {SRI_LANKAN_TABLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Customer Details Toggle / Compact Input */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Customer Name (opt)"
            className="w-full rounded-lg border border-oonjal-border bg-oonjal-surface px-2.5 py-1.5 text-xs text-oonjal-cream placeholder-zinc-500 focus:border-oonjal-gold focus:outline-none"
          />
          <input
            type="text"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            placeholder="Phone (07x xxx xxxx)"
            className="w-full rounded-lg border border-oonjal-border bg-oonjal-surface px-2.5 py-1.5 text-xs text-oonjal-cream placeholder-zinc-500 focus:border-oonjal-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Center Section: Cart Items List */}
      <div className="my-2 flex-1 overflow-y-auto space-y-2 pr-1 max-h-[46vh]">
        {items.length === 0 ? (
          <div className="flex h-44 flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-oonjal-surface flex items-center justify-center border border-oonjal-border text-zinc-500 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-300">Cart is empty</p>
            <p className="text-xs text-zinc-500 mt-0.5">Click any item from the menu to add</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex items-start justify-between rounded-xl border border-oonjal-border/70 bg-oonjal-surface p-2.5 transition-all hover:border-oonjal-border-light"
            >
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h5 className="text-xs font-semibold text-oonjal-cream">{item.productName}</h5>
                  {item.variantName && (
                    <span className="rounded bg-oonjal-gold/15 px-1.5 py-0.2 text-[10px] font-medium text-oonjal-gold border border-oonjal-gold/30">
                      {item.variantName}
                    </span>
                  )}
                </div>

                {/* Add-ons chips */}
                {item.addons.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.addons.map((a) => (
                      <span
                        key={a.id}
                        className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-300 border border-zinc-700"
                      >
                        +{a.name} (Rs. {a.price})
                      </span>
                    ))}
                  </div>
                )}

                {/* Special Instructions Note */}
                {item.notes && (
                  <p className="mt-1 text-[10px] italic text-amber-400/90 font-mono">
                    Note: {item.notes}
                  </p>
                )}

                <div className="mt-1 text-xs font-bold text-oonjal-cream">
                  Rs. {(item.unitPrice * item.quantity).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex items-center gap-1.5 shrink-0 pt-1">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-oonjal-border bg-oonjal-card text-xs font-bold text-zinc-300 hover:border-oonjal-gold hover:text-white"
                >
                  -
                </button>
                <span className="w-5 text-center text-xs font-bold text-oonjal-cream">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-oonjal-border bg-oonjal-card text-xs font-bold text-zinc-300 hover:border-oonjal-gold hover:text-white"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.cartItemId)}
                  className="ml-1 p-1 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Section: Calculation & Checkout Action Button */}
      <div className="space-y-2 border-t border-oonjal-border pt-3">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Subtotal ({totalItemCount} items)</span>
          <span className="font-semibold text-oonjal-cream">
            Rs. {subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Discount Row */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            Discount (LKR)
          </span>
          <input
            type="number"
            min="0"
            max={subtotal}
            value={discount || ''}
            onChange={(e) => onDiscountChange(Math.max(0, Number(e.target.value)))}
            placeholder="0.00"
            className="w-20 rounded border border-oonjal-border bg-oonjal-surface px-1.5 py-0.5 text-right text-xs text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-baseline border-t border-oonjal-border/60 pt-2 text-sm font-bold">
          <span className="text-oonjal-cream">Total Amount:</span>
          <span className="text-xl font-extrabold text-oonjal-gold">
            Rs. {grandTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          type="button"
          disabled={items.length === 0}
          onClick={onOpenCheckout}
          className={`w-full rounded-xl py-3 px-4 text-center font-bold text-sm tracking-wide transition-all shadow-lg ${
            items.length > 0
              ? 'bg-oonjal-gold text-oonjal-black shadow-oonjal-gold/20 hover:bg-oonjal-gold-hover hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-oonjal-border'
          }`}
        >
          {items.length > 0 ? (
            <span className="flex items-center justify-center gap-2">
              <span>Checkout &amp; Token</span>
              <span className="rounded bg-black/20 px-2 py-0.5 text-xs font-mono">
                Rs. {grandTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </span>
            </span>
          ) : (
            'Add items to order'
          )}
        </button>
      </div>
    </div>
  );
};
