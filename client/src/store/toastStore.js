import { create } from 'zustand';

let nextId = 1;

const useToastStore = create((set) => ({
  toasts: [],

  showToast: (type, message) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export default useToastStore;
