import cors from "cors";
import express from "express";
import { config } from "./config";
import { rawBodySaver } from "./http/rawBody";
import { paymentsRouter } from "./payments/routes";
import { webhooksRouter } from "./webhooks/routes";

export const createApp = () => {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ verify: rawBodySaver }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/payments", paymentsRouter);
  app.use("/api/webhooks", webhooksRouter);

  return app;
};

