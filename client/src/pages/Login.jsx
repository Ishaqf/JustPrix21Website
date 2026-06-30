import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const showToast = useToastStore((s) => s.showToast);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const redirectAfterLogin = () => {
    const destination = location.state?.from?.pathname || '/';
    navigate(destination, { replace: true });
  };

  const onSubmit = async (formData) => {
    try {
      await login(formData.email, formData.password);
      redirectAfterLogin();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Email ou mot de passe incorrect');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      redirectAfterLogin();
    } catch {
      showToast('error', 'Connexion Google impossible');
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold text-(--color-ink)">Connexion</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
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
            {...register('password', { required: true })}
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">Le mot de passe est obligatoire</p>}
        </div>

        <Link to="/forgot-password" className="self-end text-xs font-medium text-(--color-accent-dark)">
          Mot de passe oublié ?
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark) disabled:opacity-50"
        >
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </button>

        <div className="flex items-center gap-3 text-xs text-(--color-muted)">
          <div className="h-px flex-1 bg-black/10" />
          ou
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <div className="flex justify-center">
          <GoogleSignInButton
            onCredential={handleGoogleSuccess}
            onError={() => showToast('error', 'Connexion Google impossible')}
          />
        </div>

        <p className="text-center text-sm text-(--color-muted)">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-(--color-accent-dark)">
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
