import { create } from 'zustand';
import { login as loginApi, googleAuth as googleAuthApi, getMe } from '../api/users';

// Deliberately NOT zustand's persist middleware: that writes one combined
// JSON blob under a single key. axios.js's request interceptor needs to
// read the raw token from a plain localStorage.getItem('jp_token') call
// (no zustand involved there, to avoid a circular import with this store),
// so token/user are persisted as their own literal keys instead.
const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('jp_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  user: readStoredUser(),
  token: localStorage.getItem('jp_token'),
  isAuthenticated: !!localStorage.getItem('jp_token'),

  // Applies an already-fetched {_id, name, email, role, token} payload to
  // state + localStorage. Shared by every flow that ends in "user is now
  // logged in" — password login, Google login, and (Step 20) registration,
  // since register's response has this same shape and should log the user
  // straight in rather than making them log in again right after signing up.
  setAuth: (data) => {
    localStorage.setItem('jp_token', data.token);
    localStorage.setItem('jp_user', JSON.stringify(data));
    set({ user: data, token: data.token, isAuthenticated: true });
  },

  login: async (email, password) => {
    const { data } = await loginApi({ email, password });
    get().setAuth(data.data);
    return data.data;
  },

  loginWithGoogle: async (credential) => {
    const { data } = await googleAuthApi(credential);
    get().setAuth(data.data);
    return data.data;
  },

  logout: () => {
    localStorage.removeItem('jp_token');
    localStorage.removeItem('jp_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    const merged = { ...get().user, ...updates };
    localStorage.setItem('jp_user', JSON.stringify(merged));
    set({ user: merged });
  },

  // Re-fetches /users/me — used after anything that might change role/
  // profile data server-side without the client knowing (e.g. an admin
  // promotion), so the stored user doesn't go stale.
  refreshUser: async () => {
    const { data } = await getMe();
    const merged = { ...get().user, ...data.data };
    localStorage.setItem('jp_user', JSON.stringify(merged));
    set({ user: merged });
    return merged;
  },
}));

export default useAuthStore;
