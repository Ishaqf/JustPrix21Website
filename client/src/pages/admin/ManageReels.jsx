import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PlusCircle, Pencil, Trash2, X, Search, Film } from 'lucide-react';
import { getReels, createReel, updateReel, deleteReel } from '../../api/reels';
import { getProducts } from '../../api/products';
import useToastStore from '../../store/toastStore';
import Skeleton from '../../components/common/Skeleton';

const BADGES = ['Promo', 'Pack', 'Affaire du jour', 'Nouveauté'];

// Inline searchable product picker — searches live via the products API,
// shows results in a dropdown, selected items appear as chips above.
const ProductPicker = ({ selected, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data } = useQuery({
    queryKey: ['admin', 'reel-product-search', searchTerm],
    queryFn: async () => {
      const res = await getProducts({ search: searchTerm || undefined, limit: 10, isActive: 'true' });
      return res.data.data.products;
    },
    enabled: searchTerm.length > 0,
  });

  const results = (data ?? []).filter((p) => !selected.some((s) => s._id === p._id));

  const add = (product) => {
    if (selected.length >= 10) return;
    onChange([...selected, { _id: product._id, name: product.name }]);
    setSearchTerm('');
  };

  const remove = (id) => onChange(selected.filter((p) => p._id !== id));

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5 min-h-8">
        {selected.map((p) => (
          <span key={p._id} className="flex items-center gap-1 rounded-full bg-(--color-cream) px-2.5 py-1 text-xs font-medium text-(--color-ink)">
            {p.name}
            <button type="button" onClick={() => remove(p._id)} className="text-(--color-muted) hover:text-red-600">
              <X size={11} />
            </button>
          </span>
        ))}
        {selected.length === 0 && <span className="text-xs text-(--color-muted)">Aucun produit sélectionné</span>}
      </div>
      {selected.length < 10 && (
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted)" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full rounded-md border border-black/10 py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
          {searchTerm && results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-black/10 bg-white shadow-md">
              {results.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => add(p)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-(--color-ink) hover:bg-(--color-cream)"
                >
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="h-7 w-7 rounded object-cover" />}
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="mt-1 text-xs text-(--color-muted)">{selected.length}/10 produit(s)</p>
    </div>
  );
};

// Slide-over create/edit form.
const ReelForm = ({ reel, onClose, onSaved }) => {
  const isEdit = Boolean(reel);
  const showToast = useToastStore((s) => s.showToast);
  const [selectedProducts, setSelectedProducts] = useState(
    reel?.products?.map((p) => ({ _id: p._id ?? p, name: p.name ?? '—' })) ?? []
  );

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      instagramUrl: reel?.instagramUrl ?? '',
      title: reel?.title ?? '',
      badge: reel?.badge ?? 'Promo',
      order: reel?.order ?? 0,
      isActive: reel?.isActive ?? true,
    },
  });

  const onSubmit = async (formData) => {
    if (selectedProducts.length === 0) {
      showToast('error', 'Sélectionnez au moins 1 produit');
      return;
    }
    const payload = { ...formData, order: Number(formData.order), products: selectedProducts.map((p) => p._id) };
    try {
      if (isEdit) {
        await updateReel(reel._id, payload);
        showToast('success', 'Affaire mise à jour');
      } else {
        await createReel(payload);
        showToast('success', 'Affaire créée');
      }
      onSaved();
    } catch (err) {
      showToast('error', err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Erreur');
    }
  };

  const fieldClass = 'w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)';
  const labelClass = 'mb-1 block text-xs font-semibold text-(--color-muted)';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 grid w-full max-w-lg grid-rows-[auto_1fr_auto] bg-white shadow-2xl">

        {/* Row 1 — header */}
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="text-lg font-bold text-(--color-ink)">{isEdit ? "Modifier l'affaire" : 'Nouvelle affaire'}</h2>
          <button type="button" onClick={onClose} className="cursor-pointer text-(--color-muted) hover:text-(--color-ink)"><X size={20} /></button>
        </div>

        {/* Row 2 — scrollable form body */}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto">
          <div className="flex flex-col gap-4 p-5">
            <div>
              <label className={labelClass}>URL Instagram *</label>
              <input {...register('instagramUrl', { required: true })} placeholder="https://www.instagram.com/reel/..." className={fieldClass} />
              {errors.instagramUrl && <p className="mt-1 text-xs text-red-600">URL Instagram obligatoire</p>}
            </div>
            <div>
              <label className={labelClass}>Titre *</label>
              <input {...register('title', { required: true, maxLength: 150 })} className={fieldClass} />
              {errors.title && <p className="mt-1 text-xs text-red-600">Titre obligatoire (max 150 car.)</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Badge</label>
                <select {...register('badge')} className={fieldClass}>
                  {BADGES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Ordre d'affichage</label>
                <input type="number" {...register('order')} className={fieldClass} />
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-(--color-ink)">
              <input type="checkbox" {...register('isActive')} className="rounded" />
              Affaire active (visible sur le site)
            </label>
            <div>
              <label className={labelClass}>Produits liés (1–10) *</label>
              <ProductPicker selected={selectedProducts} onChange={setSelectedProducts} />
            </div>
          </div>
        </form>

        {/* Row 3 — footer (outside form, always visible) */}
        <div className="flex gap-3 border-t border-black/5 px-5 py-4">
          <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-full border border-black/10 py-2.5 text-sm font-medium text-(--color-ink) hover:bg-(--color-cream)">
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="flex-1 cursor-pointer rounded-full bg-(--color-accent) py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark)"
          >
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageReels = () => {
  const [formReel, setFormReel] = useState(undefined);
  const showToast = useToastStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const { data: reels, isLoading } = useQuery({
    queryKey: ['admin', 'reels'],
    queryFn: async () => {
      const res = await getReels();
      return res.data.data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'reels'] });
    queryClient.invalidateQueries({ queryKey: ['reels'] });
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteReel(id),
    onSuccess: () => { invalidate(); showToast('success', 'Affaire supprimée'); },
    onError: (err) => showToast('error', err.response?.data?.message || 'Erreur'),
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-(--color-ink)">Affaires (Reels)</h1>
        <button
          type="button"
          onClick={() => setFormReel(null)}
          className="flex items-center gap-2 rounded-full bg-(--color-accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-accent-dark)"
        >
          <PlusCircle size={16} />
          Nouvelle affaire
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : (reels ?? []).length === 0 ? (
        <div className="flex flex-col items-center py-16 text-(--color-muted)">
          <Film size={40} />
          <p className="mt-3">Aucune affaire pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reels.map((reel) => (
            <div key={reel._id} className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-(--color-ink)">{reel.title}</p>
                  <p className="mt-0.5 truncate text-xs text-(--color-muted)">{reel.instagramUrl}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => setFormReel(reel)} className="rounded-md p-1.5 text-(--color-muted) hover:bg-(--color-cream) hover:text-(--color-ink)">
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (window.confirm('Supprimer cette affaire ?')) deleteMutation.mutate(reel._id); }}
                    disabled={deleteMutation.isPending}
                    className="rounded-md p-1.5 text-(--color-muted) hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-(--color-accent) px-2 py-0.5 font-semibold text-white">{reel.badge}</span>
                <span className="text-(--color-muted)">{reel.products?.length ?? 0} produit(s)</span>
                <span className="ml-auto text-(--color-muted)">Ordre : {reel.order}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${reel.isActive ? 'bg-green-500' : 'bg-black/20'}`} />
                <span className="text-xs text-(--color-muted)">{reel.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {formReel !== undefined && (
        <ReelForm
          reel={formReel}
          onClose={() => setFormReel(undefined)}
          onSaved={() => { setFormReel(undefined); invalidate(); }}
        />
      )}
    </div>
  );
};

export default ManageReels;
