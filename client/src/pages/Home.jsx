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
      {/* Aurora hero — full-width so blobs bleed to viewport edges */}
      <div className="relative overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div style={{ position:'absolute', width:'560px', height:'560px', borderRadius:'50%', top:'-170px', left:'-130px', background:'radial-gradient(circle,#D9A98A,transparent 70%)', filter:'blur(70px)', opacity:0.48, animation:'jp-drift-1 20s ease-in-out infinite' }} />
          <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', top:'90px', right:'-150px', background:'radial-gradient(circle,#C08F6E,transparent 70%)', filter:'blur(80px)', opacity:0.36, animation:'jp-drift-2 26s ease-in-out infinite' }} />
          <div style={{ position:'absolute', width:'540px', height:'540px', borderRadius:'50%', bottom:'-190px', left:'32%', background:'radial-gradient(circle,#E9C6AE,transparent 70%)', filter:'blur(90px)', opacity:0.42, animation:'jp-drift-3 30s ease-in-out infinite' }} />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <Logo className="h-20" />
              <p className="mt-5 max-w-md text-lg leading-relaxed text-(--color-muted)">
                Téléphones, accessoires, téléviseurs, consoles et ordinateurs portables — au juste prix,
                livrés partout en Algérie.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-block rounded-[14px] bg-(--color-accent) px-7 py-3 text-base font-bold text-white shadow-[0_8px_22px_rgba(192,143,110,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--color-accent-dark) hover:shadow-[0_12px_28px_rgba(192,143,110,0.45)]"
              >
                Découvrir la boutique
              </Link>

              <h2 className="mt-10 mb-4 text-xl font-bold text-(--color-ink)">Produits en vedette</h2>
              {productsError && <p className="text-sm text-(--color-muted)">Impossible de charger les produits.</p>}
              {!productsError && (
                <SlidingRow>
                  {productsLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-52 shrink-0">
                          <ProductCardSkeleton />
                        </div>
                      ))
                    : featuredProducts.slice(0, 8).map((product) => (
                        <div key={product._id} className="w-52 shrink-0">
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
              <h2 className="mb-3 text-xl font-bold text-(--color-ink)">Vu sur Instagram</h2>
              {reelsError && <p className="text-sm text-(--color-muted)">Impossible de charger les affaires.</p>}
              {!reelsError && (
                <div className="flex h-128 flex-col gap-1 overflow-y-auto rounded-2xl bg-white p-3 shadow-sm scrollbar-none">
                  {reelsLoading
                    ? Array.from({ length: 4 }).map((_, i) => <ReelCardSkeleton key={i} variant="compact" />)
                    : activeReels.map((reel) => (
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
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-xl font-bold text-(--color-ink)">Catégories</h2>
        <CategoryGrid />
      </section>

      {(reelsLoading || activeReels.length > 0) && !reelsError && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="mb-4 text-xl font-bold text-(--color-ink)">Affaires en cours</h2>
          <SlidingRow>
            {reelsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-72 shrink-0">
                    <ReelCardSkeleton />
                  </div>
                ))
              : activeReels.map((reel) => (
                  <div key={reel._id} className="w-72 shrink-0">
                    <ReelCard reel={reel} />
                  </div>
                ))}
          </SlidingRow>
        </section>
      )}

      {(productsLoading || featuredProducts.length > 0) && !productsError && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="mb-4 text-xl font-bold text-(--color-ink)">Tous les produits vedettes</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {productsLoading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-xl font-bold text-(--color-ink)">Pourquoi JustPrix21</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
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
