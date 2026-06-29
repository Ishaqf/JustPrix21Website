import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import Logo from '../common/Logo';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useWishlist from '../../hooks/useWishlist';
import { CATEGORIES } from '../../utils/categories';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const totalItems = useCartStore((s) => s.totalItems());
  const { items: wishlistItems, fetchWishlist, reset: resetWishlist } = useWishlist();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);

  // Wishlist badge needs live data — this is the one place that calls
  // fetchWishlist() (nothing did in Step 15). Re-syncs on every auth
  // change and clears the local copy on logout so it doesn't leak into
  // the next session on a shared browser.
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      resetWishlist();
    }
  }, [isAuthenticated, fetchWishlist, resetWishlist]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setIsCategoriesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(searchTerm ? `/shop?search=${encodeURIComponent(searchTerm)}` : '/shop');
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--color-cream)]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Logo />

        <form onSubmit={handleSearchSubmit} className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-md">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full rounded-full border border-black/10 bg-white px-4 py-2 pr-10 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            <button
              type="submit"
              aria-label="Rechercher"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        <div className="flex-1 md:hidden" />

        <div className="hidden items-center gap-5 md:flex">
          <Link to="/cart" className="relative text-[var(--color-ink)]" aria-label="Panier">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          <Link to="/wishlist" className="relative text-[var(--color-ink)]" aria-label="Liste de souhaits">
            <Heart size={22} />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                className="flex items-center gap-1 text-[var(--color-ink)]"
                aria-label="Mon compte"
              >
                <User size={22} />
                <ChevronDown size={14} />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-black/5 bg-white py-2 shadow-lg">
                  <p className="truncate px-4 py-1 text-sm font-semibold text-[var(--color-ink)]">{user?.name}</p>
                  <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream)]">
                    Mon profil
                  </Link>
                  <Link to="/orders" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream)]">
                    Mes commandes
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream)]">
                    Ma liste de souhaits
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream)]">
                      Administration
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-[var(--color-cream)]"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-[var(--color-ink)]">
              Connexion
            </Link>
          )}
        </div>

        <button
          type="button"
          className="text-[var(--color-ink)] md:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="hidden border-t border-black/5 md:block">
        <div className="relative mx-auto max-w-7xl px-4" ref={categoriesRef}>
          <button
            type="button"
            onClick={() => setIsCategoriesOpen((open) => !open)}
            className="flex items-center gap-1 py-2 text-sm font-semibold text-[var(--color-ink)]"
          >
            Catégories
            <ChevronDown size={14} className={isCategoriesOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          {isCategoriesOpen && (
            <div className="absolute left-4 top-full z-50 grid w-72 grid-cols-2 gap-1 rounded-lg border border-black/5 bg-white p-4 shadow-lg">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.value}
                  to={`/shop?category=${cat.value}`}
                  onClick={() => setIsCategoriesOpen(false)}
                  className="rounded-md px-2 py-1.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream)]"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-black/5 bg-[var(--color-cream)] md:hidden">
          <form onSubmit={handleSearchSubmit} className="px-4 py-3">
            <div className="relative">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full rounded-full border border-black/10 bg-white px-4 py-2 pr-10 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <button
                type="submit"
                aria-label="Rechercher"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={() => setIsMobileCategoriesOpen((open) => !open)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--color-ink)]"
          >
            Catégories
            <ChevronDown size={16} className={isMobileCategoriesOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          {isMobileCategoriesOpen && (
            <div className="flex flex-col px-4 pb-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.value}
                  to={`/shop?category=${cat.value}`}
                  onClick={closeMobileMenu}
                  className="rounded-md px-2 py-2 text-sm text-[var(--color-ink)]"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-col border-t border-black/5 px-4 py-2">
            <Link to="/cart" onClick={closeMobileMenu} className="flex items-center justify-between py-2 text-sm text-[var(--color-ink)]">
              Panier {totalItems > 0 && <span>({totalItems})</span>}
            </Link>
            <Link to="/wishlist" onClick={closeMobileMenu} className="flex items-center justify-between py-2 text-sm text-[var(--color-ink)]">
              Ma liste de souhaits {wishlistItems.length > 0 && <span>({wishlistItems.length})</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={closeMobileMenu} className="py-2 text-sm text-[var(--color-ink)]">
                  Mon profil
                </Link>
                <Link to="/orders" onClick={closeMobileMenu} className="py-2 text-sm text-[var(--color-ink)]">
                  Mes commandes
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={closeMobileMenu} className="py-2 text-sm text-[var(--color-ink)]">
                    Administration
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className="py-2 text-left text-sm text-red-600">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMobileMenu} className="py-2 text-sm font-semibold text-[var(--color-ink)]">
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
