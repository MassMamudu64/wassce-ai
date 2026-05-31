import { Router } from "express";
import type { Response } from "express";
import { config } from "../config";
import { findByExternalRef, transitionStatus } from "../payments/repo";
import type { Provider } from "../payments/types";
import { getProvider } from "../providers";
import { verifyHmac } from "../http/verifyWebhook";
import type { RawBodyRequest } from "../http/rawBody";

const getExternalRef = (body: unknown) => {
  if (!body || typeof body !== "object") return null;
  const payload = body as Record<string, unknown>;
  const value = payload.externalRef ?? payload.referenceId ?? payload.reference ?? payload.ref;
  return typeof value === "string" ? value : null;
};

const handleWebhook = async (providerId: Provider, req: RawBodyRequest, res: Response) => {
  const secret = providerId === "mtn" ? config.webhook.momoSecret : config.webhook.lonestarSecret;
  const verified = secret ? verifyHmac(req, secret) : false;
  if (config.webhook.requireSignature && !verified) return res.status(401).json({ error: "Invalid signature" });

  const externalRef = getExternalRef(req.body);
  if (!externalRef || typeof externalRef !== "string") return res.status(400).json({ error: "Missing externalRef" });

  const payment = await findByExternalRef(externalRef);
  if (!payment) return res.status(404).json({ error: "Payment not found" });

  // Replay protection: settled payments are terminal, so a re-delivered or
  // forged webhook for an already-resolved payment is a no-op. We also re-query
  // the provider rather than trusting any status in the webhook body.
  if (payment.status !== "PENDING") return res.json({ ok: true });

  const provider = getProvider(providerId);
  const { status } = await provider.getStatus(externalRef);
  await transitionStatus(payment.id, status);
  res.json({ ok: true });
};

export const webhooksRouter = Router();

webhooksRouter.post("/momo", async (req, res) => handleWebhook("mtn", req as RawBodyRequest, res));
webhooksRouter.post("/lonestar", async (req, res) => handleWebhook("lonestar", req as RawBodyRequest, res));
