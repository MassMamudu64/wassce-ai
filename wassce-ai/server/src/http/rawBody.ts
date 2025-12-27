import type { Request } from "express";

export type RawBodyRequest = Request & { rawBody?: string };

export const rawBodySaver = (req: RawBodyRequest, _res: unknown, buf: Buffer) => {
  req.rawBody = buf.toString("utf8");
};

