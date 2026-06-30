import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyOrders, cancelOrder, hideOrder } from '../api/orders';
import useToastStore from '../store/toastStore';
import { formatPrice, formatDate } from '../utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, groupOrdersByDate } from '../utils/orderStatus';

const TABS = [{ value: 'all', label: 'Toutes' }, ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))];

const OrderHistory = () => {
  const [activeTab, setActiveTab] = useState('all');
  const showToast = useToastStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: async () => {
      const res = await getMyOrders();
      return res.data.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['orders', 'mine'] });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelOrder(id),
    onSuccess: () => {
      invalidate();
      showToast('success', 'Commande annulée');
    },
    onError: (error) => showToast('error', error.response?.data?.message || "Erreur lors de l'annulation"),
  });

  const hideMutation = useMutation({
    mutationFn: (id) => hideOrder(id),
    onSuccess: () => {
      invalidate();
      showToast('success', 'Commande masquée');
    },
    onError: (error) => showToast('error', error.response?.data?.message || 'Erreur lors du masquage'),
  });

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-(--color-muted)">Chargement...</div>;
  }

  const filtered = (orders ?? []).filter((o) => activeTab === 'all' || o.status === activeTab);
  const groups = groupOrdersByDate(filtered);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-(--color-ink)">Mes commandes</h1>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
              activeTab === tab.value ? 'bg-(--color-accent) text-white' : 'bg-white text-(--color-ink)'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-(--color-muted)">Aucune commande pour le moment.</p>
      )}

      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <div key={group.label}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-(--color-muted)">{group.label}</h2>
            <div className="flex flex-col gap-3">
              {group.orders.map((order) => {
                const firstItem = order.orderItems?.[0];
                const extraCount = (order.orderItems?.length ?? 1) - 1;
                return (
                  <div key={order._id} className="rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
                    <Link to={`/orders/${order._id}`} className="block p-4">
                      <div className="flex items-start gap-3">
                        {/* First item thumbnail */}
                        {firstItem?.image
                          ? <img src={firstItem.image} alt={firstItem.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                          : <div className="h-14 w-14 shrink-0 rounded-lg bg-(--color-cream)" />
                        }
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-(--color-ink)">Commande #{order._id.slice(-8).toUpperCase()}</p>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                              {ORDER_STATUS_LABELS[order.status]}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-sm text-(--color-muted)">
                            {firstItem?.name}{extraCount > 0 ? ` +${extraCount} article${extraCount > 1 ? 's' : ''}` : ''}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-(--color-accent-dark)">{formatPrice(order.totalPrice)}</span>
                            <span className="text-xs text-(--color-muted)">{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {(order.status === 'pending' || order.status === 'cancelled') && (
                      <div className="border-t border-black/5 px-4 py-2">
                        {order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => cancelMutation.mutate(order._id)}
                            disabled={cancelMutation.isPending}
                            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                          >
                            Annuler la commande
                          </button>
                        )}
                        {order.status === 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => hideMutation.mutate(order._id)}
                            disabled={hideMutation.isPending}
                            className="text-xs font-semibold text-(--color-muted) hover:underline disabled:opacity-50"
                          >
                            Masquer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
