import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { trackOrder } from '../api/orders';
import OrderTimeline from '../components/common/OrderTimeline';
import { formatPrice, formatDate } from '../utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, DELIVERY_TYPE_LABELS } from '../utils/orderStatus';

const TrackOrder = () => {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async ({ orderId, phone }) => {
    setIsLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await trackOrder(orderId.trim(), phone.trim());
      setOrder(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Commande introuvable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-(--color-ink)">Suivre ma commande</h1>
      <p className="mb-6 text-sm text-(--color-muted)">
        Entrez le numéro de votre commande et le téléphone utilisé lors de la commande.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm sm:flex-row">
        <input
          {...register('orderId', { required: true })}
          placeholder="Numéro de commande"
          className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
        />
        <input
          {...register('phone', { required: true })}
          placeholder="Téléphone"
          className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark) disabled:opacity-50"
        >
          {isLoading ? 'Recherche...' : 'Suivre'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {order && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-(--color-ink)">Commande #{order._id.slice(-8).toUpperCase()}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-(--color-muted)">Passée le {formatDate(order.createdAt)}</p>

          {order.status === 'cancelled' ? (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
              Cette commande a été annulée.
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
              <OrderTimeline status={order.status} />
            </div>
          )}

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm text-sm">
            <div className="flex justify-between text-(--color-muted)">
              <span>Livraison ({DELIVERY_TYPE_LABELS[order.deliveryType]})</span>
              <span>{formatPrice(order.shippingPrice)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-bold text-(--color-ink)">
              <span>Total</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
