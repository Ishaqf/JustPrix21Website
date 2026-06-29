import axios from 'axios';

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
// trigger a forced logout-and-redirect (which would yank the user away
// from the form they're actively filling in). Any other 401 means an
// existing session died (expired/invalid token), which IS a sign-out.
const AUTH_ATTEMPT_PATHS = ['/users/login', '/users/auth/google'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthAttempt = AUTH_ATTEMPT_PATHS.some((path) => error.config?.url?.includes(path));
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('jp_token');
      localStorage.removeItem('jp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
