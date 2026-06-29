import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/formatters';

const PAYMENT_BADGES = ['Paiement à la livraison', 'BaridiMob', 'CCP'];

const Cart = () => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingBag size={48} className="mx-auto text-(--color-muted)" />
        <p className="mt-4 text-lg font-semibold text-(--color-ink)">Votre panier est vide</p>
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
      <h1 className="mb-6 text-2xl font-bold text-(--color-ink)">Mon panier</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId ?? 'base'}`}
              className="flex gap-4 rounded-xl bg-white p-4 shadow-sm"
            >
              <Link to={`/products/${item.productId}`} className="shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-(--color-cream)" />
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/products/${item.productId}`} className="text-sm font-semibold text-(--color-ink)">
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.variantId)}
                    aria-label="Retirer du panier"
                    className="text-(--color-muted) hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-black/10 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      aria-label="Diminuer la quantité"
                      className="text-(--color-ink) hover:text-(--color-accent-dark)"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      aria-label="Augmenter la quantité"
                      className="text-(--color-ink) hover:text-(--color-accent-dark)"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-semibold text-(--color-accent-dark)">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-(--color-ink)">Résumé de la commande</h2>
          <div className="flex justify-between text-sm text-(--color-muted)">
            <span>Sous-total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <p className="mt-1 text-xs text-(--color-muted)">Frais de livraison calculés à l'étape suivante.</p>

          <div className="mt-4 flex justify-between border-t border-black/5 pt-4 text-base font-bold text-(--color-ink)">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-5 w-full rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-white hover:bg-(--color-accent-dark)"
          >
            Passer la commande
          </button>

          <div className="mt-4 flex flex-wrap gap-2">
            {PAYMENT_BADGES.map((label) => (
              <span
                key={label}
                className="rounded-full bg-(--color-cream) px-3 py-1 text-xs font-medium text-(--color-muted)"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
