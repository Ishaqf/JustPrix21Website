import { Link, useNavigate } from 'react-router-dom';
import { Heart, ImageOff } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useWishlist from '../../hooks/useWishlist';
import useToastStore from '../../store/toastStore';
import Skeleton from '../common/Skeleton';
import { formatPrice } from '../../utils/formatters';

export const ProductCardSkeleton = () => (
  <div className="rounded-[18px] bg-white p-3.5 shadow-[0_6px_24px_rgba(26,26,26,0.06)]">
    <Skeleton className="aspect-square w-full rounded-xl" />
    <Skeleton className="mt-3 h-4 w-3/4" />
    <Skeleton className="mt-2 h-4 w-1/3" />
  </div>
);

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isWishlisted, toggle } = useWishlist();
  const showToast = useToastStore((s) => s.showToast);

  const onSale = product.salePrice !== null && product.salePrice < product.price;
  const wishlisted = isWishlisted(product._id);
  const outOfStock = product.stock <= 0;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('info', 'Connectez-vous pour ajouter des produits à vos favoris');
      navigate('/login');
      return;
    }
    toggle(product);
  };

  return (
    <Link to={`/products/${product.slug || product._id}`} className="group block w-full">
      {/* Card lifts as a whole unit on hover — image + text move together */}
      <div className="rounded-[18px] bg-white p-3.5 shadow-[0_6px_24px_rgba(26,26,26,0.06)] transition-all duration-200 group-hover:-translate-y-1.5 group-hover:shadow-[0_16px_36px_rgba(26,26,26,0.13)]">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-(--color-cream)">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ImageOff size={32} className="text-(--color-muted)" />
          )}

          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label="Ajouter aux favoris"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
          >
            <Heart
              size={16}
              className={wishlisted ? 'fill-(--color-accent) text-(--color-accent)' : 'text-(--color-ink)'}
            />
          </button>

          {onSale && (
            <span className="absolute left-2 top-2 rounded-full bg-(--color-accent) px-2 py-0.5 text-[10px] font-bold text-white">
              Promo
            </span>
          )}

          {outOfStock && (
            <span className="absolute bottom-2 left-2 rounded-md bg-(--color-ink) px-2 py-1 text-[10px] font-semibold text-white">
              Rupture de stock
            </span>
          )}
        </div>

        <p className="mt-3 truncate text-sm font-semibold text-(--color-ink)">{product.name}</p>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-bold text-(--color-accent-dark)">
            {formatPrice(product.effectivePrice ?? product.price)}
          </span>
          {onSale && (
            <span className="text-xs text-(--color-muted) line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
