import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Trash2, Search } from 'lucide-react';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../api/orders';
import useToastStore from '../../store/toastStore';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/orderStatus';
import Skeleton from '../../components/common/Skeleton';

// Mirrors server/controllers/orderController.js's VALID_TRANSITIONS.
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const TABS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const PRESETS = {
  all: { label: 'Tout', startDate: undefined, endDate: undefined },
  today: { label: "Aujourd'hui", startDate: () => today().toISOString(), endDate: () => new Date().toISOString() },
  week: {
    label: 'Cette semaine',
    startDate: () => { const d = today(); d.setDate(d.getDate() - d.getDay()); return d.toISOString(); },
    endDate: () => new Date().toISOString(),
  },
  month: {
    label: 'Ce mois',
    startDate: () => { const d = today(); d.setDate(1); return d.toISOString(); },
    endDate: () => new Date().toISOString(),
  },
};

const StatBadge = ({ label, value, color }) => (
  <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
    <p className="text-xs text-(--color-muted)">{label}</p>
    <p className={`text-lg font-bold ${color || 'text-(--color-ink)'}`}>{value}</p>
  </div>
);

const ManageOrders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [preset, setPreset] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const showToast = useToastStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const resolvedPreset = PRESETS[preset];
  const queryParams = {
    status: activeTab === 'all' ? undefined : activeTab,
    search: search || undefined,
    startDate: typeof resolvedPreset.startDate === 'function' ? resolvedPreset.startDate() : resolvedPreset.startDate,
    endDate: typeof resolvedPreset.endDate === 'function' ? resolvedPreset.endDate() : resolvedPreset.endDate,
    page,
    limit: 20,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', queryParams],
    queryFn: async () => {
      const res = await getAllOrders(queryParams);
      return res.data.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => { invalidate(); showToast('success', 'Statut mis à jour'); },
    onError: (err) => showToast('error', err.response?.data?.message || 'Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteOrder(id),
    onSuccess: () => { invalidate(); showToast('success', 'Commande supprimée'); },
    onError: (err) => showToast('error', err.response?.data?.message || 'Erreur'),
  });

  const handleExport = async () => {
    try {
      const res = await getAllOrders({ ...queryParams, limit: 9999, page: 1 });
      const orders = res.data.data.orders;
      const rows = [
        ['ID', 'Client', 'Email', 'Téléphone', 'Wilaya', 'Total', 'Livraison', 'Paiement', 'Statut', 'Date'],
        ...orders.map((o) => [
          o._id,
          o.user?.name ?? '',
          o.user?.email ?? '',
          o.shippingAddress?.phone ?? '',
          o.shippingAddress?.wilaya ?? '',
          o.totalPrice,
          o.shippingPrice,
          o.paymentMethod,
          o.status,
          new Date(o.createdAt).toISOString(),
        ]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('error', "Erreur lors de l'export");
    }
  };

  const orders = data?.orders ?? [];
  const stats = data?.stats;
  const totalPages = data?.pages ?? 1;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-(--color-ink)">Commandes</h1>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-(--color-ink) hover:bg-(--color-cream)"
        >
          <Download size={15} />
          Exporter CSV
        </button>
      </div>

      {/* Period stats */}
      {stats && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBadge label="Commandes" value={stats.totalOrders} />
          <StatBadge label="Revenu livré" value={formatPrice(stats.totalRevenue)} color="text-(--color-accent-dark)" />
          <StatBadge label="En attente" value={stats.pendingCount} color="text-amber-600" />
          <StatBadge label="Livrées" value={stats.deliveredCount} color="text-green-600" />
        </div>
      )}

      {/* Date presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setPreset(key); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${preset === key ? 'bg-(--color-accent) text-white' : 'bg-white text-(--color-ink)'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Status tabs + search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${activeTab === tab ? 'bg-(--color-ink) text-white' : 'bg-white text-(--color-muted)'}`}
            >
              {tab === 'all' ? 'Toutes' : ORDER_STATUS_LABELS[tab]}
            </button>
          ))}
        </div>
        <div className="relative ml-auto min-w-40">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted)" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ID / nom / téléphone..."
            className="w-full rounded-lg border border-black/10 bg-white py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-xs text-(--color-muted)">
              <th className="px-4 py-3 text-left font-semibold">Commande</th>
              <th className="px-4 py-3 text-left font-semibold">Client</th>
              <th className="px-4 py-3 text-left font-semibold">Wilaya</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-center font-semibold">Statut</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="px-4 py-3" colSpan={7}><Skeleton className="h-8" /></td>
                  </tr>
                ))
              : orders.map((order) => {
                  const transitions = VALID_TRANSITIONS[order.status] ?? [];
                  return (
                    <tr key={order._id} className="border-b border-black/5 last:border-0 hover:bg-(--color-cream)/40">
                      <td className="px-4 py-3 font-mono text-xs text-(--color-accent-dark)">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-(--color-ink)">{order.user?.name ?? '—'}</p>
                        <p className="text-xs text-(--color-muted)">{order.shippingAddress?.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-(--color-muted)">{order.shippingAddress?.wilaya}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.totalPrice)}</td>
                      <td className="px-4 py-3">
                        {transitions.length > 0 ? (
                          <select
                            value={order.status}
                            onChange={(e) => statusMutation.mutate({ id: order._id, status: e.target.value })}
                            disabled={statusMutation.isPending}
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold border-none cursor-pointer ${ORDER_STATUS_COLORS[order.status]}`}
                          >
                            <option value={order.status}>{ORDER_STATUS_LABELS[order.status]}</option>
                            {transitions.map((t) => (
                              <option key={t} value={t}>{ORDER_STATUS_LABELS[t]}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-(--color-muted)">{formatDate(order.createdAt, { day: 'numeric', month: 'short' })}</td>
                      <td className="px-4 py-3">
                        {order.status === 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Supprimer définitivement cette commande ?')) deleteMutation.mutate(order._id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="rounded-md p-1.5 text-(--color-muted) hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                            aria-label="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-(--color-muted)">
          <span>Page {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="rounded-lg border border-black/10 bg-white px-3 py-1.5 disabled:opacity-40">◀</button>
            <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="rounded-lg border border-black/10 bg-white px-3 py-1.5 disabled:opacity-40">▶</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
