import React, { useState, useEffect, useRef, useCallback } from 'react';
import { kdsService } from '../services/kds';
import type { Order, OrderStatus } from '../types/order';
import type { KdsStation, KdsStats } from '../types/kds';
import { KdsOrderCard } from '../components/kds/KdsOrderCard';
import { soundNotifier } from '../utils/audio';

export const KdsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [station, setStation] = useState<KdsStation>('all');
  const [stats, setStats] = useState<KdsStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());

  const previousOrderIdsRef = useRef<Set<number>>(new Set());

  const fetchKdsData = useCallback(async () => {
    try {
      const [orderList, kdsStats] = await Promise.all([
        kdsService.getOrders(station),
        kdsService.getStats().catch(() => null),
      ]);

      // Check if new orders arrived to trigger chime sound
      const currentIds = new Set(orderList.map((o) => o.id));
      const hasNewOrder = orderList.some((o) => !previousOrderIdsRef.current.has(o.id));

      if (hasNewOrder && previousOrderIdsRef.current.size > 0 && soundEnabled) {
        soundNotifier.playOrderChime();
      }

      previousOrderIdsRef.current = currentIds;
      setOrders(orderList);
      if (kdsStats) setStats(kdsStats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('KDS load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [station, soundEnabled]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [orderList, kdsStats] = await Promise.all([
          kdsService.getOrders(station),
          kdsService.getStats().catch(() => null),
        ]);
        if (isMounted) {
          const currentIds = new Set(orderList.map((o) => o.id));
          previousOrderIdsRef.current = currentIds;
          setOrders(orderList);
          if (kdsStats) setStats(kdsStats);
          setLastUpdated(new Date());
          setIsLoading(false);
        }
      } catch (err) {
        console.error('KDS initial load error:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    // Auto-refresh every 6 seconds for live real-time kitchen updates
    const interval = setInterval(load, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [station]);

  const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      if (nextStatus === 'completed') {
        // Optimistically remove completed order from KDS queue
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
      }

      await kdsService.updateStatus(orderId, nextStatus);
      // Refresh stats
      kdsService.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err) {
      console.error('Failed to update KDS ticket status:', err);
      // Refetch if error
      fetchKdsData();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top KDS Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oonjal-gold/20 text-oonjal-gold border border-oonjal-gold/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-oonjal-cream">Kitchen Display System (KDS)</h1>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-zinc-400">
              Live Cooking Queue • Auto-sync every 6s • Updated{' '}
              {lastUpdated.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Live Metrics Counters */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Queue</span>
            <span className="text-base font-black text-oonjal-gold">
              {stats ? stats.active_queue : orders.length}
            </span>
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-blue-300 block">Cooking</span>
            <span className="text-base font-black text-blue-400">
              {stats ? stats.preparing : orders.filter((o) => o.status === 'preparing').length}
            </span>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-emerald-300 block">Ready</span>
            <span className="text-base font-black text-emerald-400">
              {stats ? stats.ready : orders.filter((o) => o.status === 'ready').length}
            </span>
          </div>

          <div className="rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Avg Time</span>
            <span className="text-base font-black text-oonjal-cream">
              {stats ? `${stats.avg_prep_time_minutes}m` : '4.5m'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Kitchen Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4">
        {/* Station Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStation('all')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              station === 'all'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            All Stations
          </button>
          <button
            type="button"
            onClick={() => setStation('drinks')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              station === 'drinks'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            Chai &amp; Drinks Station
          </button>
          <button
            type="button"
            onClick={() => setStation('food')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              station === 'food'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            Food &amp; Kitchen Station
          </button>
        </div>

        {/* Action Controls: Sound Chime, Fullscreen, Manual Refresh */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) soundNotifier.playOrderChime();
            }}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              soundEnabled
                ? 'border-oonjal-gold/40 bg-oonjal-gold/10 text-oonjal-gold'
                : 'border-oonjal-border bg-oonjal-surface text-zinc-400 hover:text-white'
            }`}
            title={soundEnabled ? 'Order sound chime is ON' : 'Order sound chime is MUTED'}
          >
            {soundEnabled ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>Chime ON</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                <span>Muted</span>
              </>
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-oonjal-gold hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0m-5 0l0 5m6 6l5 5m0 0l-5 0m5 0l0-5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
            <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchKdsData()}
            className="rounded-xl border border-oonjal-border bg-oonjal-surface p-2 text-zinc-300 hover:border-oonjal-gold hover:text-white transition-colors"
            title="Refresh Orders"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin text-oonjal-gold' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      {isLoading && orders.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-oonjal-gold border-t-transparent animate-spin" />
            <span className="text-xs text-zinc-400">Connecting to live kitchen feed...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card text-center p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-oonjal-cream">Kitchen Queue is Clear!</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            All customer orders have been prepared and dispatched. New orders placed at the POS counter will appear here instantly with a bell chime.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
          {orders.map((order) => (
            <KdsOrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
