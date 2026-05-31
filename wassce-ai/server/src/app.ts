import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config";
import { rawBodySaver } from "./http/rawBody";
import { requestLogger } from "./http/logger";
import { errorHandler, notFoundHandler } from "./http/errorHandler";
import { apiLimiter, paymentCreateLimiter, webhookLimiter } from "./http/rateLimit";
import { entitlementsRouter, paymentsRouter } from "./payments/routes";
import { webhooksRouter } from "./webhooks/routes";

const corsOrigins = config.corsOrigin.split(",").map((o) => o.trim()).filter(Boolean);

export const createApp = () => {
  const app = express();
  app.disable("x-powered-by");
  // Trust the first proxy hop (Vercel/Render/etc.) so rate-limit keys on the
  // real client IP, not the proxy.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
      methods: ["GET", "POST"],
    }),
  );
  // Bounded body size to blunt payload-based abuse.
  app.use(express.json({ limit: "16kb", verify: rawBodySaver }));
  app.use(requestLogger);
  app.use("/api", apiLimiter);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.post("/api/payments", paymentCreateLimiter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/me/entitlements", entitlementsRouter);
  app.use("/api/webhooks", webhookLimiter, webhooksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
