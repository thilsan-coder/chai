import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { menuService } from '../services/menu';

import type { Category, Product, ProductFormData } from '../types/menu';
import { formatCurrency } from '../constants/theme';
import {
  UtensilsCrossed,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';

export const MenuPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Product Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState<ProductFormData>({
    category_id: 1,
    name: '',
    description: '',
    base_price: 150,
    cost_price: 50,
    image_url: '',
    is_available: true,
    is_featured: false,
    preparation_time_minutes: 5,
    variants: [],
    addons: [],
  });

  // Delete confirm state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [cats, prods] = await Promise.all([
        menuService.getCategories(),
        menuService.getProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err: any) {
      setError(err.message || 'Failed to load menu data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([menuService.getCategories(), menuService.getProducts()])
      .then(([cats, prods]) => {
        if (isMounted) {
          setCategories(cats);
          setProducts(prods);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || 'Failed to load menu data');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);


  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      category_id: selectedCategoryId || (categories[0]?.id ?? 1),
      name: '',
      description: '',
      base_price: 200,
      cost_price: 70,
      image_url: '',
      is_available: true,
      is_featured: false,
      preparation_time_minutes: 5,
      variants: [],
      addons: [],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      category_id: product.category_id,
      name: product.name,
      description: product.description || '',
      base_price: product.base_price,
      cost_price: product.cost_price || 0,
      image_url: product.image_url || '',
      is_available: product.is_available,
      is_featured: product.is_featured,
      preparation_time_minutes: product.preparation_time_minutes,
      variants: (product.variants || []).map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price,
        is_default: v.is_default || false,
      })),
      addons: (product.addons || []).map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
      })),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: 'Large', price: prev.base_price + 70, is_default: false },
      ],
    }));
  };

  const handleRemoveVariantRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleAddAddonRow = () => {
    setFormData((prev) => ({
      ...prev,
      addons: [
        ...prev.addons,
        { name: 'Extra Topping', price: 80 },
      ],
    }));
  };

  const handleRemoveAddonRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (formData.base_price < 0) {
      setFormError('Base price must be a positive amount in LKR.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingProduct) {
        await menuService.updateProduct(editingProduct.id, formData);
      } else {
        await menuService.createProduct(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (productId: number) => {
    try {
      const newStatus = await menuService.toggleProductAvailability(productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_available: newStatus } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await menuService.deleteProduct(id);
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Filter products by selected category and search query
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategoryId ? prod.category_id === selectedCategoryId : true;
    const matchesSearch = searchQuery.trim()
      ? prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  const availableCount = products.filter((p) => p.is_available).length;
  const outOfStockCount = products.length - availableCount;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Module: MOD-04
            </span>
            <span className="text-xs text-zinc-400 font-mono">Currency: Sri Lankan Rupees (LKR)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight mt-1">
            Menu Items & Pricing
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Configure chai recipes, burgers, submarines, mojitos, item variants, and real-time stock availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchData}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Add New Menu Item
          </Button>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <p className="text-[11px] text-zinc-400 font-semibold uppercase">Total Menu Items</p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-100 mt-0.5">{products.length}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] text-zinc-400 font-semibold uppercase">In Stock (Ordering)</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">{availableCount}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] text-zinc-400 font-semibold uppercase">Out of Stock</p>
          <p className="text-xl sm:text-2xl font-bold text-red-400 mt-0.5">{outOfStockCount}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] text-zinc-400 font-semibold uppercase">Categories</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">{categories.length}</p>
        </Card>
      </div>

      {/* Main Container */}
      <Card>
        <CardHeader
          title="Menu Catalog"
          subtitle="Click on availability toggle to immediately disable an item on POS register"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item name..."
                  className="bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          }
        />

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 -mx-1 px-1 border-b border-zinc-800/80">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryId === null
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = products.filter((p) => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-zinc-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Loading menu items from MySQL...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            <UtensilsCrossed className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
            <p>No products match your selected category or search filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  product.is_available
                    ? 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                    : 'bg-zinc-950/40 border-zinc-900 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-100 truncate">{product.name}</h4>
                        {product.is_featured && (
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-amber-400/80 font-medium">
                        {product.category?.name || 'Category'}
                      </span>
                    </div>

                    {/* Fast Stock Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(product.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        product.is_available
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                      }`}
                      title="Click to toggle availability"
                    >
                      {product.is_available ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Sold Out
                        </>
                      )}
                    </button>
                  </div>

                  {product.description && (
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price Banner */}
                  <div className="mt-3.5 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Base Price:</span>
                    <span className="text-base font-bold text-amber-400">
                      {formatCurrency(product.base_price)}
                    </span>
                  </div>

                  {/* Variants List (if any) */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-zinc-400" /> Permitted Variants:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.variants.map((v, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300"
                          >
                            {v.name} • <strong className="text-amber-400">{formatCurrency(v.price)}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add-ons List (if any) */}
                  {product.addons && product.addons.length > 0 && (
                    <div className="mt-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-zinc-400" /> Permitted Extras:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.addons.map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg text-[10px] bg-zinc-900/60 border border-zinc-800/60 text-zinc-400"
                          >
                            +{a.name} ({formatCurrency(a.price)})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-amber-500/60" /> ~{product.preparation_time_minutes}m prep
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-850 rounded-lg transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(product.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-850 rounded-lg transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Product Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Add New Menu Item'}
        subtitle="Item details, Sri Lankan Rupee pricing, variants, and extra toppings"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Item Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cardamom Ginger Chai"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Ingredients and taste highlights..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Selling Price (LKR / Rs.) *
              </label>
              <Input
                type="number"
                step="1"
                min="0"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Est. Cost Price (LKR)
              </label>
              <Input
                type="number"
                step="1"
                min="0"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Prep Time (Mins)</label>
              <Input
                type="number"
                min="1"
                value={formData.preparation_time_minutes}
                onChange={(e) => setFormData({ ...formData, preparation_time_minutes: parseInt(e.target.value) || 5 })}
              />
            </div>
          </div>

          {/* Variants Builder */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-zinc-200">Product Variants (Sizes / Portions)</h5>
                <p className="text-[10px] text-zinc-400">e.g. Regular (Rs. 150), Large Clay Cup (Rs. 220)</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddVariantRow}
              >
                Add Variant
              </Button>
            </div>

            {formData.variants.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-1">No variants. Base price will apply.</p>
            ) : (
              <div className="space-y-2 pt-1">
                {formData.variants.map((v, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Variant name (e.g. Double Patty)"
                      value={v.name}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index].name = e.target.value;
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                    <div className="relative w-32">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">Rs.</span>
                      <input
                        type="number"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].price = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-2 py-1.5 text-xs text-zinc-100 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariantRow(index)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add-ons Builder */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-zinc-200">Permitted Add-ons / Extras</h5>
                <p className="text-[10px] text-zinc-400">e.g. Extra Cheese Slice (Rs. 100), Ice Cream Scoop (Rs. 120)</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddAddonRow}
              >
                Add Extra
              </Button>
            </div>

            {formData.addons.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-1">No add-ons configured.</p>
            ) : (
              <div className="space-y-2 pt-1">
                {formData.addons.map((a, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add-on name (e.g. Extra Cheese)"
                      value={a.name}
                      onChange={(e) => {
                        const newAddons = [...formData.addons];
                        newAddons[index].name = e.target.value;
                        setFormData({ ...formData, addons: newAddons });
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                    <div className="relative w-32">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">Rs.</span>
                      <input
                        type="number"
                        placeholder="Price"
                        value={a.price}
                        onChange={(e) => {
                          const newAddons = [...formData.addons];
                          newAddons[index].price = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, addons: newAddons });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-2 py-1.5 text-xs text-zinc-100 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddonRow(index)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-900 border-zinc-700"
              />
              <span>In Stock for Ordering</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-900 border-zinc-700"
              />
              <span>Featured Highlight</span>
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingProduct ? 'Update Menu Item' : 'Create Menu Item'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <Modal
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          title="Confirm Item Deletion"
          subtitle="Are you sure you want to remove this item from the cafe menu?"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Removing this item will hide it from future POS registers. Historical sales and previous orders will retain their original price records.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteId)}>
                Yes, Delete Item
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
