// stores/useLogStore.ts
import { create } from "zustand";

export type Log = { content: string; timestamp: string };

type State = {
  logs: Log[];
  fetchLogs: () => Promise<void>;
};

export const useLogStore = create<State>((set) => ({
  logs: [],
  fetchLogs: async () => {
    const res = await fetch("/api/logs");
    const data = await res.json();
    set({ logs: data.logs });
  },
}));
