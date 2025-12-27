import crypto from "crypto";
import { config } from "../config";
import type { PaymentProvider } from "./providerTypes";

const token = async () => {
  if (!config.mtn.subscriptionKey || !config.mtn.apiUser || !config.mtn.apiKey) {
    throw new Error("MTN MoMo credentials are not configured.");
  }
  const res = await fetch(`${config.mtn.baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.mtn.apiUser}:${config.mtn.apiKey}`).toString("base64")}`,
      "Ocp-Apim-Subscription-Key": config.mtn.subscriptionKey,
    },
  });
  const json = (await res.json()) as { access_token?: string };
  if (!res.ok || !json.access_token) throw new Error("Failed to fetch MTN MoMo token");
  return json.access_token;
};

const mapStatus = (value: string) => {
  const normalized = value.toUpperCase();
  if (normalized === "SUCCESSFUL") return "SUCCESS";
  if (normalized === "FAILED" || normalized === "REJECTED") return "FAILED";
  return "PENDING";
};

export const mtnMomoProvider: PaymentProvider = {
  id: "mtn",
  initiate: async ({ amount, currency, phone, paymentId }) => {
    const accessToken = await token();
    const externalRef = crypto.randomUUID();
    const res = await fetch(`${config.mtn.baseUrl}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Reference-Id": externalRef,
        "X-Target-Environment": config.mtn.targetEnv,
        "Ocp-Apim-Subscription-Key": config.mtn.subscriptionKey,
        "Content-Type": "application/json",
        ...(config.mtn.callbackUrl ? { "X-Callback-Url": config.mtn.callbackUrl } : {}),
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency,
        externalId: paymentId,
        payer: { partyIdType: "MSISDN", partyId: phone },
        payerMessage: "WASSCE AI premium subscription",
        payeeNote: "WASSCE AI",
      }),
    });
    if (!res.ok) throw new Error(`MTN MoMo request-to-pay failed (${res.status})`);
    return { externalRef };
  },
  getStatus: async (externalRef) => {
    if (!config.mtn.targetEnv) throw new Error("MTN MoMo target environment is not configured.");
    const accessToken = await token();
    const res = await fetch(`${config.mtn.baseUrl}/collection/v1_0/requesttopay/${externalRef}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Target-Environment": config.mtn.targetEnv,
        "Ocp-Apim-Subscription-Key": config.mtn.subscriptionKey,
      },
    });
    const json = (await res.json()) as { status?: string };
    if (!res.ok || !json.status) throw new Error("MTN MoMo status check failed");
    return { status: mapStatus(json.status), raw: json };
  },
};
