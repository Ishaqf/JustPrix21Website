import { useCallback } from 'react';
import useWishlistStore from '../store/wishlistStore';
import useToastStore from '../store/toastStore';
import * as wishlistApi from '../api/wishlist';

// Optimistic add/remove: update local state immediately for a snappy UI,
// reconcile with the server's response on success, roll back on failure.
const useWishlist = () => {
  const items = useWishlistStore((s) => s.items);
  const isLoaded = useWishlistStore((s) => s.isLoaded);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);
  const setItems = useWishlistStore((s) => s.setItems);
  const optimisticAdd = useWishlistStore((s) => s.optimisticAdd);
  const optimisticRemove = useWishlistStore((s) => s.optimisticRemove);
  const showToast = useToastStore((s) => s.showToast);

  const fetchWishlist = useCallback(async () => {
    try {
      const { data } = await wishlistApi.getWishlist();
      setItems(data);
    } catch {
      // Not logged in / request failed — leave the wishlist empty.
    }
  }, [setItems]);

  const add = useCallback(
    async (product) => {
      optimisticAdd(product);
      try {
        const { data } = await wishlistApi.addToWishlist(product._id);
        setItems(data);
      } catch {
        optimisticRemove(product._id);
        showToast('error', "Impossible d'ajouter ce produit à la liste de souhaits");
      }
    },
    [optimisticAdd, optimisticRemove, setItems, showToast]
  );

  const remove = useCallback(
    async (productId) => {
      const previous = useWishlistStore.getState().items;
      optimisticRemove(productId);
      try {
        const { data } = await wishlistApi.removeFromWishlist(productId);
        setItems(data);
      } catch {
        setItems(previous);
        showToast('error', 'Impossible de retirer ce produit de la liste de souhaits');
      }
    },
    [optimisticRemove, setItems, showToast]
  );

  const toggle = useCallback(
    (product) => (isWishlisted(product._id) ? remove(product._id) : add(product)),
    [isWishlisted, add, remove]
  );

  return { items, isLoaded, isWishlisted, add, remove, toggle, fetchWishlist };
};

export default useWishlist;
