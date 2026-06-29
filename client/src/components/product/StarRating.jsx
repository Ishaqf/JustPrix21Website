import { useState } from 'react';
import { Star } from 'lucide-react';

// Two modes in one component: plain display (fractional fill, e.g. a
// 4.3 average renders a 30%-filled 5th star) when no onChange is given,
// or a clickable 1-5 picker (whole stars only) when it is — used by both
// the product rating summary and the add-review form.
const StarRating = ({ value = 0, onChange, size = 16 }) => {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onChange === 'function';
  const displayValue = interactive && hovered > 0 ? hovered : value;

  return (
    <div className="inline-flex items-center gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((position) => {
        const fillPercent = Math.max(0, Math.min(1, displayValue - (position - 1))) * 100;

        const stars = (
          <span className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-(--color-muted)" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <Star size={size} className="fill-(--color-accent) text-(--color-accent)" />
            </span>
          </span>
        );

        if (!interactive) return <span key={position}>{stars}</span>;

        return (
          <button
            key={position}
            type="button"
            onClick={() => onChange(position)}
            onMouseEnter={() => setHovered(position)}
            aria-label={`${position} étoile${position > 1 ? 's' : ''}`}
          >
            {stars}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
