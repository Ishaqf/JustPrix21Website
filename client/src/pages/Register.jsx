import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { register as registerApi } from '../api/users';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const showToast = useToastStore((s) => s.showToast);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      const { data } = await registerApi({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      // register's response has the same {_id, name, email, role, token}
      // shape as login — logs the user straight in instead of making them
      // log in again right after signing up.
      setAuth(data.data);
      navigate('/', { replace: true });
    } catch (error) {
      showToast('error', error.response?.data?.errors?.[0]?.message || error.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/', { replace: true });
    } catch {
      showToast('error', 'Connexion Google impossible');
    }
  };

  const password = watch('password');

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold text-(--color-ink)">Créer un compte</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <input
            {...register('name', { required: true, maxLength: 60 })}
            placeholder="Nom complet"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">Le nom est obligatoire (max 60 caractères)</p>}
        </div>

        <div>
          <input
            {...register('email', { required: true })}
            type="email"
            placeholder="Email"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">L'email est obligatoire</p>}
        </div>

        <div>
          <input
            {...register('password', { required: true, minLength: 6 })}
            type="password"
            placeholder="Mot de passe (6 caractères min.)"
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
          {isSubmitting ? 'Création...' : 'Créer mon compte'}
        </button>

        <div className="flex items-center gap-3 text-xs text-(--color-muted)">
          <div className="h-px flex-1 bg-black/10" />
          ou
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            locale="fr_FR"
            onSuccess={handleGoogleSuccess}
            onError={() => showToast('error', 'Connexion Google impossible')}
          />
        </div>

        <p className="text-center text-sm text-(--color-muted)">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-(--color-accent-dark)">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
