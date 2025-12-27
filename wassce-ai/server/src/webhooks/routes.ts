import { Router } from "express";
import { config } from "../config";
import { findByExternalRef, setStatus } from "../payments/repo";
import type { Provider } from "../payments/types";
import { getProvider } from "../providers";
import { verifyHmac } from "../http/verifyWebhook";
import type { RawBodyRequest } from "../http/rawBody";

const getExternalRef = (body: any) => body?.externalRef ?? body?.referenceId ?? body?.reference ?? body?.ref ?? null;

const handleWebhook = async (providerId: Provider, req: RawBodyRequest, res: any) => {
  const secret = providerId === "mtn" ? config.webhook.momoSecret : config.webhook.lonestarSecret;
  const verified = secret ? verifyHmac(req, secret) : false;
  if (config.webhook.requireSignature && !verified) return res.status(401).json({ error: "Invalid signature" });

  const externalRef = getExternalRef(req.body);
  if (!externalRef || typeof externalRef !== "string") return res.status(400).json({ error: "Missing externalRef" });

  const payment = await findByExternalRef(externalRef);
  if (!payment) return res.status(404).json({ error: "Payment not found" });

  const provider = getProvider(providerId);
  const { status } = await provider.getStatus(externalRef);
  await setStatus(payment.id, status);
  res.json({ ok: true });
};

export const webhooksRouter = Router();

webhooksRouter.post("/momo", async (req, res) => handleWebhook("mtn", req as RawBodyRequest, res));
webhooksRouter.post("/lonestar", async (req, res) => handleWebhook("lonestar", req as RawBodyRequest, res));

