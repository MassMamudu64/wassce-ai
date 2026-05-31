import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import type { AuthedRequest } from "../auth/types";

export type RequestWithId = Request & { requestId?: string };

const redactPath = (path: string) =>
  // Avoid logging UUIDs/refs verbatim in the path segment.
  path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id");

/**
 * Structured (JSON) request/audit logger. Emits one line per completed request
 * with a correlation id, never logging request bodies or auth tokens.
 */
export const requestLogger = (req: RequestWithId, res: Response, next: NextFunction) => {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const entry = {
      ts: new Date().toISOString(),
      level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
      requestId,
      method: req.method,
      path: redactPath(req.originalUrl.split("?")[0]),
      status: res.statusCode,
      durationMs: Math.round(durationMs),
      userId: (req as AuthedRequest).auth?.id ?? null,
      ip: req.ip,
    };
    console.log(JSON.stringify(entry));
  });

  next();
};
