import type { Provider } from "./types";

export type CreatePaymentInput = { provider: Provider; phone: string; amount: number; currency?: string; userRef?: string };

export const parseCreatePayment = (body: unknown): CreatePaymentInput => {
  if (!body || typeof body !== "object") throw new Error("Invalid body");
  const b = body as Record<string, unknown>;
  const provider = b.provider;
  const phone = b.phone;
  const amount = b.amount;
  const currency = b.currency;
  const userRef = b.userRef;

  // Upper bound prevents abuse / accidental overflow; tune to product limits.
  const MAX_AMOUNT = 1_000_000;

  if (provider !== "mtn" && provider !== "lonestar") throw new Error("Invalid provider");
  if (typeof phone !== "string") throw new Error("Invalid phone");
  const phoneDigits = phone.replace(/[\s+\-()]/g, "");
  if (!/^\d{8,15}$/.test(phoneDigits)) throw new Error("Invalid phone");
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT)
    throw new Error("Invalid amount");
  if (currency !== undefined && typeof currency !== "string") throw new Error("Invalid currency");
  if (userRef !== undefined && typeof userRef !== "string") throw new Error("Invalid userRef");

  return { provider, phone: phone.trim(), amount: Math.round(amount), currency, userRef };
};

