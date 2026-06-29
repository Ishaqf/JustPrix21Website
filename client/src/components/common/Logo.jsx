import { Link } from 'react-router-dom';

// No final logo art yet (client hasn't provided client/public/logo.svg) —
// this is a CSS wordmark built straight from the brand spec: ink-black
// "JustPrix" text with a small terracotta "21" stamp. Swap for <img> once
// the real files land, same as noted in CLAUDE.md.
const Logo = ({ className = '' }) => (
  <Link
    to="/"
    className={`flex items-center gap-1 text-2xl font-extrabold text-[var(--color-ink)] ${className}`}
  >
    JustPrix
    <span className="rounded-md bg-[var(--color-accent)] px-1.5 py-0.5 text-base leading-none text-white">
      21
    </span>
  </Link>
);

export default Logo;
