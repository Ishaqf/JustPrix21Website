import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { CATEGORIES } from '../../utils/categories';
import { SHOP_INFO } from '../../utils/shopInfo';

const Footer = () => (
  <footer className="border-t border-black/5 bg-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
      <div>
        <Logo />
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          JustPrix21 — votre boutique d'électronique en Algérie : téléphones,
          accessoires, téléviseurs, consoles de jeux et ordinateurs portables
          au meilleur prix.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Catégories</h3>
        <ul className="space-y-2">
          {CATEGORIES.map((cat) => (
            <li key={cat.value}>
              <Link
                to={`/shop?category=${cat.value}`}
                className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-dark)]"
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Liens rapides</h3>
        <ul className="space-y-2">
          <li>
            <Link to="/" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-dark)]">
              Accueil
            </Link>
          </li>
          <li>
            <Link to="/shop" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-dark)]">
              Boutique
            </Link>
          </li>
          <li>
            <Link to="/suivi-commande" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-dark)]">
              Suivre ma commande
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Contact</h3>
        {/* Placeholder values from utils/shopInfo.js until the client
            provides real details. */}
        <ul className="space-y-2 text-sm text-[var(--color-muted)]">
          <li>{SHOP_INFO.phone}</li>
          <li>{SHOP_INFO.email}</li>
          <li>{SHOP_INFO.address}</li>
        </ul>
      </div>
    </div>

    <div className="border-t border-black/5 px-4 py-4 text-center text-xs text-[var(--color-muted)]">
      © {new Date().getFullYear()} JustPrix21. Tous droits réservés.
    </div>
  </footer>
);

export default Footer;
