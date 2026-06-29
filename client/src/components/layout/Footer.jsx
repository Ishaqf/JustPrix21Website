import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Logo from '../common/Logo';
import { CATEGORIES } from '../../utils/categories';
import { SHOP_INFO } from '../../utils/shopInfo';

const Footer = () => (
  <footer className="border-t border-black/5 bg-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
      <div>
        <Logo />
        <p className="mt-3 text-sm text-(--color-muted)">
          JustPrix21 — votre boutique d'électronique en Algérie : téléphones,
          accessoires, téléviseurs, consoles de jeux et ordinateurs portables
          au meilleur prix.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-(--color-ink)">Catégories</h3>
        <ul className="space-y-2">
          {CATEGORIES.map((cat) => (
            <li key={cat.value}>
              <Link
                to={`/shop?category=${cat.value}`}
                className="text-sm text-(--color-muted) hover:text-(--color-accent-dark)"
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-(--color-ink)">Liens rapides</h3>
        <ul className="space-y-2">
          <li>
            <Link to="/" className="text-sm text-(--color-muted) hover:text-(--color-accent-dark)">
              Accueil
            </Link>
          </li>
          <li>
            <Link to="/shop" className="text-sm text-(--color-muted) hover:text-(--color-accent-dark)">
              Boutique
            </Link>
          </li>
          <li>
            <Link to="/suivi-commande" className="text-sm text-(--color-muted) hover:text-(--color-accent-dark)">
              Suivre ma commande
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-(--color-ink)">Contact</h3>
        <ul className="space-y-2 text-sm text-(--color-muted)">
          <li>{SHOP_INFO.address}</li>
          <li>
            <a href={SHOP_INFO.phoneHref} className="hover:text-(--color-accent-dark)">
              {SHOP_INFO.phone}
            </a>
          </li>
          <li>
            <a href={SHOP_INFO.phoneAltHref} className="hover:text-(--color-accent-dark)">
              {SHOP_INFO.phoneAlt}
            </a>
          </li>
          <li>
            <a
              href={SHOP_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-(--color-accent-dark)"
            >
              <MapPin size={14} />
              Voir sur la carte
            </a>
          </li>
        </ul>
        <div className="mt-4 flex gap-4 text-sm">
          <a href={SHOP_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-(--color-muted) hover:text-(--color-accent-dark)">
            Instagram
          </a>
          <a href={SHOP_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-(--color-muted) hover:text-(--color-accent-dark)">
            Facebook
          </a>
        </div>
      </div>
    </div>

    <div className="border-t border-black/5 px-4 py-4 text-center text-xs text-(--color-muted)">
      © {new Date().getFullYear()} JustPrix21. Tous droits réservés.
    </div>
  </footer>
);

export default Footer;
