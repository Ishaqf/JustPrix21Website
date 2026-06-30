import axios from 'axios';
import useToastStore from '../store/toastStore';
import useAppStore from '../store/appStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 from the login/Google-auth endpoints themselves just means "wrong
// credentials" — that must stay on the page as a normal form error, not
// trigger a forced logout-and-redirect. Any other 401 means the session
// died (expired/invalid token), which IS a sign-out.
const AUTH_ATTEMPT_PATHS = ['/users/login', '/users/auth/google'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthAttempt = AUTH_ATTEMPT_PATHS.some((path) => error.config?.url?.includes(path));

    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('jp_token');
      localStorage.removeItem('jp_user');
      window.location.href = '/login';
    }

    // 429: rate limited — always show a toast, the page-level error handler
    // won't know to show a user-friendly rate-limit message on its own.
    if (status === 429) {
      useToastStore.getState().showToast('error', 'Trop de requêtes. Réessayez dans quelques instants.');
    }

    // 503: server-declared maintenance — flip the global maintenance flag so
    // MainLayout can replace the page with the full-screen maintenance view.
    if (status === 503) {
      useAppStore.getState().setMaintenance(true);
    }

    return Promise.reject(error);
  }
);

export default api;
