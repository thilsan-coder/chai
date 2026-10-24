import React, { useState, useEffect } from 'react';
import type { Order, OrderStatus } from '../../types/order';

interface KdsOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: number, nextStatus: OrderStatus) => void;
}

export const KdsOrderCard: React.FC<KdsOrderCardProps> = ({ order, onUpdateStatus }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const createdTime = new Date(order.created_at).getTime();
    return Math.max(0, Math.floor((Date.now() - createdTime) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const createdTime = new Date(order.created_at).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - createdTime) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [order.created_at]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Urgency styling based on elapsed time (Chai cafe target: < 5-8 mins)
  const isUrgent = minutes >= 10;
  const isWarning = minutes >= 5 && minutes < 10;

  const timerColorClass = isUrgent
    ? 'text-red-400 bg-red-950/70 border-red-500/60 animate-pulse'
    : isWarning
    ? 'text-amber-400 bg-amber-950/40 border-amber-500/40'
    : 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40';

  const statusBorderClass =
    order.status === 'preparing'
      ? 'border-blue-500/70 shadow-blue-500/10'
      : order.status === 'ready'
      ? 'border-emerald-500/70 shadow-emerald-500/10'
      : isUrgent
      ? 'border-red-500/80 shadow-red-500/10'
      : 'border-oonjal-gold/50 shadow-oonjal-gold/5';

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border-2 bg-oonjal-card p-4.5 transition-all shadow-xl ${statusBorderClass}`}
    >
      <div>
        {/* Ticket Header: Token, Type, and Elapsed Timer */}
        <div className="flex items-start justify-between border-b border-oonjal-border/70 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-oonjal-gold font-mono tracking-tight">
              #{order.token_number}
            </span>
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                order.order_type === 'dine_in'
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
              }`}
            >
              {order.order_type === 'dine_in' ? (
                <>Dine-In {order.table_number && `• ${order.table_number}`}</>
              ) : (
                'Takeaway Parcel'
              )}
            </span>
          </div>

          {/* Live Timer Pill */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-bold ${timerColorClass}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{timeFormatted}</span>
          </div>
        </div>

        {/* Customer / Order Meta */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>{order.order_number}</span>
          <span>
            {new Date(order.created_at).toLocaleTimeString('en-LK', {
              timeZone: 'Asia/Colombo',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Items List (Big Font for Kitchen Reading) */}
        <div className="my-3 space-y-2.5">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-oonjal-border/60 bg-oonjal-surface p-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-oonjal-gold/20 text-xs font-black text-oonjal-gold border border-oonjal-gold/40">
                    {item.quantity}x
                  </span>
                  <span className="text-sm font-bold text-oonjal-cream">
                    {item.product_name}
                  </span>
                  {item.variant_name && (
                    <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-semibold text-oonjal-gold border border-zinc-700">
                      {item.variant_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Addons List */}
              {item.addons && item.addons.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1 pl-8">
                  {item.addons.map((a) => (
                    <span
                      key={a.id || a.name}
                      className="rounded bg-blue-950/50 px-1.5 py-0.5 text-[10px] font-medium text-blue-300 border border-blue-800/40"
                    >
                      +{a.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Chef Notes / Special Instructions Highlighted */}
              {item.notes && (
                <div className="mt-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-1 text-xs font-mono font-bold text-amber-300">
                  Instruction: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Footer: One-touch Action Button */}
      <div className="border-t border-oonjal-border/70 pt-3">
        {order.status === 'pending' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Preparing
          </button>
        )}

        {order.status === 'preparing' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 animate-pulse"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Mark Ready for Pickup
          </button>
        )}

        {order.status === 'ready' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="w-full rounded-xl bg-oonjal-gold hover:bg-oonjal-gold-hover py-3 text-xs font-bold uppercase tracking-wider text-oonjal-black shadow-lg shadow-oonjal-gold/20 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Complete &amp; Handover
          </button>
        )}
      </div>
    </div>
  );
};
