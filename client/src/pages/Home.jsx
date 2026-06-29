import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Truck, ShieldCheck, Wallet, MapPin } from 'lucide-react';
import Logo from '../components/common/Logo';
import SlidingRow from '../components/common/SlidingRow';
import CategoryGrid from '../components/common/CategoryGrid';
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard';
import ReelCard, { ReelCardSkeleton } from '../components/reel/ReelCard';
import { getProducts } from '../api/products';
import { getReels } from '../api/reels';
import { SHOP_INFO, WHATSAPP_URL } from '../utils/shopInfo';

const VALUE_PROPS = [
  {
    icon: Wallet,
    title: 'Paiement à la livraison',
    text: 'Payez en toute confiance à la réception de votre commande.',
  },
  {
    icon: Truck,
    title: 'Livraison partout en Algérie',
    text: 'À domicile ou en stop-desk, selon ce qui vous convient.',
  },
  {
    icon: ShieldCheck,
    title: 'Produits garantis',
    text: 'Neufs ou reconditionnés, toujours avec garantie.',
  },
];

const Home = () => {
  const { data: productsData, isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await getProducts({ isFeatured: true });
      return res.data.data;
    },
  });

  const { data: reels, isLoading: reelsLoading, isError: reelsError } = useQuery({
    queryKey: ['reels'],
    queryFn: async () => {
      const res = await getReels();
      return res.data.data;
    },
  });

  const featuredProducts = productsData?.products ?? [];
  const activeReels = reels ?? [];

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Logo className="h-16" />
            <p className="mt-4 max-w-md text-(--color-muted)">
              Téléphones, accessoires, téléviseurs, consoles et ordinateurs portables — au juste prix,
              livrés partout en Algérie.
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-block rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark)"
            >
              Découvrir la boutique
            </Link>

            <h2 className="mt-10 mb-4 text-lg font-bold text-(--color-ink)">Produits en vedette</h2>
            {productsError && <p className="text-sm text-(--color-muted)">Impossible de charger les produits.</p>}
            {!productsError && (
              <SlidingRow>
                {productsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="w-44 shrink-0">
                        <ProductCardSkeleton />
                      </div>
                    ))
                  : featuredProducts.slice(0, 8).map((product) => (
                      <div key={product._id} className="w-44 shrink-0">
                        <ProductCard product={product} />
                      </div>
                    ))}
              </SlidingRow>
            )}
            {!productsLoading && !productsError && featuredProducts.length === 0 && (
              <p className="text-sm text-(--color-muted)">Aucun produit en vedette pour le moment.</p>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold text-(--color-ink)">Vu sur Instagram</h2>
            {reelsError && <p className="text-sm text-(--color-muted)">Impossible de charger les affaires.</p>}
            {!reelsError && (
              <div className="flex flex-col gap-2">
                {reelsLoading
                  ? Array.from({ length: 4 }).map((_, i) => <ReelCardSkeleton key={i} variant="compact" />)
                  : activeReels.slice(0, 5).map((reel) => (
                      <ReelCard key={reel._id} reel={reel} variant="compact" />
                    ))}
              </div>
            )}
            {!reelsLoading && !reelsError && activeReels.length === 0 && (
              <p className="text-sm text-(--color-muted)">Aucune affaire en cours pour le moment.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-lg font-bold text-(--color-ink)">Catégories</h2>
        <CategoryGrid />
      </section>

      {(reelsLoading || activeReels.length > 0) && !reelsError && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="mb-4 text-lg font-bold text-(--color-ink)">Affaires en cours</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {reelsLoading
              ? Array.from({ length: 4 }).map((_, i) => <ReelCardSkeleton key={i} />)
              : activeReels.map((reel) => <ReelCard key={reel._id} reel={reel} />)}
          </div>
        </section>
      )}

      {(productsLoading || featuredProducts.length > 0) && !productsError && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="mb-4 text-lg font-bold text-(--color-ink)">Tous les produits vedettes</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {productsLoading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-lg font-bold text-(--color-ink)">Pourquoi JustPrix21</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl bg-white p-5 shadow-sm">
              <Icon size={24} className="text-(--color-accent-dark)" />
              <p className="mt-3 font-semibold text-(--color-ink)">{title}</p>
              <p className="mt-1 text-sm text-(--color-muted)">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-(--color-ink)">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Une question avant de commander ?</h2>
            <p className="mt-1 text-sm text-white/70">{SHOP_INFO.address}</p>
            <a
              href={SHOP_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
            >
              <MapPin size={14} />
              Voir sur la carte
            </a>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark)"
          >
            Discuter sur WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
