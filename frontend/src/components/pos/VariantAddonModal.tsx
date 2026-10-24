import React, { useState } from 'react';
import type { Product, ProductVariant, ProductAddon } from '../../types/menu';
import type { CartItem, OrderAddon } from '../../types/order';

interface VariantAddonModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

interface ModalContentProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

const VariantAddonModalContent: React.FC<ModalContentProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.base_price);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
  const unitPrice = basePrice + addonsTotal;
  const itemTotal = unitPrice * quantity;

  const handleToggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleConfirm = () => {
    const orderAddons: OrderAddon[] = selectedAddons.map((a) => ({
      id: a.id,
      name: a.name,
      price: Number(a.price),
    }));

    const variantSuffix = selectedVariant ? `v${selectedVariant.id ?? 0}` : 'v0';
    const addonsSuffix = orderAddons.map((a) => a.id ?? a.name).sort().join('-');
    const cartItemId = `${product.id}_${variantSuffix}_${addonsSuffix}_${notes.trim()}`;

    const cartItem: CartItem = {
      cartItemId,
      productId: product.id,
      productName: product.name,
      categoryName: product.category?.name,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      basePrice,
      unitPrice,
      quantity,
      addons: orderAddons,
      notes: notes.trim() || undefined,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-oonjal-border bg-oonjal-card p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-oonjal-border pb-4">
          <div>
            <h3 className="text-xl font-bold text-oonjal-cream">{product.name}</h3>
            {product.category && (
              <span className="text-xs font-medium text-oonjal-gold mt-0.5 inline-block">
                {product.category.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-oonjal-surface-hover hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] space-y-5 overflow-y-auto pr-1">
          {/* Portion Variants (if any) */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Choose Portion / Size <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                        isSelected
                          ? 'border-oonjal-gold bg-oonjal-gold/15 text-oonjal-gold shadow-sm'
                          : 'border-oonjal-border bg-oonjal-surface hover:border-oonjal-border-light text-zinc-300'
                      }`}
                    >
                      <span className="text-sm font-semibold">{v.name}</span>
                      <span className="text-xs mt-1 font-medium opacity-90">
                        Rs. {Number(v.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons & Extras (if any) */}
          {product.addons && product.addons.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Customize / Add-ons (Optional)
              </label>
              <div className="space-y-2">
                {product.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <label
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-oonjal-gold/70 bg-oonjal-gold/10 text-oonjal-cream'
                          : 'border-oonjal-border bg-oonjal-surface hover:border-oonjal-border-light text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-oonjal-gold border-oonjal-gold text-oonjal-black'
                              : 'border-zinc-600 bg-zinc-800'
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-oonjal-cream">{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-oonjal-gold">
                        +Rs. {Number(addon.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-oonjal-border bg-oonjal-surface text-lg font-bold text-oonjal-cream hover:border-oonjal-gold hover:text-oonjal-gold transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center text-lg font-bold text-oonjal-cream">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-oonjal-border bg-oonjal-surface text-lg font-bold text-oonjal-cream hover:border-oonjal-gold hover:text-oonjal-gold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Kitchen / Item Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Special Instructions for Kitchen (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Less sweet, extra hot, no onions..."
              className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface px-3.5 py-2.5 text-sm text-oonjal-cream placeholder-zinc-500 focus:border-oonjal-gold focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer with Live Item Total and Confirm */}
        <div className="mt-6 flex items-center justify-between border-t border-oonjal-border pt-4">
          <div>
            <span className="text-xs text-zinc-400 block">Item Total</span>
            <span className="text-xl font-bold text-oonjal-gold">
              Rs. {itemTotal.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-oonjal-border px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-oonjal-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-xl bg-oonjal-gold px-6 py-2.5 text-sm font-bold text-oonjal-black shadow-lg shadow-oonjal-gold/20 hover:bg-oonjal-gold-hover transition-all"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VariantAddonModal: React.FC<VariantAddonModalProps> = ({
  isOpen,
  product,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  return (
    <VariantAddonModalContent
      key={product.id}
      product={product}
      onClose={onClose}
      onAddToCart={onAddToCart}
    />
  );
};
