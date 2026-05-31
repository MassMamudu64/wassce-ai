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

const initialState: BillingStateData = { isPremium: false, lastPaymentId: null };

export const useBillingStore = create<BillingState>()((set, get) => ({
  userRef: null,
  ...initialState,
  setUserRef: (userRef) => set({ userRef }),
  // Premium is NOT trusted from persisted client state — it is overwritten by
  // the server entitlement check. Only the convenience `lastPaymentId` is kept.
  hydrate: (data) => set({ isPremium: false, lastPaymentId: data?.lastPaymentId ?? null }),
  // Local-only cache of the server's entitlement decision; never written back to
  // the database as an authority (that was the privilege-escalation vector).
  setPremium: (premium) => set({ isPremium: premium }),
  setLastPaymentId: (id) => {
    set({ lastPaymentId: id });
    const userRef = get().userRef;
    if (userRef) void upsertBillingState(userRef, { isPremium: get().isPremium, lastPaymentId: id }).catch(() => {});
  },
}));
