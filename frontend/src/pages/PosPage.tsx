import React, { useState, useEffect, useMemo } from 'react';
import { menuService } from '../services/menu';
import { orderService } from '../services/orders';
import type { Category, Product } from '../types/menu';
import type { CartItem, CreateOrderPayload, DailySummary, Order, OrderType, PaymentMethod } from '../types/order';
import { ProductCard } from '../components/pos/ProductCard';
import { VariantAddonModal } from '../components/pos/VariantAddonModal';
import { CartPanel } from '../components/pos/CartPanel';
import { CheckoutModal } from '../components/pos/CheckoutModal';
import { ReceiptModal } from '../components/pos/ReceiptModal';

export const PosPage: React.FC = () => {
  // Menu & Products State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(true);

  // Daily Summary (Header Stats)
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);

  // Modals State
  const [selectedProductForCustomization, setSelectedProductForCustomization] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Alerts / Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Load Categories & Products on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingMenu(true);
        const [cats, prods, summary] = await Promise.all([
          menuService.getCategories(true),
          menuService.getProducts(),
          orderService.getDailySummary().catch(() => null),
        ]);
        setCategories(cats);
        setProducts(prods);
        if (summary) setDailySummary(summary);
      } catch (err) {
        console.error('Error loading POS menu:', err);
        showNotification('Failed to load menu items.', 'error');
      } finally {
        setIsLoadingMenu(false);
      }
    };

    loadInitialData();
  }, []);

  // Filtered Products based on Category & Search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategoryId === null || p.category_id === selectedCategoryId;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Handle Product Card click
  const handleSelectProduct = (product: Product) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const hasAddons = product.addons && product.addons.length > 0;

    if (hasVariants || hasAddons) {
      // Open customization modal
      setSelectedProductForCustomization(product);
    } else {
      // Direct add to cart
      const cartItemId = `${product.id}_v0__`;
      setCartItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.cartItemId === cartItemId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += 1;
          return updated;
        } else {
          return [
            ...prev,
            {
              cartItemId,
              productId: product.id,
              productName: product.name,
              categoryName: product.category?.name,
              basePrice: Number(product.base_price),
              unitPrice: Number(product.base_price),
              quantity: 1,
              addons: [],
            },
          ];
        }
      });
      showNotification(`Added ${product.name} to cart`);
    }
  };

  // Add customized item from modal
  const handleAddCustomizedItem = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === item.cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      } else {
        return [...prev, item];
      }
    });
    showNotification(`Added ${item.productName} (${item.variantName || 'Regular'})`);
  };

  // Update quantity in cart
  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item))
      );
    }
  };

  // Remove item from cart
  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear the current order?')) {
      setCartItems([]);
      setDiscount(0);
      setCustomerName('');
      setCustomerPhone('');
      setTableNumber('');
    }
  };

  // Totals calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  // Submit Order from Checkout Modal
  const handleConfirmOrder = async (paymentData: {
    paymentMethod: PaymentMethod;
    amountTendered?: number;
    changeDue?: number;
    notes?: string;
  }) => {
    if (cartItems.length === 0) return;

    try {
      setIsSubmittingOrder(true);

      const payload: CreateOrderPayload = {
        order_type: orderType,
        table_number: orderType === 'dine_in' ? tableNumber || undefined : undefined,
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        payment_method: paymentData.paymentMethod,
        payment_status: 'paid',
        subtotal,
        discount,
        tax: 0,
        total: grandTotal,
        amount_tendered: paymentData.amountTendered,
        change_due: paymentData.changeDue,
        notes: paymentData.notes,
        items: cartItems.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          variant_id: item.variantId,
          variant_name: item.variantName,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          total_price: item.unitPrice * item.quantity,
          addons: item.addons,
          notes: item.notes,
        })),
      };

      const createdOrder = await orderService.createOrder(payload);

      // Close checkout and open receipt modal
      setIsCheckoutOpen(false);
      setCompletedOrder(createdOrder);

      // Refresh daily stats
      orderService.getDailySummary().then((s) => setDailySummary(s)).catch(() => {});
    } catch (err: unknown) {
      console.error('Order creation failed:', err);
      const msg = err instanceof Error ? err.message : 'Failed to place order.';
      showNotification(msg, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Reset cart after receipt modal closes or Next Order clicked
  const handleStartNewOrder = () => {
    setCompletedOrder(null);
    setCartItems([]);
    setDiscount(0);
    setCustomerName('');
    setCustomerPhone('');
    setTableNumber('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl transition-all animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* POS Top Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oonjal-gold/20 text-oonjal-gold border border-oonjal-gold/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-oonjal-cream">Quick POS Counter</h1>
            <p className="text-xs text-zinc-400">
              Oonjal Chai Billing • Colombo Shift
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Today's Orders</span>
            <span className="text-base font-extrabold text-oonjal-cream">
              {dailySummary ? dailySummary.total_orders : 0}
            </span>
          </div>

          <div className="rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Sales (LKR)</span>
            <span className="text-base font-extrabold text-oonjal-gold">
              Rs. {dailySummary ? Number(dailySummary.total_sales_lkr).toLocaleString('en-LK') : '0.00'}
            </span>
          </div>

          <div className="rounded-xl border border-oonjal-border bg-oonjal-surface px-3 py-1.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Next Token</span>
            <span className="text-base font-extrabold text-emerald-400">
              #{dailySummary ? dailySummary.last_token + 1 : 101}
            </span>
          </div>
        </div>
      </div>

      {/* Main POS Interface: Split into Menu Catalog (Left) and Cart Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Category Pills, Search Bar & Products Grid */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar: Search & Category Pills */}
          <div className="space-y-3 rounded-2xl border border-oonjal-border bg-oonjal-card p-4">
            {/* Search Input */}
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Chai, Burger, Mojito, Snacks by name..."
                className="w-full rounded-xl border border-oonjal-border bg-oonjal-surface pl-10 pr-4 py-2.5 text-sm text-oonjal-cream placeholder-zinc-500 focus:border-oonjal-gold focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedCategoryId === null
                    ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                    : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:border-oonjal-border-light hover:text-white'
                }`}
              >
                All Items ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedCategoryId === cat.id
                      ? 'bg-oonjal-gold text-oonjal-black shadow-md shadow-oonjal-gold/20'
                      : 'border border-oonjal-border bg-oonjal-surface text-zinc-300 hover:border-oonjal-border-light hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {isLoadingMenu ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full border-2 border-oonjal-gold border-t-transparent animate-spin" />
                <span className="text-xs text-zinc-400">Loading Oonjal Chai menu...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-oonjal-border bg-oonjal-card text-center p-6">
              <p className="text-sm font-semibold text-zinc-300">No items found</p>
              <p className="text-xs text-zinc-500 mt-1">Try another category or search keyword</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleSelectProduct}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Cart & Fast Checkout */}
        <div className="lg:col-span-4 sticky top-4">
          <CartPanel
            items={cartItems}
            orderType={orderType}
            tableNumber={tableNumber}
            customerName={customerName}
            customerPhone={customerPhone}
            discount={discount}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onOrderTypeChange={setOrderType}
            onTableNumberChange={setTableNumber}
            onCustomerNameChange={setCustomerName}
            onCustomerPhoneChange={setCustomerPhone}
            onDiscountChange={setDiscount}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        </div>
      </div>

      {/* Item Customization Modal (Portions & Add-ons) */}
      <VariantAddonModal
        isOpen={selectedProductForCustomization !== null}
        product={selectedProductForCustomization}
        onClose={() => setSelectedProductForCustomization(null)}
        onAddToCart={handleAddCustomizedItem}
      />

      {/* Checkout & Cash Change Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        total={grandTotal}
        itemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        orderType={orderType}
        tableNumber={tableNumber}
        isSubmitting={isSubmittingOrder}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleConfirmOrder}
      />

      {/* Thermal Receipt Preview & Printing */}
      <ReceiptModal
        isOpen={completedOrder !== null}
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onNewOrder={handleStartNewOrder}
      />
    </div>
  );
};
