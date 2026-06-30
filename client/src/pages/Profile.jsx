import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { updateMe } from '../api/users';
import { WILAYAS } from '../utils/wilayas';
import AccountSidebar from '../components/common/AccountSidebar';

const Profile = () => {
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const updateUser = useAuthStore((s) => s.updateUser);
  const showToast = useToastStore((s) => s.showToast);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  useEffect(() => {
    refreshUser().catch(() => {});
    // Only on mount — re-running every time `refreshUser`'s identity
    // changes would refetch on every render, not just once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      wilaya: user?.address?.wilaya || '',
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      wilaya: user.address?.wilaya || '',
    });
  }, [user, reset]);

  const avatarFile = watch('avatarFile');
  useEffect(() => {
    const file = avatarFile?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const newPassword = watch('newPassword');

  const onSubmit = async (formData) => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone || '');
    data.append('address', JSON.stringify({ street: formData.street, city: formData.city, wilaya: formData.wilaya }));
    if (formData.avatarFile?.[0]) data.append('avatar', formData.avatarFile[0]);
    if (formData.newPassword) {
      data.append('currentPassword', formData.currentPassword);
      data.append('password', formData.newPassword);
    }

    try {
      const res = await updateMe(data);
      updateUser(res.data.data);
      showToast('success', 'Profil mis à jour');
      setAvatarPreview(null);
      setIsPasswordOpen(false);
    } catch (error) {
      showToast('error', error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-(--color-ink)">Mon profil</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <AccountSidebar user={{ ...user, avatar: avatarPreview || user.avatar }} />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 rounded-xl bg-white p-5 shadow-sm md:col-span-2">
          <div className="flex items-center gap-4">
            {avatarPreview || user.avatar ? (
              <img src={avatarPreview || user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-(--color-cream)" />
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-(--color-ink) hover:bg-(--color-cream)">
              <Camera size={16} />
              Changer la photo
              <input type="file" accept="image/*" {...register('avatarFile')} className="hidden" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-(--color-muted)">Nom complet</label>
              <input
                {...register('name', { required: true, maxLength: 60 })}
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">Le nom ne peut pas être vide</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-(--color-muted)">Téléphone</label>
              <input
                {...register('phone')}
                type="tel"
                inputMode="tel"
                placeholder="0778916345"
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-(--color-muted)">Rue / adresse</label>
              <input
                {...register('street')}
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-(--color-muted)">Ville</label>
              <input
                {...register('city')}
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-(--color-muted)">Wilaya</label>
              <select
                {...register('wilaya')}
                defaultValue=""
                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              >
                <option value="">Choisir une wilaya</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-black/5 pt-4">
            <button
              type="button"
              onClick={() => setIsPasswordOpen((open) => !open)}
              className="flex w-full items-center justify-between text-sm font-bold uppercase tracking-wide text-(--color-muted)"
            >
              Changer le mot de passe
              <ChevronDown size={16} className={isPasswordOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            {isPasswordOpen && (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <input
                    {...register('currentPassword')}
                    type="password"
                    placeholder="Mot de passe actuel"
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                  />
                </div>
                <div>
                  <input
                    {...register('newPassword', { minLength: 6 })}
                    type="password"
                    placeholder="Nouveau mot de passe"
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-600">Le mot de passe doit contenir au moins 6 caractères</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('confirmNewPassword', {
                      validate: (value) => !newPassword || value === newPassword || 'Les mots de passe ne correspondent pas',
                    })}
                    type="password"
                    placeholder="Confirmer le nouveau mot de passe"
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                  />
                  {errors.confirmNewPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmNewPassword.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start rounded-full bg-(--color-accent) px-6 py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark) disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
