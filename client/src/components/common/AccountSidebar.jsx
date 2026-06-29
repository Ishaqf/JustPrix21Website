import { NavLink } from 'react-router-dom';
import { User, Package, Heart, Shield } from 'lucide-react';

const LINKS = [
  { to: '/profile', label: 'Mon profil', icon: User },
  { to: '/orders', label: 'Mes commandes', icon: Package },
  { to: '/wishlist', label: 'Ma liste de souhaits', icon: Heart },
];

// Shared by Profile.jsx (and any future account page) — avatar, role
// badge, nav links, plus an admin-only shortcut when the logged-in user
// is an admin.
const AccountSidebar = ({ user }) => (
  <div className="h-fit rounded-xl bg-white p-5 shadow-sm">
    <div className="flex flex-col items-center text-center">
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-cream)">
          <User size={28} className="text-(--color-accent-dark)" />
        </div>
      )}
      <p className="mt-3 font-semibold text-(--color-ink)">{user.name}</p>
      <p className="text-xs text-(--color-muted)">{user.email}</p>
      {user.role === 'admin' && (
        <span className="mt-2 rounded-full bg-(--color-accent) px-3 py-0.5 text-xs font-semibold text-white">
          Administrateur
        </span>
      )}
    </div>

    <nav className="mt-5 flex flex-col gap-1">
      {LINKS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
              isActive ? 'bg-(--color-cream) text-(--color-accent-dark)' : 'text-(--color-ink) hover:bg-(--color-cream)'
            }`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
      {user.role === 'admin' && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
              isActive ? 'bg-(--color-cream) text-(--color-accent-dark)' : 'text-(--color-ink) hover:bg-(--color-cream)'
            }`
          }
        >
          <Shield size={16} />
          Tableau de bord admin
        </NavLink>
      )}
    </nav>
  </div>
);

export default AccountSidebar;
