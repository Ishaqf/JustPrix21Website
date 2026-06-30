import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import Skeleton from '../common/Skeleton';

export const ReelCardSkeleton = ({ variant = 'full' }) =>
  variant === 'compact' ? (
    <div className="flex items-center gap-3">
      <Skeleton className="h-16 w-16 shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-2 h-4 w-full" />
      </div>
    </div>
  ) : (
    <div>
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );

const BadgePill = ({ badge }) => (
  <span className="inline-block rounded-full bg-(--color-accent) px-2 py-0.5 text-[10px] font-semibold text-white">
    {badge}
  </span>
);

// Thumbnail area shared by both variants: shows the cover image when set,
// falls back to the dark placeholder + play icon when not.
const Thumbnail = ({ thumbnailUrl, size = 'full' }) => {
  const isCompact = size === 'compact';
  const base = isCompact
    ? 'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl'
    : 'relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]';

  return (
    <div className={`${base} bg-(--color-ink)`}>
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      ) : null}
      <Play
        size={isCompact ? 20 : 40}
        className="relative z-10 fill-white text-white transition-transform duration-200 group-hover:scale-110 drop-shadow"
      />
    </div>
  );
};

const ReelCard = ({ reel, variant = 'full' }) => {
  if (variant === 'compact') {
    return (
      <Link to={`/affaires/${reel._id}`} className="group flex items-center gap-3 rounded-xl p-2 transition-all duration-150 hover:bg-(--color-cream)">
        <Thumbnail thumbnailUrl={reel.thumbnailUrl} size="compact" />
        <div className="min-w-0 flex-1">
          <BadgePill badge={reel.badge} />
          <p className="mt-1 truncate text-sm font-medium text-(--color-ink)">{reel.title}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/affaires/${reel._id}`} className="group block">
      <div className="relative">
        <Thumbnail thumbnailUrl={reel.thumbnailUrl} size="full" />
        <span className="absolute left-2 top-2 z-20">
          <BadgePill badge={reel.badge} />
        </span>
      </div>
      <p className="mt-2 truncate text-sm font-medium text-(--color-ink)">{reel.title}</p>
    </Link>
  );
};

export default ReelCard;
