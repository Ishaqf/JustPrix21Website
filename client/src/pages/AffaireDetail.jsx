import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getReel, getReels } from '../api/reels';
import useCartStore from '../store/cartStore';
import useToastStore from '../store/toastStore';
import ProductCard from '../components/product/ProductCard';
import ReelCard, { ReelCardSkeleton } from '../components/reel/ReelCard';

const AffaireDetail = () => {
  const { id } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.showToast);

  const {
    data: reel,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['reel', id],
    queryFn: async () => {
      const res = await getReel(id);
      return res.data.data;
    },
  });

  // Instagram's embed script replaces the <blockquote> with a real iframe,
  // but only once instgrm.Embeds.process() runs — and that has to happen
  // AFTER the script has finished loading, whichever of "script loads" or
  // "reel data renders the blockquote" happens to finish first.
  useEffect(() => {
    if (!reel) return;

    const processEmbed = () => window.instgrm?.Embeds?.process();

    if (window.instgrm) {
      processEmbed();
      return;
    }

    let script = document.getElementById('instagram-embed-script');
    if (!script) {
      script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener('load', processEmbed);
    return () => script.removeEventListener('load', processEmbed);
  }, [reel]);

  const { data: otherReelsData, isLoading: otherReelsLoading } = useQuery({
    queryKey: ['reels'],
    queryFn: async () => {
      const res = await getReels();
      return res.data.data;
    },
  });
  const otherReels = (otherReelsData ?? []).filter((r) => r._id !== id);

  const handleAddAllToCart = () => {
    if (!reel) return;
    let added = 0;
    let skipped = 0;

    reel.products.forEach((product) => {
      if (product.stock > 0) {
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
        added += 1;
      } else {
        skipped += 1;
      }
    });

    if (added > 0) showToast('success', `${added} produit${added > 1 ? 's' : ''} ajouté${added > 1 ? 's' : ''} au panier`);
    if (skipped > 0) showToast('info', `${skipped} produit${skipped > 1 ? 's' : ''} indisponible${skipped > 1 ? 's' : ''}`);
  };

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-8 text-(--color-muted)">Chargement...</div>;
  }

  if (isError || !reel) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-(--color-ink)">Affaire introuvable.</p>
        <Link to="/" className="mt-2 inline-block text-sm font-semibold text-(--color-accent-dark)">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex justify-center">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={reel.instagramUrl}
            data-instgrm-version="14"
            style={{ minWidth: '300px', maxWidth: '500px', width: '100%', margin: '0 auto' }}
          >
            <a href={reel.instagramUrl} target="_blank" rel="noopener noreferrer">
              Voir cette publication sur Instagram
            </a>
          </blockquote>
        </div>

        <div>
          <span className="inline-block rounded-full bg-(--color-accent) px-3 py-1 text-xs font-semibold text-white">
            {reel.badge}
          </span>
          <h1 className="mt-2 text-2xl font-bold text-(--color-ink)">{reel.title}</h1>

          <button
            type="button"
            onClick={handleAddAllToCart}
            className="mt-4 rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark)"
          >
            Tout ajouter au panier
          </button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-(--color-ink)">Produits de cette affaire</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {reel.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      {(otherReelsLoading || otherReels.length > 0) && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-(--color-ink)">Autres affaires</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {otherReelsLoading
              ? Array.from({ length: 4 }).map((_, i) => <ReelCardSkeleton key={i} />)
              : otherReels.map((r) => <ReelCard key={r._id} reel={r} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AffaireDetail;
