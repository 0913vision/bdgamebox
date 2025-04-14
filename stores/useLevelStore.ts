// useLevelStore.ts
import { create } from "zustand";

type State = {
  level: number | null;
  loading: boolean;
  fetchLevel: () => Promise<void>;
};

export const useLevelStore = create<State>((set) => ({
  level: null,
  loading: false,
  fetchLevel: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/state");
      const data = await res.json();
      set({ level: data.level });
    } catch {
      set({ level: null });
    } finally {
      set({ loading: false });
    }
  },
}));
