import test from "node:test";
import assert from "node:assert/strict";

// config.must("DATABASE_URL") runs on import; provide a dummy (no connection made).
process.env.DATABASE_URL ??= "postgres://localhost/test";

const { parseCreatePayment } = await import("../src/payments/validation.ts");

test("accepts a valid plan-based payment", () => {
  const input = parseCreatePayment({ provider: "mtn", phone: "231770000000", plan: "premium_monthly" });
  assert.equal(input.provider, "mtn");
  assert.equal(input.plan, "premium_monthly");
  assert.equal(input.phone, "231770000000");
});

test("NEVER trusts a client-supplied amount (amount is not part of the parsed input)", () => {
  const input = parseCreatePayment({
    provider: "lonestar",
    phone: "0770000000",
    plan: "premium_termly",
    amount: 1, // attacker attempts to pay 1 unit
  });
  assert.equal((input as Record<string, unknown>).amount, undefined);
  assert.equal(input.plan, "premium_termly");
});

test("rejects an unknown plan", () => {
  assert.throws(() => parseCreatePayment({ provider: "mtn", phone: "231770000000", plan: "free" }), /Invalid plan/);
});

test("rejects an unknown provider", () => {
  assert.throws(() => parseCreatePayment({ provider: "paypal", phone: "231770000000", plan: "premium_monthly" }), /Invalid provider/);
});

test("rejects a malformed phone number", () => {
  assert.throws(() => parseCreatePayment({ provider: "mtn", phone: "abc", plan: "premium_monthly" }), /Invalid phone/);
  assert.throws(() => parseCreatePayment({ provider: "mtn", phone: "123", plan: "premium_monthly" }), /Invalid phone/);
});

test("rejects a non-object body", () => {
  assert.throws(() => parseCreatePayment(null), /Invalid body/);
  assert.throws(() => parseCreatePayment("nope"), /Invalid body/);
});
