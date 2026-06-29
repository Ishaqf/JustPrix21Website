import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Native horizontal scroll (touch swipe works for free) + optional
// desktop chevron buttons that nudge the same scroll container — no
// carousel library needed for what's just a scrollable row.
const SlidingRow = ({ children }) => {
  const scrollRef = useRef(null);

  const scrollByAmount = (direction) => {
    scrollRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        aria-label="Précédent"
        className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md md:flex"
      >
        <ChevronLeft size={18} />
      </button>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none">
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        aria-label="Suivant"
        className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md md:flex"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default SlidingRow;
