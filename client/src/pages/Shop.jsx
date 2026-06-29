import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { getProducts } from '../api/products';
import { CATEGORIES } from '../utils/categories';
import { BRANDS_BY_CATEGORY } from '../utils/brands';
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Meilleures notes' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  // Local copies for the price inputs so typing doesn't fire a request on
  // every keystroke — committed to the URL only on "Appliquer". Re-synced
  // whenever the URL changes from elsewhere (e.g. a "reset filters" click).
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);
  useEffect(() => {
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [minPrice, maxPrice]);

  const updateParams = (updates, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value == null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const queryParams = { sort, page, limit: 12 };
  if (category) queryParams.category = category;
  if (brand) queryParams.brand = brand;
  if (search) queryParams.search = search;
  if (minPrice) queryParams.minPrice = minPrice;
  if (maxPrice) queryParams.maxPrice = maxPrice;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', 'shop', queryParams],
    queryFn: async () => {
      const res = await getProducts(queryParams);
      return res.data.data;
    },
  });

  const products = data?.products ?? [];
  const totalPages = data?.pages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside>
          <button
            type="button"
            onClick={() => updateParams({ category: '', brand: '' })}
            className="mb-3 text-sm font-semibold text-(--color-accent-dark)"
          >
            Toutes les catégories
          </button>

          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => {
              const isOpen = category === cat.value;
              return (
                <div key={cat.value}>
                  <button
                    type="button"
                    onClick={() => updateParams({ category: isOpen ? '' : cat.value, brand: '' })}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm font-medium text-(--color-ink) hover:bg-white"
                  >
                    {cat.label}
                    <ChevronDown size={14} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-1 px-2 pb-2 pl-4">
                      {BRANDS_BY_CATEGORY[cat.value].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => updateParams({ brand: brand === b ? '' : b })}
                          className={`rounded-md px-2 py-1 text-left text-sm ${
                            brand === b ? 'font-semibold text-(--color-accent-dark)' : 'text-(--color-muted)'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-black/5 pt-4">
            <p className="mb-2 text-sm font-semibold text-(--color-ink)">Prix (DA)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                placeholder="Min"
                className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
              <span className="text-(--color-muted)">–</span>
              <input
                type="number"
                min="0"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                placeholder="Max"
                className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
            </div>
            <button
              type="button"
              onClick={() => updateParams({ minPrice: minPriceInput, maxPrice: maxPriceInput })}
              className="mt-2 w-full rounded-md bg-(--color-ink) py-1.5 text-sm font-medium text-white"
            >
              Appliquer
            </button>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-(--color-muted)">
              {isLoading ? 'Chargement...' : `${total} produit${total === 1 ? '' : 's'} trouvé${total === 1 ? '' : 's'}`}
            </p>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="rounded-md border border-black/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isError && <p className="text-sm text-(--color-muted)">Impossible de charger les produits.</p>}

          {!isError && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          )}

          {!isLoading && !isError && products.length === 0 && (
            <p className="mt-4 text-sm text-(--color-muted)">Aucun produit ne correspond à ces filtres.</p>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateParams({ page: page - 1 }, false)}
                className="rounded-md border border-black/10 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="text-sm text-(--color-muted)">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: page + 1 }, false)}
                className="rounded-md border border-black/10 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
