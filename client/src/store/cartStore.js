import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// A cart line is identified by product + variant together (same product,
// different size/color = different line) — variantId is null for products
// with no variants.
const sameLine = (a, b) => a.productId === b.productId && (a.variantId ?? null) === (b.variantId ?? null);

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      removeItem: (productId, variantId = null) => {
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, { productId, variantId })),
        }));
      },

      updateQuantity: (productId, variantId = null, quantity) => {
        set((state) => ({
          items:
            quantity > 0
              ? state.items.map((i) =>
                  sameLine(i, { productId, variantId }) ? { ...i, quantity } : i
                )
              : state.items.filter((i) => !sameLine(i, { productId, variantId })),
        }));
      },

      clearCart: () => set({ items: [] }),

      // Derived on demand rather than stored, so there's no separate piece
      // of state that addItem/removeItem/updateQuantity could forget to
      // keep in sync.
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'jp_cart' }
  )
);

export default useCartStore;
