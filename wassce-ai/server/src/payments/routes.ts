import crypto from "crypto";
import { Router } from "express";
import { getProvider } from "../providers";
import { createPayment, findById, setExternalRef, setStatus } from "./repo";
import { parseCreatePayment } from "./validation";

const maskPhone = (phone: string) => phone.replace(/\d(?=\d{3})/g, "*");

export const paymentsRouter = Router();

paymentsRouter.post("/", async (req, res) => {
  try {
    const input = parseCreatePayment(req.body);
    const id = crypto.randomUUID();
    const payment = await createPayment({
      id,
      provider: input.provider,
      amount: input.amount,
      phone: input.phone,
      currency: input.currency ?? "LRD",
      userRef: input.userRef ?? null,
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
    res.json({ id, status: payment.status, provider: payment.provider });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to initiate payment";
    res.status(400).json({ error: message });
  }
});

paymentsRouter.get("/:id", async (req, res) => {
  const payment = await findById(req.params.id);
  if (!payment) return res.status(404).json({ error: "Not found" });
  if (payment.status === "PENDING" && payment.externalRef) {
    try {
      const provider = getProvider(payment.provider);
      const { status } = await provider.getStatus(payment.externalRef);
      const updated = status === payment.status ? payment : await setStatus(payment.id, status);
      if (updated) {
        return res.json({
          id: updated.id,
          provider: updated.provider,
          amount: updated.amount,
          currency: updated.currency,
          phone: maskPhone(updated.phone),
          status: updated.status,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        });
      }
    } catch {
      // Keep PENDING if provider status check fails.
    }
  }
  res.json({
    id: payment.id,
    provider: payment.provider,
    amount: payment.amount,
    currency: payment.currency,
    phone: maskPhone(payment.phone),
    status: payment.status,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  });
});
