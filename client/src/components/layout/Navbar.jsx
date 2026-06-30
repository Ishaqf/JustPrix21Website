import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import Logo from '../common/Logo';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useWishlist from '../../hooks/useWishlist';
import { CATEGORIES } from '../../utils/categories';
import { CATEGORY_ICONS } from '../../utils/categoryIcons';
import { BRANDS_BY_CATEGORY } from '../../utils/brands';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const totalItems = useCartStore((s) => s.totalItems());
  const { items: wishlistItems, fetchWishlist, reset: resetWishlist } = useWishlist();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].value);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState(null);

  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);
  const categoriesCloseTimeout = useRef(null);

  // Short close delay so a brief, imprecise mouse exit (e.g. crossing the
  // border between the trigger button and the panel below it) doesn't
  // flicker the menu shut — matches how most hover mega-menus behave.
  const openCategories = () => {
    if (categoriesCloseTimeout.current) {
      clearTimeout(categoriesCloseTimeout.current);
      categoriesCloseTimeout.current = null;
    }
    setIsCategoriesOpen(true);
  };

  const scheduleCloseCategories = () => {
    categoriesCloseTimeout.current = setTimeout(() => setIsCategoriesOpen(false), 150);
  };

  useEffect(() => () => clearTimeout(categoriesCloseTimeout.current), []);

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
  const activeCategoryLabel = CATEGORIES.find((c) => c.value === activeCategory)?.label;

  return (
    <header className="sticky top-0 z-40 border-b border-black/6 bg-(--color-cream)/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Logo />

        <form onSubmit={handleSearchSubmit} className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-md">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full rounded-full border border-black/10 bg-white px-4 py-2 pr-10 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
            />
            <button
              type="submit"
              aria-label="Rechercher"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted)"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        <div className="flex-1 md:hidden" />

        <div className="hidden items-center gap-5 md:flex">
          <Link to="/cart" className="relative text-(--color-ink)" aria-label="Panier">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-(--color-accent) text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          <Link to="/wishlist" className="relative text-(--color-ink)" aria-label="Liste de souhaits">
            <Heart size={22} />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-(--color-accent) text-[10px] font-bold text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                className="flex items-center gap-1 text-(--color-ink)"
                aria-label="Mon compte"
              >
                <User size={22} />
                <ChevronDown size={14} />
              </button>
              <div
                className={`absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-black/5 bg-white py-2 shadow-lg transition-all duration-150 ${
                  isUserMenuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
                }`}
              >
                <p className="truncate px-4 py-1 text-sm font-semibold text-(--color-ink)">{user?.name}</p>
                <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-(--color-ink) hover:bg-(--color-cream)">
                  Mon profil
                </Link>
                <Link to="/orders" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-(--color-ink) hover:bg-(--color-cream)">
                  Mes commandes
                </Link>
                <Link to="/wishlist" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-(--color-ink) hover:bg-(--color-cream)">
                  Ma liste de souhaits
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-(--color-ink) hover:bg-(--color-cream)">
                    Administration
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-(--color-cream)"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-(--color-ink)">
              Connexion
            </Link>
          )}
        </div>

        <button
          type="button"
          className="text-(--color-ink) md:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="hidden border-t border-black/5 md:block">
        <div className="mx-auto max-w-7xl px-4">
          <div
            className="relative inline-block"
            ref={categoriesRef}
            onMouseEnter={openCategories}
            onMouseLeave={scheduleCloseCategories}
          >
            <button
              type="button"
              onClick={() => setIsCategoriesOpen((open) => !open)}
              className={`flex items-center gap-1 rounded-t-md px-3 py-2 text-sm font-semibold text-(--color-ink) ${
                isCategoriesOpen ? 'bg-white' : 'hover:bg-white/60'
              }`}
            >
              Catégories
              <ChevronDown size={14} className={isCategoriesOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            <div
              className={`absolute left-0 top-full z-50 flex w-160 overflow-hidden rounded-xl border border-black/5 bg-white shadow-xl transition-all duration-150 ${
                isCategoriesOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
              }`}
            >
              <div className="w-56 shrink-0 border-r border-black/5 bg-(--color-cream)/50 py-2">
                {CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.value];
                  const isActive = activeCategory === cat.value;
                  return (
                    <Link
                      key={cat.value}
                      to={`/shop?category=${cat.value}`}
                      onMouseEnter={() => setActiveCategory(cat.value)}
                      onClick={() => setIsCategoriesOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium ${
                        isActive ? 'bg-white text-(--color-accent-dark)' : 'text-(--color-ink)'
                      }`}
                    >
                      <Icon size={18} />
                      {cat.label}
                    </Link>
                  );
                })}
              </div>

              <div className="flex-1 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-(--color-muted)">
                  Marques — {activeCategoryLabel}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {BRANDS_BY_CATEGORY[activeCategory].map((b) => (
                    <Link
                      key={b}
                      to={`/shop?category=${activeCategory}&brand=${encodeURIComponent(b)}`}
                      onClick={() => setIsCategoriesOpen(false)}
                      className="rounded-md px-2 py-1.5 text-sm text-(--color-ink) hover:bg-(--color-cream)"
                    >
                      {b}
                    </Link>
                  ))}
                </div>
                <Link
                  to={`/shop?category=${activeCategory}`}
                  onClick={() => setIsCategoriesOpen(false)}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-(--color-accent-dark)"
                >
                  Voir tout : {activeCategoryLabel}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-black/5 bg-(--color-cream) md:hidden">
          <form onSubmit={handleSearchSubmit} className="px-4 py-3">
            <div className="relative">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full rounded-full border border-black/10 bg-white px-4 py-2 pr-10 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
              <button
                type="submit"
                aria-label="Rechercher"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted)"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={() => setIsMobileCategoriesOpen((open) => !open)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-(--color-ink)"
          >
            Catégories
            <ChevronDown size={16} className={isMobileCategoriesOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          {isMobileCategoriesOpen && (
            <div className="flex flex-col gap-1 px-4 pb-2">
              {CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.value];
                const isOpen = mobileActiveCategory === cat.value;
                return (
                  <div key={cat.value}>
                    <button
                      type="button"
                      onClick={() => setMobileActiveCategory(isOpen ? null : cat.value)}
                      className="flex w-full items-center justify-between rounded-md py-2 text-sm font-medium text-(--color-ink)"
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={16} />
                        {cat.label}
                      </span>
                      <ChevronDown size={14} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                    </button>
                    {isOpen && (
                      <div className="flex flex-col gap-1 pb-2 pl-7">
                        {BRANDS_BY_CATEGORY[cat.value].map((b) => (
                          <Link
                            key={b}
                            to={`/shop?category=${cat.value}&brand=${encodeURIComponent(b)}`}
                            onClick={closeMobileMenu}
                            className="rounded-md py-1.5 text-sm text-(--color-muted)"
                          >
                            {b}
                          </Link>
                        ))}
                        <Link
                          to={`/shop?category=${cat.value}`}
                          onClick={closeMobileMenu}
                          className="rounded-md py-1.5 text-sm font-semibold text-(--color-accent-dark)"
                        >
                          Voir tout
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col border-t border-black/5 px-4 py-2">
            <Link to="/cart" onClick={closeMobileMenu} className="flex items-center justify-between py-2 text-sm text-(--color-ink)">
              Panier {totalItems > 0 && <span>({totalItems})</span>}
            </Link>
            <Link to="/wishlist" onClick={closeMobileMenu} className="flex items-center justify-between py-2 text-sm text-(--color-ink)">
              Ma liste de souhaits {wishlistItems.length > 0 && <span>({wishlistItems.length})</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={closeMobileMenu} className="py-2 text-sm text-(--color-ink)">
                  Mon profil
                </Link>
                <Link to="/orders" onClick={closeMobileMenu} className="py-2 text-sm text-(--color-ink)">
                  Mes commandes
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={closeMobileMenu} className="py-2 text-sm text-(--color-ink)">
                    Administration
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className="py-2 text-left text-sm text-red-600">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMobileMenu} className="py-2 text-sm font-semibold text-(--color-ink)">
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
