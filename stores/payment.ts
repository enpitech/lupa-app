import { create } from 'zustand';

interface PaymentState {
  title: string;
  setTitle: (title: string) => void;
  resetTitle: () => void;
}

const usePaymentStore = create<PaymentState>((set) => ({
  title: '',
  setTitle: (title) => set({ title }),
  resetTitle: () => set({ title: '' }),
}));

export default usePaymentStore;
