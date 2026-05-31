import { authedFetch } from "./apiClient";

export type PlanId = "premium_monthly" | "premium_termly";

export type Entitlement = {
  isPremium: boolean;
  plan?: string | null;
  since?: string;
  expiresAt?: string;
};

export const PLAN_OPTIONS: { id: PlanId; label: string; price: string }[] = [
  { id: "premium_monthly", label: "Premium — Monthly", price: "LRD 2,000" },
  { id: "premium_termly", label: "Premium — Term (3 months)", price: "LRD 5,000" },
];

/**
 * Server-authoritative premium check. Premium is computed by the API from the
 * payments ledger and can never be granted or spoofed by the client.
 */
export const fetchEntitlements = async (): Promise<Entitlement> => {
  try {
    const res = await authedFetch("/api/me/entitlements");
    if (!res.ok) return { isPremium: false };
    return (await res.json()) as Entitlement;
  } catch {
    return { isPremium: false };
  }
};
