import crypto from "crypto";
import { config } from "../config";
import type { PaymentProvider } from "./providerTypes";

const requireLonestar = () => {
  const c = config.lonestar;
  if (!c.baseUrl || !c.merchantId || !c.apiKey || !c.apiSecret) throw new Error("Lonestar credentials are not configured.");
  return c;
};

const sign = (payload: string) => crypto.createHmac("sha256", requireLonestar().apiSecret).update(payload).digest("hex");

const resolvePath = (template: string, externalRef: string) => template.replace("{ref}", encodeURIComponent(externalRef));

export const lonestarProvider: PaymentProvider = {
  id: "lonestar",
  initiate: async ({ amount, currency, phone, paymentId }) => {
    const c = requireLonestar();
    const externalRef = crypto.randomUUID();
    const body = {
      merchantId: c.merchantId,
      amount,
      currency,
      phone,
      reference: externalRef,
      description: "WASSCE AI premium subscription",
      callbackUrl: c.callbackUrl || `${config.publicBaseUrl}/api/webhooks/lonestar`,
      meta: { paymentId },
    };
    const payload = JSON.stringify(body);
    const res = await fetch(`${c.baseUrl}${c.initPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${c.apiKey}`,
        "X-Signature": sign(payload),
      },
      body: payload,
    });
    if (!res.ok) throw new Error(`Lonestar payment request failed (${res.status})`);
    return { externalRef };
  },
  getStatus: async (externalRef) => {
    const c = requireLonestar();
    const url = `${c.baseUrl}${resolvePath(c.statusPath, externalRef)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${c.apiKey}` } });
    const json = (await res.json()) as { status?: string };
    if (!res.ok) throw new Error("Lonestar status check failed");
    const normalized = (json.status ?? "").toUpperCase();
    const status = normalized === "SUCCESS" || normalized === "SUCCESSFUL" ? "SUCCESS" : normalized === "FAILED" ? "FAILED" : "PENDING";
    return { status, raw: json };
  },
};
