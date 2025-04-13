import { create } from 'zustand';

type ModalType = 'confirm' | 'report' | 'log' | 'quest' | null;

type ModalState = {
  currentModal: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  currentModal: null,
  openModal: (type) => set({ currentModal: type }),
  closeModal: () => set({ currentModal: null }),
}));
