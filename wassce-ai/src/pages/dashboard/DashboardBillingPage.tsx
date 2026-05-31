import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBillingStore } from "../../stores/billingStore";
import { authedFetch } from "../../utils/apiClient";
import { fetchEntitlements, type PlanId } from "../../utils/entitlements";
import BillingForm from "./billing/BillingForm";
import PaymentStatusCard from "./billing/PaymentStatusCard";
import { usePaymentPolling } from "./billing/usePaymentPolling";

type Provider = "mtn" | "lonestar";
type Status = "PENDING" | "SUCCESS" | "FAILED";

export default function DashboardBillingPage() {
  const { user } = useAuth();
  const billing = useBillingStore();
  const premium = billing.isPremium;

  const [provider, setProvider] = useState<Provider>("mtn");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<PlanId>("premium_monthly");
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Premium comes from the server entitlement check, never from local state.
  const refreshEntitlement = () => {
    void fetchEntitlements().then((ent) => billing.setPremium(ent.isPremium));
  };
  useEffect(refreshEntitlement, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  usePaymentPolling(billing.lastPaymentId, (next) => {
    setStatus(next);
    if (next === "SUCCESS") refreshEntitlement();
  });

  const payNow = async () => {
    setError(null);
    setStatus(null);
    if (!user?.id) return setError("Sign in to complete payment.");
    if (phone.trim().length < 8) return setError("Enter a valid phone number.");
    setBusy(true);
    try {
      // Only provider/phone/plan are sent — the price and the user identity are
      // resolved server-side from the verified session, so neither can be tampered with.
      const res = await authedFetch("/api/payments", {
        method: "POST",
        body: JSON.stringify({ provider, phone: phone.trim(), plan }),
      });
      const data = (await res.json()) as { id?: string; error?: string; status?: Status };
      if (res.status === 401) throw new Error("Your session expired. Please sign in again.");
      if (!res.ok || !data.id) throw new Error(data.error ?? "Payment initiation failed");
      billing.setLastPaymentId(data.id);
      setStatus(data.status ?? "PENDING");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment initiation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Billing</p>
        <h1 className="text-2xl font-semibold text-slate-900">Unlock Premium</h1>
        <p className="mt-2 text-sm text-slate-600">Pay with MTN MoMo or Lonestar Cell Money. Status updates automatically.</p>
      </header>

      <BillingForm
        provider={provider}
        phone={phone}
        plan={plan}
        busy={busy}
        onProvider={setProvider}
        onPhone={setPhone}
        onPlan={setPlan}
        onPay={payNow}
      />

      <PaymentStatusCard premium={premium} paymentId={billing.lastPaymentId} status={status} error={error} />
    </div>
  );
}
