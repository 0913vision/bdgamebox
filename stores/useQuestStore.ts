// stores/useQuestStore.ts
import { create } from "zustand";

export type Quest = {
  slug: string;
  id: string;
  cooldown: number; // in seconds
  latestTimestamp: Date;
  count: number;
  goal: number;
  icon: string;
};

type State = {
  quests: Quest[];
  fetchQuests: () => Promise<void>;
};

export const useQuestStore = create<State>((set) => ({
  quests: [],
  fetchQuests: async () => {
    const res = await fetch("/api/quest");
    const data = await res.json();
    set({ quests: data.quests });
  },
}));
