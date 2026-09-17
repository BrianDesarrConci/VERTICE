import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant, StoreConfig } from '@/lib/types';

interface CartState {
  items: CartItem[];
  coupon: { code: string; discount: number } | null;
  /** Añade un producto (con variante opcional) o incrementa cantidad si ya existe. */
  addItem: (product: Product, variant: ProductVariant | null, qty?: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQty: (productId: string, variantId: string | null, qty: number) => void;
  clear: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  // Selectores derivados
  count: () => number;
  subtotal: () => number;
  totals: (config: StoreConfig) => {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

const sameLine = (a: CartItem, productId: string, variantId: string | null) =>
  a.productId === productId && a.variantId === variantId;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, variant, qty = 1) =>
        set((state) => {
          const variantId = variant?.id ?? null;
          const unitPrice = product.price + (variant?.priceDelta ?? 0);
          const maxStock = variant ? variant.stock : product.stock;
          const existing = state.items.find((i) => sameLine(i, product.id, variantId));

          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, product.id, variantId)
                  ? { ...i, qty: Math.min(i.qty + qty, maxStock) }
                  : i,
              ),
            };
          }
          const item: CartItem = {
            productId: product.id,
            variantId,
            sku: variant?.sku ?? product.sku,
            name: variant ? `${product.name} · ${variant.name}` : product.name,
            image: product.images[0] ?? '',
            unitPrice,
            qty: Math.min(qty, maxStock),
            maxStock,
          };
          return { items: [...state.items, item] };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({ items: state.items.filter((i) => !sameLine(i, productId, variantId)) })),

      updateQty: (productId, variantId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              sameLine(i, productId, variantId)
                ? { ...i, qty: Math.max(0, Math.min(qty, i.maxStock)) }
                : i,
            )
            .filter((i) => i.qty > 0),
        })),

      clear: () => set({ items: [], coupon: null }),

      applyCoupon: (code, discount) => set({ coupon: { code, discount } }),
      removeCoupon: () => set({ coupon: null }),

      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.unitPrice * i.qty, 0),

      totals: (config) => {
        const subtotal = get().subtotal();
        const discount = get().coupon?.discount ?? 0;
        const base = Math.max(0, subtotal - discount);
        const shipping =
          base === 0 || base >= config.freeShippingThreshold ? 0 : config.flatShipping;
        const tax = Math.round(base * config.taxRate);
        return { subtotal, discount, shipping, tax, total: base + shipping + tax };
      },
    }),
    {
      name: 'vertice-cart', // Persistencia en localStorage
      partialize: (s) => ({ items: s.items, coupon: s.coupon }),
    },
  ),
);
