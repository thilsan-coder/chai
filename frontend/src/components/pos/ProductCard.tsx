import React from 'react';
import type { Product } from '../../types/menu';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const isAvailable = product.is_available;
  const hasVariants = product.variants && product.variants.length > 0;
  const hasAddons = product.addons && product.addons.length > 0;

  return (
    <div
      onClick={() => isAvailable && onSelect(product)}
      className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 ${
        isAvailable
          ? 'cursor-pointer border-oonjal-border bg-oonjal-card hover:border-oonjal-gold/50 hover:bg-oonjal-surface-hover hover:shadow-lg hover:shadow-oonjal-gold/5'
          : 'cursor-not-allowed border-oonjal-border/40 bg-oonjal-surface/40 opacity-55'
      }`}
    >
      <div>
        {/* Header: Name and Status */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-oonjal-cream group-hover:text-oonjal-gold transition-colors text-sm sm:text-base leading-snug line-clamp-1">
            {product.name}
          </h4>
          {!isAvailable && (
            <span className="shrink-0 rounded bg-red-950/70 px-1.5 py-0.5 text-[10px] font-medium text-red-400 border border-red-800/40">
              Out of stock
            </span>
          )}
        </div>

        {/* Short Description */}
        {product.description && (
          <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Badges for Variants and Add-ons */}
        {(hasVariants || hasAddons) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {hasVariants && (
              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                {product.variants!.length} sizes
              </span>
            )}
            {hasAddons && (
              <span className="inline-flex items-center rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                +{product.addons!.length} extras
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Price & Add Button */}
      <div className="mt-3 flex items-center justify-between border-t border-oonjal-border/60 pt-2.5">
        <div>
          <span className="text-[10px] font-medium text-zinc-400 block uppercase tracking-wider">
            {hasVariants ? 'From' : 'Price'}
          </span>
          <span className="text-base font-bold text-oonjal-cream">
            Rs. {Number(product.base_price).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <button
          type="button"
          disabled={!isAvailable}
          className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-base transition-all duration-150 ${
            isAvailable
              ? 'bg-oonjal-gold/20 text-oonjal-gold border border-oonjal-gold/40 group-hover:bg-oonjal-gold group-hover:text-oonjal-black shadow-sm'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
          title={isAvailable ? 'Add to cart' : 'Out of stock'}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
