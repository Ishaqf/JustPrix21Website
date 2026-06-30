import { create } from 'zustand';

// Global app-level flags set from outside React components (e.g. the axios
// interceptor) — therefore can't use useToastStore/navigate as hooks.
// Access from non-React code via useAppStore.getState().<action>().
const useAppStore = create((set) => ({
  isMaintenance: false,
  setMaintenance: (v) => set({ isMaintenance: v }),
}));

export default useAppStore;
