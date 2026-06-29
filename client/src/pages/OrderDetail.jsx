import { useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { getOrder, cancelOrder } from '../api/orders';
import useToastStore from '../store/toastStore';
import OrderTimeline from '../components/common/OrderTimeline';
import { formatPrice, formatDate } from '../utils/formatters';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  DELIVERY_TYPE_LABELS,
} from '../utils/orderStatus';

const OrderDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isConfirmed = searchParams.get('confirmed') === 'true';
  const showToast = useToastStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const previousStatus = useRef(null);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await getOrder(id);
      return res.data.data;
    },
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!order) return;
    if (previousStatus.current && previousStatus.current !== order.status) {
      showToast('info', `Statut de la commande mis à jour : ${ORDER_STATUS_LABELS[order.status]}`);
    }
    previousStatus.current = order.status;
  }, [order, showToast]);

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      showToast('success', 'Commande annulée');
    },
    onError: (error) => {
      showToast('error', error.response?.data?.message || "Erreur lors de l'annulation");
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-(--color-muted)">Chargement...</div>;
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-(--color-ink)">Commande introuvable.</p>
        <Link to="/orders" className="mt-2 inline-block text-sm font-semibold text-(--color-accent-dark)">
          Retour à mes commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {isConfirmed && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">Votre commande a bien été enregistrée. Merci pour votre confiance !</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-(--color-ink)">Commande #{order._id.slice(-8).toUpperCase()}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-(--color-muted)">Passée le {formatDate(order.createdAt)}</p>

      {order.status === 'cancelled' ? (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">Cette commande a été annulée.</div>
      ) : (
        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
          <OrderTimeline status={order.status} />
        </div>
      )}

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-(--color-muted)">Articles</h2>
        <div className="flex flex-col gap-3">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium text-(--color-ink)">{item.name}</p>
                {(item.variant?.size || item.variant?.color) && (
                  <p className="text-xs text-(--color-muted)">
                    {[item.variant.size, item.variant.color].filter(Boolean).join(' / ')}
                  </p>
                )}
                <p className="text-xs text-(--color-muted)">Qté : {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-(--color-accent-dark)">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-black/5 pt-4 text-sm">
          <div className="flex justify-between text-(--color-muted)">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-(--color-muted)">
            <span>Livraison ({DELIVERY_TYPE_LABELS[order.deliveryType]})</span>
            <span>{formatPrice(order.shippingPrice)}</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-bold text-(--color-ink)">
            <span>Total</span>
            <span>{formatPrice(order.totalPrice)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-(--color-muted)">Adresse de livraison</h2>
          <p className="text-sm text-(--color-ink)">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-(--color-muted)">{order.shippingAddress.phone}</p>
          <p className="text-sm text-(--color-muted)">
            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.wilaya}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-(--color-muted)">Paiement</h2>
          <p className="text-sm text-(--color-ink)">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
          <p className="text-sm text-(--color-muted)">{order.isPaid ? 'Payée' : 'Non payée'}</p>
        </div>
      </div>

      {order.status === 'pending' && (
        <button
          type="button"
          onClick={() => cancelMutation.mutate()}
          disabled={cancelMutation.isPending}
          className="mt-6 rounded-full border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {cancelMutation.isPending ? 'Annulation...' : 'Annuler la commande'}
        </button>
      )}
    </div>
  );
};

export default OrderDetail;
