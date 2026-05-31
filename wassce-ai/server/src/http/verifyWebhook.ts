import crypto from "crypto";
import type { RawBodyRequest } from "./rawBody";

export const verifyHmac = (req: RawBodyRequest, secret: string, headerName = "x-webhook-signature") => {
  if (!secret) return false;
  const signature = req.header(headerName) ?? "";
  const raw = req.rawBody ?? "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch — guard so a malformed/short
  // signature yields a clean rejection instead of an unhandled 500.
  if (signatureBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(signatureBuf, expectedBuf);
};

