import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/users';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const showToast = useToastStore((s) => s.showToast);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (formData) => {
    try {
      const { data } = await resetPassword(token, formData.password);
      setAuth(data.data);
      showToast('success', 'Mot de passe réinitialisé avec succès');
      navigate('/', { replace: true });
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Lien de réinitialisation invalide ou expiré');
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold text-(--color-ink)">Réinitialiser le mot de passe</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <input
            {...register('password', { required: true, minLength: 6 })}
            type="password"
            placeholder="Nouveau mot de passe (6 caractères min.)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">Le mot de passe doit contenir au moins 6 caractères</p>
          )}
        </div>

        <div>
          <input
            {...register('confirmPassword', {
              required: true,
              validate: (value) => value === password || 'Les mots de passe ne correspondent pas',
            })}
            type="password"
            placeholder="Confirmer le mot de passe"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark) disabled:opacity-50"
        >
          {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
        </button>

        <p className="text-center text-sm text-(--color-muted)">
          <Link to="/login" className="font-semibold text-(--color-accent-dark)">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
