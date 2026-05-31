import { PLANS, type PlanId } from "../config";
import type { Provider } from "./types";

export type CreatePaymentInput = { provider: Provider; phone: string; plan: PlanId };

const isPlanId = (value: unknown): value is PlanId =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(PLANS, value);

export const parseCreatePayment = (body: unknown): CreatePaymentInput => {
  if (!body || typeof body !== "object") throw new Error("Invalid body");
  const b = body as Record<string, unknown>;
  const provider = b.provider;
  const phone = b.phone;
  const plan = b.plan;

  if (provider !== "mtn" && provider !== "lonestar") throw new Error("Invalid provider");
  if (typeof phone !== "string") throw new Error("Invalid phone");
  const phoneDigits = phone.replace(/[\s+\-()]/g, "");
  if (!/^\d{8,15}$/.test(phoneDigits)) throw new Error("Invalid phone");
  // The amount is NEVER taken from the client — only a known plan id is accepted
  // and the server resolves the authoritative price from PLANS.
  if (!isPlanId(plan)) throw new Error("Invalid plan");

  return { provider, phone: phone.trim(), plan };
};
