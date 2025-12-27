import crypto from "crypto";
import type { RawBodyRequest } from "./rawBody";

export const verifyHmac = (req: RawBodyRequest, secret: string, headerName = "x-webhook-signature") => {
  if (!secret) return false;
  const signature = req.header(headerName) ?? "";
  const raw = req.rawBody ?? "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

