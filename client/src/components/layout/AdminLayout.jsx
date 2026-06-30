import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package2, ShoppingBag, Film, LogOut, Menu, X, ArrowLeft,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NAV_LINKS = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produits', icon: Package2 },
  { to: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/reels', label: 'Affaires', icon: Film },
];

const AdminLayout = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-(--color-accent) text-white'
        : 'text-(--color-muted) hover:bg-(--color-cream) hover:text-(--color-ink)'
    }`;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-black/5 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xs text-(--color-muted) hover:text-(--color-accent-dark)">
          <ArrowLeft size={14} />
          Voir le site
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-(--color-muted)">Admin</p>
        <p className="truncate text-sm font-bold text-(--color-ink)">{user?.name}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass} onClick={() => setIsMobileOpen(false)}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-black/5 px-2 py-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-(--color-muted) hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-(--color-cream)">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-black/5 bg-white md:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 md:hidden">
        <p className="text-sm font-bold text-(--color-ink)">Admin</p>
        <button
          type="button"
          onClick={() => setIsMobileOpen((o) => !o)}
          className="text-(--color-ink)"
          aria-label="Menu"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-56 bg-white">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 overflow-x-hidden pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
