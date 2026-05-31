import crypto from "crypto";
import { config } from "../config";
import type { AuthUser } from "./types";

const b64urlDecode = (input: string): Buffer =>
  Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  aud?: string | string[];
};

/**
 * Verify a Supabase access token locally using the project's HS256 JWT secret.
 * Returns the authenticated user or `null` if the token is invalid/expired.
 */
const verifyHs256 = (token: string, secret: string): AuthUser | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;

  let header: { alg?: string; typ?: string };
  let payload: JwtPayload;
  try {
    header = JSON.parse(b64urlDecode(headerB64).toString("utf8"));
    payload = JSON.parse(b64urlDecode(payloadB64).toString("utf8"));
  } catch {
    return null;
  }

  // Only HS256 is verifiable with the shared secret. Asymmetric tokens
  // (ES256/RS256) fall through to remote verification.
  if (header.alg !== "HS256") return null;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest();
  const provided = b64urlDecode(signatureB64);
  if (expected.length !== provided.length) return null;
  if (!crypto.timingSafeEqual(expected, provided)) return null;

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) return null;
  if (!payload.sub) return null;

  return { id: payload.sub, email: payload.email ?? null, role: payload.role ?? null };
};

/**
 * Verify a Supabase access token by calling the Supabase Auth API. Works for
 * both HS256 (legacy) and asymmetric signing schemes. Used as a fallback when
 * no local JWT secret is configured.
 */
const verifyRemote = async (token: string): Promise<AuthUser | null> => {
  const { url, anonKey } = config.supabase;
  if (!url || !anonKey) return null;
  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string; email?: string; role?: string };
    if (!user.id) return null;
    return { id: user.id, email: user.email ?? null, role: user.role ?? null };
  } catch {
    return null;
  }
};

export const verifySupabaseToken = async (token: string): Promise<AuthUser | null> => {
  if (!token) return null;
  if (config.supabase.jwtSecret) {
    const local = verifyHs256(token, config.supabase.jwtSecret);
    if (local) return local;
  }
  return verifyRemote(token);
};
