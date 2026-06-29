import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Minus, Plus, ImageOff } from 'lucide-react';
import { getProduct, getProducts } from '../api/products';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useWishlist from '../hooks/useWishlist';
import useToastStore from '../store/toastStore';
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard';
import SlidingRow from '../components/common/SlidingRow';
import StarRating from '../components/product/StarRating';
import SpecsTable from '../components/product/SpecsTable';
import ReviewsSection from '../components/product/ReviewsSection';
import { formatPrice } from '../utils/formatters';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isWishlisted, toggle } = useWishlist();
  const showToast = useToastStore((s) => s.showToast);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await getProduct(slug);
      return res.data.data;
    },
  });

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setSelectedSize(null);
    setSelectedColor(null);
  }, [slug]);

  useEffect(() => {
    if (product?.variants?.length > 0 && selectedSize === null && selectedColor === null) {
      setSelectedSize(product.variants[0].size || null);
      setSelectedColor(product.variants[0].color || null);
    }
  }, [product, selectedSize, selectedColor]);

  const { data: relatedData, isLoading: relatedLoading } = useQuery({
    queryKey: ['products', 'related', product?.category],
    queryFn: async () => {
      const res = await getProducts({ category: product.category, limit: 9 });
      return res.data.data;
    },
    enabled: !!product?.category,
  });

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-8 text-(--color-muted)">Chargement...</div>;
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-(--color-ink)">Produit introuvable.</p>
        <Link to="/shop" className="mt-2 inline-block text-sm font-semibold text-(--color-accent-dark)">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const hasVariants = product.variants?.length > 0;
  const sizes = [...new Set(product.variants?.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(product.variants?.map((v) => v.color).filter(Boolean))];
  const selectedVariant = hasVariants
    ? product.variants.find((v) => (v.size || null) === selectedSize && (v.color || null) === selectedColor)
    : null;
  const availableStock = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock;
  const onSale = product.salePrice !== null && product.salePrice < product.price;

  const stockLabel =
    availableStock <= 0 ? 'Rupture de stock' : availableStock <= 5 ? `Stock limité (${availableStock} restants)` : 'En stock';
  const stockColor = availableStock <= 0 ? 'text-red-600' : availableStock <= 5 ? 'text-amber-600' : 'text-green-700';

  const wishlisted = isWishlisted(product._id);
  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      showToast('info', 'Connectez-vous pour ajouter des produits à vos favoris');
      navigate('/login');
      return;
    }
    toggle(product);
  };

  const handleAddToCart = () => {
    if (availableStock <= 0) return;
    addItem(
      {
        productId: product._id,
        variantId: selectedVariant?._id || null,
        name: product.name,
        image: product.thumbnail,
        price: product.effectivePrice,
      },
      quantity
    );
    showToast('success', 'Produit ajouté au panier');
  };

  const relatedProducts = (relatedData?.products ?? []).filter((p) => p._id !== product._id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white">
            {product.images?.length ? (
              <img src={product.images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ImageOff size={48} className="text-(--color-muted)" />
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-md border-2 ${
                    i === activeImage ? 'border-(--color-accent)' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-(--color-muted)">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-bold text-(--color-ink)">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            <StarRating value={product.rating} size={16} />
            <span className="text-sm text-(--color-muted)">({product.numReviews})</span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-bold text-(--color-accent-dark)">{formatPrice(product.effectivePrice)}</span>
            {onSale && <span className="text-base text-(--color-muted) line-through">{formatPrice(product.price)}</span>}
          </div>

          <p className={`mt-2 text-sm font-medium ${stockColor}`}>{stockLabel}</p>

          {hasVariants && sizes.length > 0 && (
            <div className="mt-4">
              <p className="mb-1 text-sm font-medium text-(--color-ink)">Stockage</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      selectedSize === size
                        ? 'border-(--color-accent) bg-(--color-accent) text-white'
                        : 'border-black/10 text-(--color-ink)'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasVariants && colors.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-sm font-medium text-(--color-ink)">Couleur</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      selectedColor === color
                        ? 'border-(--color-accent) bg-(--color-accent) text-white'
                        : 'border-black/10 text-(--color-ink)'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center rounded-md border border-black/10">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2"
                aria-label="Diminuer la quantité"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                className="px-3 py-2"
                aria-label="Augmenter la quantité"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
              className="flex-1 rounded-full bg-(--color-accent) py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark) disabled:opacity-40"
            >
              Ajouter au panier
            </button>

            <button
              type="button"
              onClick={handleWishlistClick}
              aria-label="Ajouter aux favoris"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10"
            >
              <Heart size={18} className={wishlisted ? 'fill-(--color-accent) text-(--color-accent)' : 'text-(--color-ink)'} />
            </button>
          </div>

          {product.warrantyMonths > 0 && (
            <p className="mt-3 text-xs text-(--color-muted)">Garantie : {product.warrantyMonths} mois</p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex gap-6 border-b border-black/10">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`pb-2 text-sm font-semibold ${
              activeTab === 'description' ? 'border-b-2 border-(--color-accent) text-(--color-ink)' : 'text-(--color-muted)'
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 text-sm font-semibold ${
              activeTab === 'reviews' ? 'border-b-2 border-(--color-accent) text-(--color-ink)' : 'text-(--color-muted)'
            }`}
          >
            Avis ({product.numReviews})
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'description' ? (
            <div>
              <p className="whitespace-pre-line text-sm text-(--color-muted)">{product.description}</p>
              <div className="mt-4">
                <SpecsTable specs={product.specs} />
              </div>
            </div>
          ) : (
            <ReviewsSection productId={product._id} />
          )}
        </div>
      </div>

      {(relatedLoading || relatedProducts.length > 0) && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-(--color-ink)">Produits similaires</h2>
          <SlidingRow>
            {relatedLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-44 shrink-0">
                    <ProductCardSkeleton />
                  </div>
                ))
              : relatedProducts.map((p) => (
                  <div key={p._id} className="w-44 shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
          </SlidingRow>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
