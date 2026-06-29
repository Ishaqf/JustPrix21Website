// Mirrors server/models/Order.js's status enum + orderController.js's
// VALID_TRANSITIONS — French labels/colors for badges, and the linear
// flow used to render OrderDetail's timeline. 'cancelled' is deliberately
// excluded from ORDER_STATUS_FLOW: it can happen from 'pending' or
// 'confirmed', so it doesn't have one fixed position in a linear timeline
// — OrderDetail renders it as a separate banner instead.
export const ORDER_STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export const ORDER_STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const PAYMENT_METHOD_LABELS = {
  cash_on_delivery: 'Paiement à la livraison',
  baridimob: 'BaridiMob',
  ccp: 'CCP',
  card: 'Carte bancaire',
};

export const DELIVERY_TYPE_LABELS = {
  home: 'Livraison à domicile',
  stopdesk: 'Stop-desk',
};

// Buckets orders by createdAt into French date-group labels for
// OrderHistory, most recent group first. Each order appears in exactly
// one bucket; bucket order itself is fixed (not data-driven) so the page
// renders groups in a stable, predictable sequence.
export const groupOrdersByDate = (orders) => {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - today.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const buckets = {
    "Aujourd'hui": [],
    Hier: [],
    'Cette semaine': [],
    'Ce mois-ci': [],
    'Plus ancien': [],
  };

  orders.forEach((order) => {
    const created = new Date(order.createdAt);
    if (created >= today) buckets["Aujourd'hui"].push(order);
    else if (created >= yesterday) buckets.Hier.push(order);
    else if (created >= startOfWeek) buckets['Cette semaine'].push(order);
    else if (created >= startOfMonth) buckets['Ce mois-ci'].push(order);
    else buckets['Plus ancien'].push(order);
  });

  return Object.entries(buckets)
    .filter(([, group]) => group.length > 0)
    .map(([label, group]) => ({ label, orders: group }));
};
