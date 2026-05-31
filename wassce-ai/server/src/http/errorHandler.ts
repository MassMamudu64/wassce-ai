import type { NextFunction, Request, Response } from "express";
import type { RequestWithId } from "./logger";

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
};

/**
 * Centralized error handler. Logs the full error server-side but returns a
 * generic message to the client so internal details are never leaked.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express needs the 4-arg signature
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const requestId = (req as RequestWithId).requestId ?? null;
  const message = err instanceof Error ? err.message : String(err);
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "error",
      requestId,
      path: req.originalUrl.split("?")[0],
      error: message,
    }),
  );
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error", requestId });
};
