import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Flame,
  Tag,
  Gift,
  Check,
  X,
  RefreshCw,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { comboService } from '../services/combos';
import { menuService } from '../services/menu';
import type { Combo, ComboSummary, CreateComboPayload } from '../types/combo';
import type { Product } from '../types/menu';
import { formatCurrency } from '../constants/theme';

export const CombosPage: React.FC = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [summary, setSummary] = useState<ComboSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [filter, setFilter] = useState<'all' | 'active' | 'featured'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCombos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await comboService.getCombos();
      setCombos(res.combos);
      setSummary(res.summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load combo promotions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await comboService.getCombos();
        if (isMounted) {
          setCombos(res.combos);
          setSummary(res.summary);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load combo promotions';
          setError(msg);
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleStatus = async (id: number) => {
    try {
      setTogglingId(id);
      const updated = await comboService.toggleStatus(id);
      setCombos((prev) => prev.map((c) => (c.id === id ? updated : c)));
      if (summary) {
        setSummary({
          ...summary,
          active_combos: updated.is_active
            ? summary.active_combos + 1
            : summary.active_combos - 1,
        });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this combo deal?')) return;
    try {
      setDeletingId(id);
      await comboService.deleteCombo(id);
      fetchCombos();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete combo');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCombos = combos.filter((c) => {
    if (filter === 'active') return c.is_active;
    if (filter === 'featured') return c.is_featured;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                Combo Offers &amp; Bundle Deals
                <span className="text-xs font-normal text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  காம்போ சலுகைகள்
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Curated meal deals, Chai + Burger bundles, and customer savings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCombos}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh deals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create New Combo</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Total Bundles</p>
              <p className="text-xl font-bold text-zinc-100">{summary.total_combos}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Active Live Deals</p>
              <p className="text-xl font-bold text-emerald-400">{summary.active_combos}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Highest Customer Savings</p>
              <p className="text-xl font-bold text-rose-400">
                {formatCurrency(summary.max_savings_lkr)}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Avg Customer Discount</p>
              <p className="text-xl font-bold text-blue-400">
                {formatCurrency(summary.average_discount_lkr)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 w-fit">
        {(
          [
            { key: 'all', label: 'All Bundles' },
            { key: 'active', label: 'Active Deals' },
            { key: 'featured', label: 'Featured Specials' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === t.key
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Combos Grid */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-7 h-7 animate-spin text-amber-500" />
          <p className="text-sm">Loading combo promotions...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-400 space-y-2 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-sm font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchCombos}
            className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : filteredCombos.length === 0 ? (
        <div className="p-16 text-center text-zinc-500 space-y-2 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <Gift className="w-12 h-12 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-zinc-300">No combo deals found</p>
          <p className="text-xs text-zinc-500">
            Click "+ Create New Combo" to bundle high-margin chai and snacks
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCombos.map((combo) => {
            const savingsPercent =
              combo.regular_price > 0
                ? Math.round((combo.savings_amount / combo.regular_price) * 100)
                : 0;

            return (
              <div
                key={combo.id}
                className={`relative rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  combo.is_active
                    ? 'bg-zinc-900/80 border-zinc-800 hover:border-amber-500/40 shadow-sm hover:shadow-lg hover:shadow-amber-500/5'
                    : 'bg-zinc-950/60 border-zinc-850 opacity-60'
                }`}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {combo.badge ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {combo.badge}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Combo Deal
                    </span>
                  )}

                  {/* Active Toggle Switch */}
                  <button
                    type="button"
                    disabled={togglingId === combo.id}
                    onClick={() => handleToggleStatus(combo.id)}
                    className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    title={combo.is_active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {combo.is_active ? (
                      <>
                        <span className="text-emerald-400 font-semibold text-[10px]">Active</span>
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      </>
                    ) : (
                      <>
                        <span className="text-zinc-500 text-[10px]">Inactive</span>
                        <ToggleLeft className="w-5 h-5 text-zinc-600" />
                      </>
                    )}
                  </button>
                </div>

                {/* Title & Tamil script */}
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-zinc-100 flex items-center justify-between">
                    <span>{combo.name}</span>
                  </h3>
                  {combo.tamil_name && (
                    <p className="text-xs text-amber-400/90 font-medium">{combo.tamil_name}</p>
                  )}
                  {combo.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{combo.description}</p>
                  )}
                </div>

                {/* Bundled Items Breakdown */}
                <div className="my-4 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-400" />
                    <span>Included in Bundle:</span>
                  </p>
                  <div className="space-y-1 pt-0.5">
                    {combo.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between text-xs text-zinc-300"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
                            {it.quantity}x
                          </span>
                          <span className="truncate">{it.product?.name || 'Item'}</span>
                          {it.variant?.name && (
                            <span className="text-[10px] text-zinc-500">
                              ({it.variant.name})
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & Savings Pill */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-500 line-through block">
                      Regular: {formatCurrency(combo.regular_price)}
                    </span>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      {formatCurrency(combo.combo_price)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Save {formatCurrency(combo.savings_amount)} ({savingsPercent}% OFF)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-2.5 border-t border-zinc-850 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingCombo(combo)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-amber-400 transition-colors"
                    title="Edit combo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === combo.id}
                    onClick={() => handleDelete(combo.id)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete combo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Combo Modal */}
      {isCreateModalOpen && (
        <ComboModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchCombos();
          }}
        />
      )}

      {/* Edit Combo Modal */}
      {editingCombo && (
        <ComboModal
          combo={editingCombo}
          onClose={() => setEditingCombo(null)}
          onSuccess={() => {
            setEditingCombo(null);
            fetchCombos();
          }}
        />
      )}
    </div>
  );
};

interface ComboModalProps {
  combo?: Combo;
  onClose: () => void;
  onSuccess: () => void;
}

const ComboModal: React.FC<ComboModalProps> = ({ combo, onClose, onSuccess }) => {
  const isEditing = Boolean(combo);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  const [name, setName] = useState(combo?.name || '');
  const [tamilName, setTamilName] = useState(combo?.tamil_name || '');
  const [description, setDescription] = useState(combo?.description || '');
  const [badge, setBadge] = useState(combo?.badge || 'Special Offer');
  const [isFeatured, setIsFeatured] = useState(combo?.is_featured || false);

  // Selected items in bundle
  const [selectedItems, setSelectedItems] = useState<
    { product_id: number; variant_id?: number | null; quantity: number }[]
  >(() => {
    if (combo?.items && combo.items.length > 0) {
      return combo.items.map((it) => ({
        product_id: it.product_id,
        variant_id: it.variant_id ?? null,
        quantity: it.quantity,
      }));
    }
    return [];
  });

  const [comboPrice, setComboPrice] = useState<number>(combo ? Number(combo.combo_price) : 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const prods = await menuService.getProducts();
        if (isMounted) {
          setProducts(prods);
          setLoadingProducts(false);
        }
      } catch {
        if (isMounted) setLoadingProducts(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute regular price from selected items
  const computedRegularPrice = selectedItems.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.product_id);
    if (!prod) return sum;
    let unitPrice = Number(prod.base_price);
    if (item.variant_id && prod.variants) {
      const v = prod.variants.find((vr) => vr.id === item.variant_id);
      if (v) unitPrice = Number(v.price);
    }
    return sum + unitPrice * item.quantity;
  }, 0);

  const savings = Math.max(0, computedRegularPrice - comboPrice);
  const savingsPercent =
    computedRegularPrice > 0 ? Math.round((savings / computedRegularPrice) * 100) : 0;

  const handleAddItem = (productId: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const defaultVariant = prod.variants && prod.variants.length > 0 ? prod.variants[0].id : null;

    setSelectedItems((prev) => [
      ...prev,
      {
        product_id: prod.id,
        variant_id: defaultVariant,
        quantity: 1,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItemQty = (index: number, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(index);
    } else {
      setSelectedItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, quantity: qty } : it))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a combo name.');
      return;
    }
    if (selectedItems.length === 0) {
      setError('Please add at least one product to the bundle.');
      return;
    }
    if (comboPrice <= 0 || comboPrice > computedRegularPrice) {
      setError('Combo price must be greater than 0 and less than or equal to regular price.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CreateComboPayload = {
      name: name.trim(),
      tamil_name: tamilName.trim() || undefined,
      description: description.trim() || undefined,
      regular_price: computedRegularPrice,
      combo_price: comboPrice,
      badge: badge.trim() || undefined,
      is_featured: isFeatured,
      items: selectedItems,
    };

    try {
      if (isEditing && combo) {
        await comboService.updateCombo(combo.id, payload);
      } else {
        await comboService.createCombo(payload);
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save combo deal';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-zinc-100 text-sm">
              {isEditing ? `Edit Combo: ${combo?.name}` : 'Create Bundle Deal (Combo)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Combo Name (English) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Burger & Mojito Combo"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Tamil Script Title (Optional)
              </label>
              <input
                type="text"
                value={tamilName}
                onChange={(e) => setTamilName(e.target.value)}
                placeholder="e.g. ஊஞ்சல் பர்கர் காம்போ"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Promotional Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Save Rs. 250, Best Seller"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Feature on POS Highlights</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Description / Marketing Pitch
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Crispy chicken burger paired with chilled sparkling mojito"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Bundle Items Picker */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Bundle Items ({selectedItems.length})</span>
              </span>
              <span className="text-[10px] text-zinc-400">
                Sum: {formatCurrency(computedRegularPrice)}
              </span>
            </div>

            {/* List of currently chosen items */}
            {selectedItems.length > 0 ? (
              <div className="space-y-1.5">
                {selectedItems.map((item, index) => {
                  const prod = products.find((p) => p.id === item.product_id);
                  return (
                    <div
                      key={`${item.product_id}_${index}`}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-semibold text-zinc-200 truncate">
                          {prod?.name || 'Product'}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          (Rs. {prod?.base_price})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(index, item.quantity - 1)}
                          className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-bold text-zinc-200 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(index, item.quantity + 1)}
                          className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="ml-1 p-1 text-zinc-500 hover:text-red-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 italic">No products added to bundle yet.</p>
            )}

            {/* Add product dropdown */}
            <div className="pt-2 border-t border-zinc-850 flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddItem(Number(e.target.value));
                    e.target.value = '';
                  }
                }}
                disabled={loadingProducts}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">+ Add item to this combo...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Rs. {p.base_price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Row: Regular vs Combo Price */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-950 border border-amber-500/20">
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">
                Regular Total (Auto-calculated)
              </span>
              <p className="text-sm font-bold text-zinc-400 font-mono">
                {formatCurrency(computedRegularPrice)}
              </p>
            </div>

            <div>
              <label className="block text-[10px] text-amber-400 font-bold mb-1">
                Combo Offer Price (LKR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={computedRegularPrice}
                required
                value={comboPrice || ''}
                onChange={(e) => setComboPrice(Number(e.target.value))}
                placeholder="e.g. 990"
                className="w-full px-2.5 py-1 rounded-lg bg-zinc-900 border border-amber-500/40 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Savings Feedback Pill */}
          {computedRegularPrice > 0 && comboPrice > 0 && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between text-emerald-400 font-semibold">
              <span>Customer Savings:</span>
              <span className="font-mono text-sm">
                Save {formatCurrency(savings)} ({savingsPercent}% OFF)
              </span>
            </div>
          )}

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
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Update Combo' : 'Create Bundle Deal'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
