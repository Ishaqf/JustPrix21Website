import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/users';

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // The backend always responds with the same generic success message,
  // whether or not the email exists — that's deliberate (it doesn't leak
  // which emails have an account), so there's nothing to branch on here.
  const onSubmit = async ({ email }) => {
    await forgotPassword(email);
    setSent(true);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold text-(--color-ink)">Mot de passe oublié</h1>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        {sent ? (
          <p className="text-sm text-(--color-ink)">
            Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <p className="text-sm text-(--color-muted)">
              Entrez votre email, nous vous envoyons un lien pour réinitialiser votre mot de passe.
            </p>
            <div>
              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="Email"
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">L'email est obligatoire</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark) disabled:opacity-50"
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-(--color-muted)">
          <Link to="/login" className="font-semibold text-(--color-accent-dark)">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
