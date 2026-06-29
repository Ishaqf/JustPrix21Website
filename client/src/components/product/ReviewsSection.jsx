import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getReviews, addReview } from '../../api/reviews';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import { formatDate } from '../../utils/formatters';
import StarRating from './StarRating';

const ReviewsSection = ({ productId }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useToastStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await getReviews(productId, { limit: 50 });
      return res.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { rating: 0, title: '', body: '' } });

  const mutation = useMutation({
    mutationFn: (formData) => addReview(productId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      showToast('success', 'Avis ajouté avec succès');
      reset({ rating: 0, title: '', body: '' });
    },
    onError: (error) => {
      const message =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Erreur lors de l'ajout de l'avis";
      showToast('error', message);
    },
  });

  const reviews = data?.reviews ?? [];
  const rating = watch('rating');

  const onSubmit = (formData) => {
    if (!formData.rating) {
      showToast('error', 'Veuillez choisir une note');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div>
      {isAuthenticated ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-(--color-ink)">Laisser un avis</p>
          <StarRating value={rating} onChange={(n) => setValue('rating', n)} size={22} />

          <input
            {...register('title', { required: true, maxLength: 100 })}
            placeholder="Titre de votre avis"
            className="mt-3 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">Le titre est obligatoire (max 100 caractères)</p>}

          <textarea
            {...register('body', { required: true, maxLength: 1000 })}
            placeholder="Votre avis sur ce produit"
            rows={3}
            className="mt-2 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
          {errors.body && <p className="mt-1 text-xs text-red-600">L'avis est obligatoire (max 1000 caractères)</p>}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-3 rounded-full bg-(--color-accent) px-5 py-2 text-sm font-semibold text-white hover:bg-(--color-accent-dark) disabled:opacity-50"
          >
            {mutation.isPending ? 'Envoi...' : 'Publier mon avis'}
          </button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-(--color-muted)">
          <Link to="/login" className="font-semibold text-(--color-accent-dark)">
            Connectez-vous
          </Link>{' '}
          pour laisser un avis.
        </p>
      )}

      {isLoading && <p className="text-sm text-(--color-muted)">Chargement des avis...</p>}
      {!isLoading && reviews.length === 0 && (
        <p className="text-sm text-(--color-muted)">Aucun avis pour ce produit pour le moment.</p>
      )}

      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div key={review._id} className="border-b border-black/5 pb-4">
            <div className="flex items-center justify-between">
              <StarRating value={review.rating} size={14} />
              <span className="text-xs text-(--color-muted)">{formatDate(review.createdAt)}</span>
            </div>
            <p className="mt-1 font-semibold text-(--color-ink)">{review.title}</p>
            <p className="mt-1 text-sm text-(--color-muted)">{review.body}</p>
            <p className="mt-1 text-xs text-(--color-muted)">— {review.user?.name || 'Utilisateur'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
