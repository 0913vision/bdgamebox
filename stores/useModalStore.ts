import { create } from 'zustand';

type ModalType = 'confirm' | 'report' | 'log' | 'quest' | 'complete' |null;

type ModalState = {
  currentModal: ModalType;
  reportIndex: number | null;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  currentModal: null,
  reportIndex: null,
  openModal: (type) => set({ currentModal: type }),
  closeModal: () => set({ currentModal: null }),
}));
