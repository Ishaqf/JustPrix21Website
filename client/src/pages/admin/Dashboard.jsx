import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package2, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { getStats } from '../../api/admin';
import { formatPrice } from '../../utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/orderStatus';
import Skeleton from '../../components/common/Skeleton';

const FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--color-cream)">
      <Icon size={22} className="text-(--color-accent-dark)" />
    </span>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">{label}</p>
      <p className="text-xl font-bold text-(--color-ink)">{value}</p>
      {sub && <p className="text-xs text-(--color-muted)">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await getStats();
      return res.data.data;
    },
    refetchInterval: 60000,
  });

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-(--color-ink)">Tableau de bord</h1>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard icon={ShoppingBag} label="Commandes" value={data.totalOrders} />
            <StatCard icon={TrendingUp} label="Revenu livré" value={formatPrice(data.totalRevenue)} />
            <StatCard icon={Package2} label="Produits actifs" value={data.totalProducts} sub={`${data.lowStockCount} en stock limité`} />
            <StatCard icon={Users} label="Clients" value={data.totalUsers} />
          </>
        )}
      </div>

      {/* Status bar chart */}
      {!isLoading && data.totalOrders > 0 && (
        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-(--color-ink)">Répartition des commandes</p>
          <div className="flex flex-col gap-2">
            {FLOW.map((status) => {
              const count = data.ordersByStatus[status] || 0;
              const pct = data.totalOrders > 0 ? Math.round((count / data.totalOrders) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs text-(--color-muted)">{ORDER_STATUS_LABELS[status]}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded-full bg-(--color-cream)">
                    <div
                      className="h-full rounded-full bg-(--color-accent) transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-xs font-medium text-(--color-ink)">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-(--color-ink)">Commandes récentes</p>
            <Link to="/admin/orders" className="text-xs font-semibold text-(--color-accent-dark)">Voir tout</Link>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs text-(--color-muted)">
                    <th className="pb-2 text-left font-semibold">ID</th>
                    <th className="pb-2 text-left font-semibold">Client</th>
                    <th className="pb-2 text-right font-semibold">Total</th>
                    <th className="pb-2 text-right font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-black/5 last:border-0">
                      <td className="py-2">
                        <Link to={`/orders/${order._id}`} className="font-mono text-xs text-(--color-accent-dark)">
                          #{order._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-2 text-(--color-muted)">{order.user?.name || '—'}</td>
                      <td className="py-2 text-right font-semibold">{formatPrice(order.totalPrice)}</td>
                      <td className="py-2 text-right">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <p className="text-sm font-bold text-(--color-ink)">Stock limité</p>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-(--color-muted)">Aucun produit en stock limité.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-lg bg-(--color-cream) px-3 py-2">
                  <Link to={`/admin/products`} className="text-sm font-medium text-(--color-ink) hover:text-(--color-accent-dark)">
                    {p.name}
                  </Link>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                    {p.stock} restants
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
