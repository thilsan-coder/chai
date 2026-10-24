import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orders';
import type { Order, OrderStatus } from '../types/order';
import { ReceiptModal } from '../components/pos/ReceiptModal';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await orderService.getOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
        per_page: 30,
      });
      setOrders(res.orders);
      setTotalOrders(res.total);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await orderService.getOrders({
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchQuery.trim() || undefined,
          per_page: 30,
        });
        if (isMounted) {
          setOrders(res.orders);
          setTotalOrders(res.total);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    // Poll every 15 seconds for live order kitchen updates without flashing spinner
    const interval = setInterval(load, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [statusFilter, searchQuery]);

  const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const updated = await orderService.updateOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            Pending
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Preparing
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ready for Pickup
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400 border border-zinc-700">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center rounded-full bg-red-950/40 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-900/40">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oonjal-gold/20 text-oonjal-gold border border-oonjal-gold/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-oonjal-cream">Live Orders &amp; Tokens</h1>
            <p className="text-xs text-zinc-400">
              Kitchen Token Tracker &amp; Dispatch Status • Total {totalOrders} Orders
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders()}
          className="flex items-center gap-2 rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-oonjal-gold hover:text-white transition-colors"
        >
          <svg className={`h-4 w-4 ${isLoading ? 'animate-spin text-oonjal-gold' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                  : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white hover:border-oonjal-border-light'
              }`}
            >
              {tab === 'all' ? 'All Orders' : tab}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Token (#101), Order, Name..."
            className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-1.5 text-xs text-oonjal-cream placeholder-zinc-500 focus:border-oonjal-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Grid / Cards */}
      {isLoading && orders.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-oonjal-gold border-t-transparent animate-spin" />
            <span className="text-xs text-zinc-400">Loading live orders...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card text-center p-6">
          <p className="text-sm font-semibold text-zinc-300">No orders found</p>
          <p className="text-xs text-zinc-500 mt-1">There are no orders matching the selected filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="flex flex-col justify-between rounded-2xl border border-oonjal-border bg-oonjal-card p-4 transition-all hover:border-oonjal-gold/40 shadow-md"
              >
                <div>
                  {/* Card Header: Token & Status */}
                  <div className="flex items-start justify-between border-b border-oonjal-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-oonjal-gold font-mono">
                          #{order.token_number}
                        </span>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300 uppercase">
                          {order.order_type === 'dine_in' ? 'Dine-In' : 'Takeaway'}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono block mt-0.5">
                        {order.order_number} {order.table_number && `• ${order.table_number}`}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Order Items Summary */}
                  <div className="my-3 space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="text-xs leading-snug">
                        <div className="flex justify-between text-zinc-200">
                          <span className="font-medium">
                            <span className="font-bold text-oonjal-gold mr-1">{item.quantity}x</span>
                            {item.product_name}
                            {item.variant_name && ` (${item.variant_name})`}
                          </span>
                          <span className="text-zinc-400 shrink-0 ml-2">
                            Rs. {Number(item.total_price).toFixed(2)}
                          </span>
                        </div>
                        {item.addons && item.addons.length > 0 && (
                          <div className="text-[10px] text-zinc-400 pl-4">
                            {item.addons.map((a) => `+${a.name}`).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] text-amber-400/90 italic pl-4 font-mono">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer: Amount, Date & Status Action */}
                <div className="border-t border-oonjal-border/60 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      {new Date(order.created_at).toLocaleTimeString('en-LK', {
                        timeZone: 'Asia/Colombo',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {order.customer_name && ` • ${order.customer_name}`}
                    </span>
                    <span className="text-sm font-extrabold text-oonjal-cream">
                      Rs. {Number(order.total).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForReceipt(order)}
                      className="rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-oonjal-gold hover:text-white transition-colors"
                      title="View / Print Receipt"
                    >
                      Receipt
                    </button>

                    {/* Stage Buttons */}
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="flex-1 rounded-xl bg-blue-600/20 border border-blue-500/40 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-center"
                      >
                        {isUpdating ? 'Updating...' : 'Start Cooking'}
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        className="flex-1 rounded-xl bg-emerald-600/20 border border-emerald-500/40 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-center"
                      >
                        {isUpdating ? 'Updating...' : 'Mark Ready'}
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="flex-1 rounded-xl bg-oonjal-gold py-1.5 text-xs font-bold text-oonjal-black hover:bg-oonjal-gold-hover transition-all text-center"
                      >
                        {isUpdating ? 'Updating...' : 'Complete & Dispatch'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reprint Thermal Receipt Modal */}
      <ReceiptModal
        isOpen={selectedOrderForReceipt !== null}
        order={selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
        onNewOrder={() => setSelectedOrderForReceipt(null)}
      />
    </div>
  );
};
