import type { NextFunction, Response } from "express";
import { config } from "../config";
import { verifySupabaseToken } from "./verifySupabaseToken";
import type { AuthedRequest, AuthUser } from "./types";

const bearer = (req: AuthedRequest): string | null => {
  const header = req.header("authorization") ?? req.header("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
};

/**
 * Express middleware that requires a valid Supabase access token and attaches
 * the verified user to `req.auth`. The user identity is derived ONLY from the
 * verified token — never from the request body — which prevents user/role
 * spoofing and privilege escalation.
 *
 * Dev escape hatch: when `AUTH_REQUIRED=false` AND no auth is configured, an
 * `x-debug-user` header is accepted. This is intentionally unavailable once any
 * Supabase auth config is present, so it can never weaken a real deployment.
 */
export const requireAuth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const token = bearer(req);

  if (token) {
    const user = await verifySupabaseToken(token);
    if (user) {
      req.auth = user;
      return next();
    }
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const authConfigured = Boolean(config.supabase.jwtSecret || (config.supabase.url && config.supabase.anonKey));
  if (!config.auth.required && !authConfigured) {
    const debugUser = req.header("x-debug-user");
    if (debugUser) {
      const user: AuthUser = { id: debugUser, email: null, role: "authenticated" };
      req.auth = user;
      return next();
    }
  }

  return res.status(401).json({ error: "Authentication required" });
};
