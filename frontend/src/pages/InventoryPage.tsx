import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { inventoryService } from '../services/inventory';
import type { InventoryCategory, InventoryItem, InventorySummary } from '../types/inventory';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'all' | 'low_stock'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [stockInItem, setStockInItem] = useState<InventoryItem | null>(null);
  const [stockInQty, setStockInQty] = useState<string>('');
  const [stockInCost, setStockInCost] = useState<string>('');
  const [stockInRef, setStockInRef] = useState<string>('');

  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'waste_spoilage' | 'adjustment'>('waste_spoilage');
  const [adjustQty, setAdjustQty] = useState<string>('');
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchInventoryData = useCallback(async () => {
    try {
      const invRes = await inventoryService.getInventory();
      setItems(invRes.items);
      setSummary(invRes.summary);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const invRes = await inventoryService.getInventory();
        if (isMounted) {
          setItems(invRes.items);
          setSummary(invRes.summary);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load inventory data:', err);
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'low_stock'
          ? item.current_stock <= item.min_stock_alert
          : item.category === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Handle Stock In confirmation
  const handleConfirmStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInItem || !stockInQty || Number(stockInQty) <= 0) return;

    try {
      setIsSubmitting(true);
      const res = await inventoryService.stockIn(stockInItem.id, {
        quantity: Number(stockInQty),
        cost_price: stockInCost ? Number(stockInCost) : undefined,
        reference: stockInRef.trim() || undefined,
      });

      showToast(`Stock added! New balance: ${res.item.current_stock} ${res.item.unit}`);
      setStockInItem(null);
      setStockInQty('');
      setStockInCost('');
      setStockInRef('');
      fetchInventoryData();
    } catch (err) {
      console.error('Stock in failed:', err);
      alert('Failed to record stock in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Spoilage / Adjustment confirmation
  const handleConfirmAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem || !adjustQty || !adjustNotes.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await inventoryService.stockAdjust(adjustItem.id, {
        movement_type: adjustType,
        quantity: Number(adjustQty),
        notes: adjustNotes.trim(),
      });

      showToast(`Adjusted! New balance: ${res.item.current_stock} ${res.item.unit}`);
      setAdjustItem(null);
      setAdjustQty('');
      setAdjustNotes('');
      fetchInventoryData();
    } catch (err) {
      console.error('Adjustment failed:', err);
      alert('Failed to record adjustment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: InventoryCategory) => {
    switch (cat) {
      case 'dairy':
        return 'Dairy & Milk';
      case 'tea_spices':
        return 'Tea & Spices';
      case 'bakery_meats':
        return 'Bakery & Meats';
      case 'packaging':
        return 'Packaging & Clay Pots';
      case 'beverages':
        return 'Beverages';
      case 'syrups_extras':
        return 'Syrups & Extras';
    }
  };

  const lowStockItems = items.filter((i) => i.current_stock <= i.min_stock_alert);

  return (
    <div className="flex flex-col gap-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oonjal-gold/20 text-oonjal-gold border border-oonjal-gold/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-oonjal-cream">Inventory &amp; Raw Stock</h1>
            <p className="text-xs text-zinc-400">
              Chai Ingredients, Buns, Packaging &amp; Real-time Stock Levels
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Raw Items</span>
            <span className="text-base font-black text-oonjal-cream">
              {summary ? summary.total_items : items.length}
            </span>
          </div>

          <div
            onClick={() => setSelectedCategory('low_stock')}
            className="cursor-pointer rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-1.5 text-center hover:bg-red-950/50 transition-colors"
          >
            <span className="text-[10px] uppercase tracking-wider text-red-300 block">Low Stock Alert</span>
            <span className="text-base font-black text-red-400 flex items-center justify-center gap-1">
              {summary ? summary.low_stock_count : lowStockItems.length}
              {lowStockItems.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />}
            </span>
          </div>

          <div className="rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Stock Valuation</span>
            <span className="text-base font-black text-oonjal-gold">
              Rs. {summary ? Number(summary.total_valuation_lkr).toLocaleString('en-LK') : '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Alert Banner (if any) */}
      {lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-3.5 text-xs text-red-300 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-bold">Reorder Needed: </span>
              <span>
                {lowStockItems.map((i) => `${i.name} (${i.current_stock} ${i.unit})`).join(' • ')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCategory('low_stock')}
            className="rounded-lg bg-red-600/30 border border-red-500/50 px-2.5 py-1 font-bold text-white hover:bg-red-600 transition-colors shrink-0"
          >
            Filter Low Items
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('dairy')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === 'dairy'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            Dairy &amp; Milk
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('tea_spices')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === 'tea_spices'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            Tea &amp; Spices
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('bakery_meats')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === 'bakery_meats'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            Bakery &amp; Meats
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('packaging')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === 'packaging'
                ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:text-white'
            }`}
          >
            Packaging &amp; Pots
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredient, code..."
            className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-1.5 text-xs text-oonjal-cream placeholder-zinc-500 focus:border-oonjal-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading && items.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-oonjal-gold border-t-transparent animate-spin" />
            <span className="text-xs text-zinc-400">Loading stock records...</span>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card text-center p-6">
          <p className="text-sm font-semibold text-zinc-300">No raw ingredients found</p>
          <p className="text-xs text-zinc-500 mt-1">Try another filter or search term</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-oonjal-border bg-oonjal-card shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-oonjal-border bg-oonjal-surface text-zinc-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Ingredient</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Current Stock</th>
                <th className="px-4 py-3 text-right">Min Alert</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-oonjal-border/60">
              {filteredItems.map((item) => {
                const isLow = item.current_stock <= item.min_stock_alert;

                return (
                  <tr key={item.id} className="hover:bg-oonjal-surface-hover/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-oonjal-cream block text-sm">{item.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{item.code}</span>
                    </td>

                    <td className="px-4 py-3 text-zinc-300">
                      <span className="rounded bg-oonjal-surface px-2 py-0.5 text-[10px] border border-oonjal-border">
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono text-sm font-extrabold ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                        {Number(item.current_stock).toLocaleString()} {item.unit}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-zinc-400 font-mono">
                      {Number(item.min_stock_alert).toLocaleString()} {item.unit}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-medium text-zinc-200">
                      Rs. {Number(item.cost_per_unit).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-zinc-300">
                      {item.supplier ? (
                        <div>
                          <span className="font-semibold block">{item.supplier.name}</span>
                          <span className="text-[10px] text-zinc-500">{item.supplier.phone}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">Direct purchase</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-950/60 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-800/40">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-800/40">
                          Adequate
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setStockInItem(item);
                            setStockInQty('');
                            setStockInCost(item.cost_per_unit.toString());
                            setStockInRef('');
                          }}
                          className="rounded-lg bg-oonjal-gold/20 border border-oonjal-gold/40 px-2.5 py-1 text-xs font-bold text-oonjal-gold hover:bg-oonjal-gold hover:text-oonjal-black transition-all"
                        >
                          + Stock In
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustItem(item);
                            setAdjustType('waste_spoilage');
                            setAdjustQty('');
                            setAdjustNotes('');
                          }}
                          className="rounded-lg border border-oonjal-border bg-oonjal-surface px-2 py-1 text-xs text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
                          title="Record Spoilage / Adjustment"
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock In Modal (Incoming Purchase) */}
      {stockInItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-oonjal-border bg-oonjal-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-oonjal-border pb-3">
              <div>
                <span className="text-xs font-semibold text-oonjal-gold uppercase tracking-wider">
                  Incoming Stock Purchase
                </span>
                <h3 className="text-lg font-bold text-oonjal-cream">{stockInItem.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setStockInItem(null)}
                className="text-zinc-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleConfirmStockIn} className="mt-4 space-y-4">
              <div className="rounded-xl bg-oonjal-surface p-3 border border-oonjal-border flex justify-between text-xs">
                <span className="text-zinc-400">Current Stock:</span>
                <span className="font-bold text-oonjal-cream">
                  {stockInItem.current_stock} {stockInItem.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Quantity to Add ({stockInItem.unit}) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.001"
                  required
                  value={stockInQty}
                  onChange={(e) => setStockInQty(e.target.value)}
                  placeholder={`e.g. 10 (${stockInItem.unit})`}
                  className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Cost per Unit (LKR)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={stockInCost}
                  onChange={(e) => setStockInCost(e.target.value)}
                  placeholder="Cost in LKR"
                  className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Invoice / Batch Reference (Optional)
                </label>
                <input
                  type="text"
                  value={stockInRef}
                  onChange={(e) => setStockInRef(e.target.value)}
                  placeholder="e.g. Kotmale Delivery Bill #9921"
                  className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-oonjal-border pt-4">
                <button
                  type="button"
                  onClick={() => setStockInItem(null)}
                  className="rounded-xl border border-oonjal-border px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-oonjal-gold px-5 py-2 text-xs font-bold text-oonjal-black hover:bg-oonjal-gold-hover shadow-lg transition-all"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Stock In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spoilage / Adjustment Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-oonjal-border bg-oonjal-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-oonjal-border pb-3">
              <div>
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                  Stock Adjustment &amp; Waste
                </span>
                <h3 className="text-lg font-bold text-oonjal-cream">{adjustItem.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="text-zinc-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('waste_spoilage')}
                    className={`rounded-xl py-2 text-xs font-bold transition-all border ${
                      adjustType === 'waste_spoilage'
                        ? 'border-red-500 bg-red-950/40 text-red-400'
                        : 'border-oonjal-border bg-oonjal-surface text-zinc-400'
                    }`}
                  >
                    Kitchen Spoilage / Waste
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('adjustment')}
                    className={`rounded-xl py-2 text-xs font-bold transition-all border ${
                      adjustType === 'adjustment'
                        ? 'border-oonjal-gold bg-oonjal-gold/15 text-oonjal-gold'
                        : 'border-oonjal-border bg-oonjal-surface text-zinc-400'
                    }`}
                  >
                    Audit Correction
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Quantity ({adjustItem.unit}) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Reason / Notes <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Milk turned sour, Buns crushed during delivery..."
                  className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2 text-sm text-oonjal-cream focus:border-oonjal-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-oonjal-border pt-4">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="rounded-xl border border-oonjal-border px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 shadow-lg transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Record Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
