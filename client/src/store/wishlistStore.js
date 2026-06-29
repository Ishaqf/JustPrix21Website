import { create } from 'zustand';

// No persist middleware here on purpose: the wishlist is account-bound
// server data (lives on the User document), not a guest-friendly local
// concept like the cart. Persisting it to localStorage would let it leak
// across accounts on a shared browser; useWishlist's fetchWishlist() is
// the real source of truth on every load/login instead.
const useWishlistStore = create((set, get) => ({
  items: [],
  isLoaded: false,

  setItems: (items) => set({ items, isLoaded: true }),

  isWishlisted: (productId) => get().items.some((p) => p._id === productId),

  optimisticAdd: (product) => {
    set((state) =>
      state.items.some((p) => p._id === product._id) ? state : { items: [...state.items, product] }
    );
  },

  optimisticRemove: (productId) => {
    set((state) => ({ items: state.items.filter((p) => p._id !== productId) }));
  },
}));

export default useWishlistStore;
