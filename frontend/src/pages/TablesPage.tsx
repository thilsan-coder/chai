import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableService } from '../services/tables';
import type { CafeTable, FloorSection, TableSummary } from '../types/table';

export const TablesPage: React.FC = () => {
  const navigate = useNavigate();

  const [tables, setTables] = useState<CafeTable[]>([]);
  const [summary, setSummary] = useState<TableSummary | null>(null);
  const [selectedSection, setSelectedSection] = useState<FloorSection | 'all'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected table modal for occupied running orders & transfers
  const [activeTableModal, setActiveTableModal] = useState<CafeTable | null>(null);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [destinationTableId, setDestinationTableId] = useState<number | ''>('');
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const fetchTables = useCallback(async () => {
    try {
      const res = await tableService.getTables({
        section: selectedSection === 'all' ? undefined : selectedSection,
      });
      setTables(res.tables);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSection]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await tableService.getTables({
          section: selectedSection === 'all' ? undefined : selectedSection,
        });
        if (isMounted) {
          setTables(res.tables);
          setSummary(res.summary);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Tables load error:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedSection]);

  // Handle click on table card
  const handleTableClick = (table: CafeTable) => {
    if (table.status === 'available') {
      // Start order on this table at POS counter
      navigate(`/pos?table=${table.code}`);
    } else {
      // View running order and table actions modal
      setActiveTableModal(table);
      setIsTransferring(false);
      setDestinationTableId('');
    }
  };

  // Release / Clean Table
  const handleReleaseTable = async (tableId: number) => {
    try {
      setIsActionLoading(true);
      await tableService.releaseTable(tableId);
      setActiveTableModal(null);
      fetchTables();
    } catch (err) {
      console.error('Failed to release table:', err);
      alert('Could not release table.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Transfer Order to another table
  const handleTransferOrder = async () => {
    if (!activeTableModal || !destinationTableId) return;

    try {
      setIsActionLoading(true);
      await tableService.transferOrder(activeTableModal.id, Number(destinationTableId));
      setActiveTableModal(null);
      fetchTables();
    } catch (err) {
      console.error('Table transfer failed:', err);
      alert('Transfer failed. Please check destination table.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getSectionTitle = (sec: FloorSection) => {
    switch (sec) {
      case 'indoor_ground':
        return 'Indoor Ground Floor';
      case 'outdoor_verandah':
        return 'Outdoor Garden Verandah';
      case 'balcony_swing':
        return 'ஊஞ்சல் Balcony Swings';
      case 'ac_family':
        return 'AC Family Cabin';
    }
  };

  const availableTablesForTransfer = tables.filter(
    (t) => t.status === 'available' && t.id !== activeTableModal?.id
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header & Live Floor Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oonjal-gold/20 text-oonjal-gold border border-oonjal-gold/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-oonjal-cream">Tables &amp; Floor Management</h1>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-zinc-400">
              Interactive Cafe Floor Map • 12 Active Dine-in Tables
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-emerald-300 block">Available</span>
            <span className="text-base font-black text-emerald-400">
              {summary ? summary.available : 0}
            </span>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-purple-300 block">Occupied</span>
            <span className="text-base font-black text-purple-400">
              {summary ? summary.occupied : 0}
            </span>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-amber-300 block">Cleaning</span>
            <span className="text-base font-black text-amber-400">
              {summary ? summary.cleaning : 0}
            </span>
          </div>

          <div className="rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Seated Guests</span>
            <span className="text-base font-black text-oonjal-gold">
              {summary ? `${summary.seated_capacity} Pax` : '0 Pax'}
            </span>
          </div>
        </div>
      </div>

      {/* Floor Section Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedSection('all')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedSection === 'all'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            All Areas ({tables.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedSection('indoor_ground')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedSection === 'indoor_ground'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            Indoor Ground
          </button>
          <button
            type="button"
            onClick={() => setSelectedSection('outdoor_verandah')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedSection === 'outdoor_verandah'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            Garden Verandah
          </button>
          <button
            type="button"
            onClick={() => setSelectedSection('balcony_swing')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedSection === 'balcony_swing'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            ஊஞ்சல் Balcony Swings
          </button>
          <button
            type="button"
            onClick={() => setSelectedSection('ac_family')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedSection === 'ac_family'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            AC Cabin
          </button>
        </div>

        <button
          type="button"
          onClick={() => fetchTables()}
          className="rounded-xl border border-oonjal-border bg-oonjal-surface p-2 text-zinc-300 hover:border-oonjal-gold hover:text-white transition-colors"
          title="Refresh Tables"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin text-oonjal-gold' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Tables Grid */}
      {isLoading && tables.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-oonjal-gold border-t-transparent animate-spin" />
            <span className="text-xs text-zinc-400">Loading cafe floor plan...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const isOccupied = table.status === 'occupied' && table.current_order;
            const isCleaning = table.status === 'cleaning';

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`group relative flex flex-col justify-between rounded-2xl border-2 p-4 transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.99] ${
                  isOccupied
                    ? 'border-purple-500/70 bg-oonjal-card shadow-purple-500/10'
                    : isCleaning
                    ? 'border-amber-500/70 bg-oonjal-card shadow-amber-500/10'
                    : 'border-oonjal-border bg-oonjal-card hover:border-emerald-500/60 shadow-oonjal-gold/5'
                }`}
              >
                <div>
                  {/* Card Header: Table Code & Capacity */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-black text-oonjal-cream font-mono">
                        {table.code}
                      </span>
                      <h4 className="text-xs font-semibold text-zinc-300 mt-0.5 line-clamp-1">
                        {table.name}
                      </h4>
                    </div>

                    <span className="rounded-lg bg-oonjal-surface px-2 py-0.5 text-[10px] font-bold text-zinc-400 border border-oonjal-border">
                      {table.capacity} Seats
                    </span>
                  </div>

                  {/* Section Tag */}
                  <span className="mt-1.5 inline-block text-[10px] font-medium text-oonjal-gold/90">
                    {getSectionTitle(table.floor_section)}
                  </span>

                  {/* Center Occupancy Content */}
                  <div className="my-3 rounded-xl border border-oonjal-border/70 bg-oonjal-surface p-2.5">
                    {isOccupied && table.current_order ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-oonjal-gold font-mono">
                            Token #{table.current_order.token_number}
                          </span>
                          <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                        </div>
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Items:</span>
                          <span className="font-semibold text-zinc-200">
                            {table.current_order.items.reduce((s, i) => s + i.quantity, 0)} items
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-oonjal-cream pt-1 border-t border-oonjal-border/60">
                          <span>Bill:</span>
                          <span className="text-oonjal-gold">
                            Rs. {Number(table.current_order.total).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ) : isCleaning ? (
                      <div className="text-center py-1">
                        <span className="text-xs font-bold text-amber-400 block">Needs Cleaning</span>
                        <span className="text-[10px] text-zinc-400">Tap to mark clean</span>
                      </div>
                    ) : (
                      <div className="text-center py-1">
                        <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Vacant / Ready
                        </span>
                        <span className="text-[10px] text-zinc-400">Tap to start order</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Tag */}
                <div className="border-t border-oonjal-border/60 pt-2 flex items-center justify-between text-[11px]">
                  {isOccupied ? (
                    <span className="font-bold text-purple-400 group-hover:underline">
                      View Running Order &rarr;
                    </span>
                  ) : isCleaning ? (
                    <span className="font-bold text-amber-400 group-hover:underline">
                      Sanitize &amp; Free &rarr;
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-400 group-hover:underline">
                      Punch Dine-In &rarr;
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Running Order & Transfer Modal */}
      {activeTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-oonjal-border bg-oonjal-card p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-oonjal-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-oonjal-cream font-mono">
                    {activeTableModal.code}
                  </span>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      activeTableModal.status === 'occupied'
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                    }`}
                  >
                    {activeTableModal.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {activeTableModal.name} • {activeTableModal.capacity} Seats • {getSectionTitle(activeTableModal.floor_section)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTableModal(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="my-4 space-y-4">
              {activeTableModal.status === 'occupied' && activeTableModal.current_order ? (
                <>
                  {/* Order Summary Ribbon */}
                  <div className="flex items-center justify-between rounded-xl border border-oonjal-border bg-oonjal-surface p-3">
                    <div>
                      <span className="text-xs text-zinc-400 block font-mono">
                        {activeTableModal.current_order.order_number}
                      </span>
                      <span className="text-base font-black text-oonjal-gold font-mono">
                        Token #{activeTableModal.current_order.token_number}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block uppercase">Total Bill</span>
                      <span className="text-xl font-extrabold text-oonjal-cream">
                        Rs. {Number(activeTableModal.current_order.total).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Running Items List */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Running Items Ordered:
                    </h5>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {activeTableModal.current_order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-xs rounded-lg bg-oonjal-surface/60 p-2 border border-oonjal-border/60"
                        >
                          <div>
                            <span className="font-bold text-oonjal-gold mr-1.5">{item.quantity}x</span>
                            <span className="font-semibold text-oonjal-cream">{item.product_name}</span>
                            {item.variant_name && (
                              <span className="ml-1 text-[10px] text-zinc-400">({item.variant_name})</span>
                            )}
                            {item.addons && item.addons.length > 0 && (
                              <span className="block text-[10px] text-zinc-500 pl-4">
                                {item.addons.map((a) => `+${a.name}`).join(', ')}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-zinc-300 shrink-0">
                            Rs. {Number(item.total_price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transfer Table Section */}
                  {isTransferring ? (
                    <div className="rounded-xl border border-oonjal-gold/40 bg-oonjal-surface p-3 space-y-3">
                      <h5 className="text-xs font-bold text-oonjal-gold uppercase tracking-wider">
                        Select Destination Table:
                      </h5>
                      <select
                        value={destinationTableId}
                        onChange={(e) => setDestinationTableId(Number(e.target.value))}
                        className="w-full rounded-xl border border-oonjal-border bg-oonjal-card px-3 py-2 text-xs text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                      >
                        <option value="">-- Choose Vacant Table --</option>
                        {availableTablesForTransfer.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.code} - {t.name} ({t.capacity} Seats • {getSectionTitle(t.floor_section)})
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsTransferring(false)}
                          className="rounded-lg border border-oonjal-border px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!destinationTableId || isActionLoading}
                          onClick={handleTransferOrder}
                          className="rounded-lg bg-oonjal-gold px-4 py-1.5 text-xs font-bold text-oonjal-black hover:bg-oonjal-gold-hover transition-colors"
                        >
                          {isActionLoading ? 'Transferring...' : 'Confirm Move'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : activeTableModal.status === 'cleaning' ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-center">
                  <p className="text-sm font-bold text-amber-400">This table is currently being cleaned.</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Once waitstaff finishes sanitizing, click the button below to mark it available for new guests.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between border-t border-oonjal-border pt-4 gap-2 flex-wrap">
              {activeTableModal.status === 'occupied' && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsTransferring(!isTransferring)}
                    className="rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-oonjal-gold hover:text-white transition-colors"
                  >
                    Transfer Table
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/pos?table=${activeTableModal.code}`)}
                      className="rounded-xl border border-oonjal-gold/50 bg-oonjal-gold/15 px-3 py-2 text-xs font-bold text-oonjal-gold hover:bg-oonjal-gold hover:text-oonjal-black transition-all"
                    >
                      + Add More Items
                    </button>
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleReleaseTable(activeTableModal.id)}
                      className="rounded-xl bg-red-600/20 border border-red-500/40 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-600 hover:text-white transition-all"
                    >
                      Settle &amp; Release
                    </button>
                  </div>
                </>
              )}

              {activeTableModal.status === 'cleaning' && (
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleReleaseTable(activeTableModal.id)}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-lg transition-all"
                >
                  Mark Table Clean &amp; Ready
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
