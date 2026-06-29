import { Link } from 'react-router-dom';

// Real locked logo art landed in public/ (Step 17) — pill.png is the
// compact wordmark-only crop, used here for Navbar/Footer. className
// controls size from the call site (e.g. h-10 default, larger on Home's
// hero) — aspect-ratio is fixed so it never lays out distorted.
const Logo = ({ className = 'h-10' }) => (
  <Link to="/" className="inline-flex items-center">
    <img src="/pill.png" alt="JustPrix21" className={`w-auto ${className}`} style={{ aspectRatio: '1840 / 896' }} />
  </Link>
);

export default Logo;
