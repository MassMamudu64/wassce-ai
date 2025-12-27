import { create } from "zustand";
import { persist } from "zustand/middleware";

type BillingState = {
  premiumByUser: Record<string, boolean>;
  lastPaymentId: string | null;
  isPremium: (userRef: string | null | undefined) => boolean;
  setPremium: (userRef: string, premium: boolean) => void;
  setLastPaymentId: (id: string | null) => void;
};

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      premiumByUser: {},
      lastPaymentId: null,
      isPremium: (userRef) => Boolean(userRef && get().premiumByUser[userRef]),
      setPremium: (userRef, premium) =>
        set((state) => ({ premiumByUser: { ...state.premiumByUser, [userRef]: premium } })),
      setLastPaymentId: (id) => set({ lastPaymentId: id }),
    }),
    { name: "billing-storage" },
  ),
);

