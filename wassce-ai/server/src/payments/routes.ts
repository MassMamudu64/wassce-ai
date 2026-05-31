import crypto from "crypto";
import { Router } from "express";
import { PLANS } from "../config";
import { requireAuth } from "../auth/requireAuth";
import type { AuthedRequest } from "../auth/types";
import { getProvider } from "../providers";
import {
  createPayment,
  findById,
  findLatestSuccessfulPayment,
  setExternalRef,
  setStatus,
  transitionStatus,
} from "./repo";
import { parseCreatePayment } from "./validation";

const maskPhone = (phone: string) => phone.replace(/\d(?=\d{3})/g, "*");

const planDurationDays = (plan: string | null) =>
  (plan && plan in PLANS ? PLANS[plan as keyof typeof PLANS].durationDays : 30);

export const paymentsRouter = Router();

// All payment endpoints require a verified Supabase session.
paymentsRouter.use(requireAuth);

paymentsRouter.post("/", async (req: AuthedRequest, res) => {
  try {
    const input = parseCreatePayment(req.body);
    const userRef = req.auth!.id; // derived from the verified token, not the body
    const plan = PLANS[input.plan];

    const id = crypto.randomUUID();
    const payment = await createPayment({
      id,
      provider: input.provider,
      amount: plan.amount, // server-authoritative price
      phone: input.phone,
      currency: plan.currency,
      userRef,
      plan: plan.id,
    });

    const provider = getProvider(input.provider);
    try {
      const initiated = await provider.initiate({
        paymentId: id,
        amount: payment.amount,
        phone: payment.phone,
        currency: payment.currency,
      });
      await setExternalRef(id, initiated.externalRef);
    } catch (e) {
      await setStatus(id, "FAILED");
      throw e;
    }
    res.json({ id, status: payment.status, provider: payment.provider, amount: payment.amount, currency: payment.currency });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to initiate payment";
    res.status(400).json({ error: message });
  }
});

paymentsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const payment = await findById(req.params.id);
  if (!payment) return res.status(404).json({ error: "Not found" });
  // Ownership check: a user can only read their own payments.
  if (payment.userRef !== req.auth!.id) return res.status(404).json({ error: "Not found" });

  let current = payment;
  if (current.status === "PENDING" && current.externalRef) {
    try {
      const provider = getProvider(current.provider);
      const { status } = await provider.getStatus(current.externalRef);
      if (status !== "PENDING") {
        current = (await transitionStatus(current.id, status)) ?? current;
      }
    } catch {
      // Keep PENDING if provider status check fails.
    }
  }

  res.json({
    id: current.id,
    provider: current.provider,
    amount: current.amount,
    currency: current.currency,
    phone: maskPhone(current.phone),
    status: current.status,
    plan: current.plan,
    createdAt: current.createdAt,
    updatedAt: current.updatedAt,
  });
});

// Server-authoritative entitlement. Premium is derived from the payments ledger
// for the authenticated user — it can never be set or spoofed by the client.
export const entitlementsRouter = Router();
entitlementsRouter.use(requireAuth);
entitlementsRouter.get("/", async (req: AuthedRequest, res) => {
  const userRef = req.auth!.id;
  const latest = await findLatestSuccessfulPayment(userRef);
  if (!latest) return res.json({ isPremium: false });

  const since = new Date(latest.updatedAt);
  const expiresAt = new Date(since.getTime() + planDurationDays(latest.plan) * 24 * 60 * 60 * 1000);
  const isPremium = expiresAt.getTime() > Date.now();
  res.json({
    isPremium,
    plan: latest.plan,
    since: latest.updatedAt,
    expiresAt: expiresAt.toISOString(),
  });
});
