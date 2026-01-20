import { create } from "zustand";
import { upsertBillingState } from "../utils/supabaseData";

type BillingState = {
  userRef: string | null;
  isPremium: boolean;
  lastPaymentId: string | null;
  setUserRef: (userRef: string | null) => void;
  hydrate: (data: BillingStateData | null) => void;
  setPremium: (premium: boolean) => void;
  setLastPaymentId: (id: string | null) => void;
};

export type BillingStateData = {
  isPremium: boolean;
  lastPaymentId: string | null;
};

const persistState = (userRef: string | null, data: BillingStateData) => {
  if (!userRef) return;
  void upsertBillingState(userRef, data).catch(() => {});
};

const initialState: BillingStateData = { isPremium: false, lastPaymentId: null };

export const useBillingStore = create<BillingState>()((set, get) => ({
  userRef: null,
  ...initialState,
  setUserRef: (userRef) => set({ userRef }),
  hydrate: (data) => set({ ...(data ?? initialState) }),
  setPremium: (premium) => {
    set({ isPremium: premium });
    persistState(get().userRef, { isPremium: premium, lastPaymentId: get().lastPaymentId });
  },
  setLastPaymentId: (id) => {
    set({ lastPaymentId: id });
    persistState(get().userRef, { isPremium: get().isPremium, lastPaymentId: id });
  },
}));
