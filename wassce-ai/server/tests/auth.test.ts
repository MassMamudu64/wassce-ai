import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

// Configure env BEFORE importing the module that reads it.
const SECRET = "test-jwt-secret-do-not-use-in-prod";
process.env.DATABASE_URL ??= "postgres://localhost/test";
process.env.SUPABASE_JWT_SECRET = SECRET;
// Leave SUPABASE_URL unset so the remote fallback is disabled and we test the
// local HS256 path deterministically.
delete process.env.SUPABASE_URL;

const { verifySupabaseToken } = await import("../src/auth/verifySupabaseToken.ts");

const signHs256 = (payload: Record<string, unknown>, secret = SECRET, alg = "HS256") => {
  const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = enc({ alg, typ: "JWT" });
  const body = enc(payload);
  const sig = crypto.createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
};

const future = Math.floor(Date.now() / 1000) + 3600;
const past = Math.floor(Date.now() / 1000) - 3600;

test("verifies a valid HS256 token and extracts the user id", async () => {
  const token = signHs256({ sub: "user-123", email: "a@b.com", role: "authenticated", exp: future });
  const user = await verifySupabaseToken(token);
  assert.equal(user?.id, "user-123");
  assert.equal(user?.email, "a@b.com");
});

test("rejects an expired token", async () => {
  const token = signHs256({ sub: "user-123", exp: past });
  assert.equal(await verifySupabaseToken(token), null);
});

test("rejects a token signed with the wrong secret (forgery)", async () => {
  const token = signHs256({ sub: "user-123", exp: future }, "attacker-secret");
  assert.equal(await verifySupabaseToken(token), null);
});

test("rejects a tampered payload (signature mismatch)", async () => {
  const token = signHs256({ sub: "user-123", exp: future });
  const parts = token.split(".");
  const forgedPayload = Buffer.from(JSON.stringify({ sub: "admin", role: "service_role", exp: future })).toString("base64url");
  const tampered = `${parts[0]}.${forgedPayload}.${parts[2]}`;
  assert.equal(await verifySupabaseToken(tampered), null);
});

test("rejects a token with no subject", async () => {
  const token = signHs256({ email: "a@b.com", exp: future });
  assert.equal(await verifySupabaseToken(token), null);
});

test("rejects an empty / malformed token", async () => {
  assert.equal(await verifySupabaseToken(""), null);
  assert.equal(await verifySupabaseToken("not.a.jwt"), null);
});
