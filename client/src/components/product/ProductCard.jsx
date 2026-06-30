import { Link, useNavigate } from 'react-router-dom';
import { Heart, ImageOff } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useWishlist from '../../hooks/useWishlist';
import useToastStore from '../../store/toastStore';
import Skeleton from '../common/Skeleton';
import { formatPrice } from '../../utils/formatters';

export const ProductCardSkeleton = () => (
  <div className="w-full">
    <Skeleton className="aspect-square w-full" />
    <Skeleton className="mt-2 h-4 w-3/4" />
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
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
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

      <p className="mt-2.5 truncate text-sm font-medium text-(--color-ink)">{product.name}</p>

      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm font-bold text-(--color-accent-dark)">
          {formatPrice(product.effectivePrice ?? product.price)}
        </span>
        {onSale && (
          <span className="text-xs text-(--color-muted) line-through">{formatPrice(product.price)}</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
