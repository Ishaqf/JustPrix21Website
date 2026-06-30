import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { getDeliveryRate } from '../api/delivery';
import { createOrder } from '../api/orders';
import { WILAYAS } from '../utils/wilayas';
import { formatPrice } from '../utils/formatters';

const PHONE_REGEX = /^(\+213|0)(5|6|7)[0-9]{8}$/;

const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'Paiement à la livraison' },
  { value: 'baridimob', label: 'BaridiMob' },
  { value: 'ccp', label: 'CCP' },
];
const DISABLED_PAYMENT_METHODS = [
  { value: 'cib', label: 'CIB' },
  { value: 'edahabia', label: 'Edahabia' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const showToast = useToastStore((s) => s.showToast);

  // login/register only return {_id, name, email, role, token} — phone and
  // address live on the User document and only come back from GET
  // /users/me, so the form's pre-fill (per BUILD_PLAN.md) needs a fresh
  // fetch here, not just whatever authStore already has from login.
  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      wilaya: user?.address?.wilaya || '',
      deliveryType: 'home',
      paymentMethod: 'cash_on_delivery',
    },
  });

  useEffect(() => {
    if (!user) return;
    reset((current) => ({
      ...current,
      fullName: current.fullName || user.name || '',
      phone: current.phone || user.phone || '',
      street: current.street || user.address?.street || '',
      city: current.city || user.address?.city || '',
      wilaya: current.wilaya || user.address?.wilaya || '',
    }));
    // Deliberately depends only on `user`, not `reset` — re-running this
    // every time `reset`'s identity changes would fight the user's own
    // edits to fields already filled in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const wilaya = watch('wilaya');
  const deliveryType = watch('deliveryType');
  const paymentMethod = watch('paymentMethod');

  const { data: rateData, isFetching: isRateLoading } = useQuery({
    queryKey: ['deliveryRate', wilaya, deliveryType],
    queryFn: async () => {
      const res = await getDeliveryRate(wilaya, deliveryType);
      return res.data.data;
    },
    enabled: Boolean(wilaya),
  });
  const shippingPrice = rateData?.price ?? 0;

  const mutation = useMutation({
    mutationFn: (payload) => createOrder(payload),
    onSuccess: ({ data }) => {
      clearCart();
      navigate(`/orders/${data.data._id}?confirmed=true`);
    },
    onError: (error) => {
      const message =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        'Erreur lors de la création de la commande';
      showToast('error', message);
    },
  });

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const onSubmit = (formData) => {
    mutation.mutate({
      orderItems: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        wilaya: formData.wilaya,
      },
      deliveryType: formData.deliveryType,
      paymentMethod: formData.paymentMethod,
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-(--color-ink)">Finaliser la commande</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-(--color-muted)">Adresse de livraison</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  {...register('fullName', { required: true })}
                  placeholder="Nom complet"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-600">Le nom complet est obligatoire</p>}
              </div>

              <div>
                <input
                  {...register('phone', { required: true, pattern: PHONE_REGEX })}
                  type="tel"
                  inputMode="tel"
                  placeholder="Téléphone (ex: 0778916345)"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">Numéro de téléphone algérien invalide</p>}
              </div>

              <div className="sm:col-span-2">
                <input
                  {...register('street', { required: true })}
                  placeholder="Rue / adresse"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                />
                {errors.street && <p className="mt-1 text-xs text-red-600">La rue est obligatoire</p>}
              </div>

              <div>
                <input
                  {...register('city', { required: true })}
                  placeholder="Ville"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">La ville est obligatoire</p>}
              </div>

              <div>
                <select
                  {...register('wilaya', { required: true })}
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choisir une wilaya
                  </option>
                  {WILAYAS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                {errors.wilaya && <p className="mt-1 text-xs text-red-600">La wilaya est obligatoire</p>}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-(--color-muted)">Type de livraison</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'home', label: 'À domicile' },
                { value: 'stopdesk', label: 'Stop-desk' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium ${
                    deliveryType === opt.value
                      ? 'border-(--color-accent) bg-(--color-cream)'
                      : 'border-black/10 text-(--color-ink)'
                  }`}
                >
                  <input type="radio" value={opt.value} {...register('deliveryType')} className="hidden" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-(--color-muted)">Méthode de paiement</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-medium ${
                    paymentMethod === opt.value
                      ? 'border-(--color-accent) bg-(--color-cream)'
                      : 'border-black/10 text-(--color-ink)'
                  }`}
                >
                  <input type="radio" value={opt.value} {...register('paymentMethod')} className="hidden" />
                  {opt.label}
                </label>
              ))}
              {DISABLED_PAYMENT_METHODS.map((opt) => (
                <div
                  key={opt.value}
                  className="cursor-not-allowed rounded-lg border border-black/5 px-4 py-3 text-center text-sm font-medium text-(--color-muted) opacity-60"
                >
                  {opt.label}
                  <p className="text-xs">Bientôt disponible</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-(--color-ink)">Résumé de la commande</h2>
          <div className="flex justify-between text-sm text-(--color-muted)">
            <span>Sous-total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-(--color-muted)">
            <span>Livraison</span>
            <span>{wilaya ? (isRateLoading ? '...' : formatPrice(shippingPrice)) : '—'}</span>
          </div>

          <div className="mt-4 flex justify-between border-t border-black/5 pt-4 text-base font-bold text-(--color-ink)">
            <span>Total</span>
            <span>{formatPrice(totalPrice + shippingPrice)}</span>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-5 w-full rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-white hover:bg-(--color-accent-dark) disabled:opacity-50"
          >
            {mutation.isPending ? 'Validation...' : 'Confirmer la commande'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
