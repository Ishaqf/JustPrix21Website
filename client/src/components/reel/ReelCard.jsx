import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import Skeleton from '../common/Skeleton';

// Reels have no stored thumbnail (Instagram embeds don't give us one) —
// every card uses a dark placeholder box + play icon instead of a real
// image, by design, not as a fallback.
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

const ReelCard = ({ reel, variant = 'full' }) => {
  if (variant === 'compact') {
    return (
      <Link to={`/affaires/${reel._id}`} className="flex items-center gap-3 rounded-lg p-1 hover:bg-black/5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-(--color-ink)">
          <Play size={20} className="fill-white text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <BadgePill badge={reel.badge} />
          <p className="mt-1 truncate text-sm font-medium text-(--color-ink)">{reel.title}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/affaires/${reel._id}`} className="group block">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-(--color-ink)">
        <Play size={40} className="fill-white text-white transition-transform group-hover:scale-110" />
        <span className="absolute left-2 top-2">
          <BadgePill badge={reel.badge} />
        </span>
      </div>
      <p className="mt-2 truncate text-sm font-medium text-(--color-ink)">{reel.title}</p>
    </Link>
  );
};

export default ReelCard;
