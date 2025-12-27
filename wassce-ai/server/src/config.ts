const must = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: must("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://127.0.0.1:4173",
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "http://localhost:3001",
  webhook: {
    requireSignature: process.env.WEBHOOK_REQUIRE_SIGNATURE === "true",
    momoSecret: process.env.WEBHOOK_SECRET_MOMO ?? "",
    lonestarSecret: process.env.WEBHOOK_SECRET_LONESTAR ?? "",
  },
  mtn: {
    baseUrl: process.env.MTN_MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com",
    targetEnv: process.env.MTN_MOMO_TARGET_ENV ?? "",
    subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? "",
    apiUser: process.env.MTN_MOMO_API_USER ?? "",
    apiKey: process.env.MTN_MOMO_API_KEY ?? "",
    callbackUrl: process.env.MTN_MOMO_CALLBACK_URL ?? "",
    currency: process.env.MTN_MOMO_CURRENCY ?? "LRD",
  },
  lonestar: {
    baseUrl: process.env.LONESTAR_BASE_URL ?? "",
    merchantId: process.env.LONESTAR_MERCHANT_ID ?? "",
    apiKey: process.env.LONESTAR_API_KEY ?? "",
    apiSecret: process.env.LONESTAR_API_SECRET ?? "",
    callbackUrl: process.env.LONESTAR_CALLBACK_URL ?? "",
    initPath: process.env.LONESTAR_INIT_PATH ?? "/payments",
    statusPath: process.env.LONESTAR_STATUS_PATH ?? "/payments/{ref}",
    currency: process.env.LONESTAR_CURRENCY ?? "LRD",
  },
} as const;
