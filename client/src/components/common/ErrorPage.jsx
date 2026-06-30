import { Link } from 'react-router-dom';
import {
  FileQuestion, AlertTriangle, ShieldOff, Clock, WifiOff, Wrench,
} from 'lucide-react';

// Single source of truth for every error state the app can show. ErrorBoundary
// (uncaught JS errors) and NotFound (Router catch-all) use this directly;
// MainLayout renders the offline and maintenance variants as full-screen
// overlays so they work regardless of which page the user is on.
const CONFIGS = {
  404: {
    icon: FileQuestion,
    title: 'Page introuvable',
    subtitle: "La page que vous cherchez n'existe pas ou a été déplacée.",
    buttons: [
      { to: '/', label: "Retour à l'accueil" },
      { to: '/shop', label: 'Voir la boutique' },
    ],
  },
  500: {
    icon: AlertTriangle,
    title: 'Une erreur est survenue',
    subtitle: 'Une erreur inattendue a interrompu la page. Rafraîchissez pour réessayer.',
    buttons: [
      { onClick: () => window.location.reload(), label: 'Rafraîchir la page' },
      { to: '/', label: "Retour à l'accueil" },
    ],
  },
  403: {
    icon: ShieldOff,
    title: 'Accès refusé',
    subtitle: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
    buttons: [{ to: '/', label: "Retour à l'accueil" }],
  },
  429: {
    icon: Clock,
    title: 'Trop de requêtes',
    subtitle: 'Vous avez effectué trop de demandes en peu de temps. Réessayez dans quelques instants.',
    buttons: [
      { onClick: () => window.location.reload(), label: 'Réessayer' },
      { to: '/', label: "Retour à l'accueil" },
    ],
  },
  offline: {
    icon: WifiOff,
    title: 'Pas de connexion',
    subtitle: 'Vous semblez hors ligne. Vérifiez votre connexion internet et réessayez.',
    buttons: [{ onClick: () => window.location.reload(), label: 'Réessayer' }],
  },
  maintenance: {
    icon: Wrench,
    title: 'En maintenance',
    subtitle: 'Le site est temporairement indisponible pour maintenance. Revenez dans quelques minutes.',
    buttons: [],
  },
};

const ErrorPage = ({ type = '404' }) => {
  const config = CONFIGS[type] ?? CONFIGS['404'];
  const Icon = config.icon;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--color-cream) px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon size={36} className="text-(--color-accent)" />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-(--color-ink)">{config.title}</h1>
      <p className="mt-3 max-w-sm text-(--color-muted)">{config.subtitle}</p>
      {config.buttons.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {config.buttons.map((btn, i) =>
            btn.to ? (
              <Link
                key={i}
                to={btn.to}
                className={
                  i === 0
                    ? 'rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark)'
                    : 'rounded-full border border-black/10 bg-white px-6 py-2.5 text-sm font-semibold text-(--color-ink) hover:bg-white/80'
                }
              >
                {btn.label}
              </Link>
            ) : (
              <button
                key={i}
                type="button"
                onClick={btn.onClick}
                className={
                  i === 0
                    ? 'rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark)'
                    : 'rounded-full border border-black/10 bg-white px-6 py-2.5 text-sm font-semibold text-(--color-ink) hover:bg-white/80'
                }
              >
                {btn.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorPage;
