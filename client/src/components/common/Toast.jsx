import useToastStore from '../../store/toastStore';

const TYPE_STYLES = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-[var(--color-ink)]',
};

const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          onClick={() => removeToast(toast.id)}
          className={`${TYPE_STYLES[toast.type] || TYPE_STYLES.info} cursor-pointer rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default Toast;
