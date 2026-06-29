import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import useWishlist from '../hooks/useWishlist';
import useCartStore from '../store/cartStore';
import useToastStore from '../store/toastStore';
import { formatPrice } from '../utils/formatters';

const Wishlist = () => {
  const { items, isLoaded, fetchWishlist, remove, clearAll } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const moveToCart = (product) => {
    addItem(
      {
        productId: product._id,
        variantId: null,
        name: product.name,
        image: product.thumbnail,
        price: product.effectivePrice,
      },
      1
    );
    remove(product._id);
    showToast('success', 'Produit déplacé vers le panier');
  };

  if (isLoaded && items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Heart size={48} className="mx-auto text-(--color-muted)" />
        <p className="mt-4 text-lg font-semibold text-(--color-ink)">Votre liste de souhaits est vide</p>
        <Link
          to="/shop"
          className="mt-4 inline-block rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark)"
        >
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-(--color-ink)">Ma liste de souhaits</h1>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-medium text-(--color-muted) hover:text-red-600"
          >
            Tout supprimer
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((product) => (
          <div key={product._id} className="rounded-xl bg-white p-4 shadow-sm">
            <Link to={`/products/${product.slug || product._id}`}>
              {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.name} className="aspect-square w-full rounded-lg object-cover" />
              ) : (
                <div className="aspect-square w-full rounded-lg bg-(--color-cream)" />
              )}
            </Link>
            <Link to={`/products/${product.slug || product._id}`} className="mt-2 block text-sm font-medium text-(--color-ink)">
              {product.name}
            </Link>
            <p className="mt-1 font-semibold text-(--color-accent-dark)">{formatPrice(product.effectivePrice ?? product.price)}</p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => moveToCart(product)}
                disabled={product.stock <= 0}
                aria-label="Déplacer vers le panier"
                className="flex flex-1 items-center justify-center gap-1 rounded-full bg-(--color-accent) px-3 py-2 text-xs font-semibold text-white hover:bg-(--color-accent-dark) disabled:opacity-50"
              >
                <ShoppingCart size={14} />
                Au panier
              </button>
              <button
                type="button"
                onClick={() => remove(product._id)}
                aria-label="Retirer de la liste de souhaits"
                className="rounded-full border border-black/10 p-2 text-(--color-muted) hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
