import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBillingStore } from "../../stores/billingStore";
import BillingForm from "./billing/BillingForm";
import PaymentStatusCard from "./billing/PaymentStatusCard";
import { usePaymentPolling } from "./billing/usePaymentPolling";

type Provider = "mtn" | "lonestar";
type Status = "PENDING" | "SUCCESS" | "FAILED";

export default function DashboardBillingPage() {
  const { user } = useAuth();
  const billing = useBillingStore();
  const userRef = user?.email ?? user?.id;
  const premium = billing.isPremium;

  const [provider, setProvider] = useState<Provider>("mtn");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(20);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  usePaymentPolling(billing.lastPaymentId, (next) => {
    setStatus(next);
    if (next === "SUCCESS") billing.setPremium(true);
  });

  const payNow = async () => {
    setError(null);
    setStatus(null);
    if (!userRef) return setError("Sign in to complete payment.");
    if (phone.trim().length < 8) return setError("Enter a valid phone number.");
    if (amount <= 0) return setError("Enter a valid amount.");
    setBusy(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, phone: phone.trim(), amount, currency: "LRD", userRef }),
      });
      const data = (await res.json()) as { id?: string; error?: string; status?: Status };
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
        amount={amount}
        busy={busy}
        onProvider={setProvider}
        onPhone={setPhone}
        onAmount={setAmount}
        onPay={payNow}
      />

      <PaymentStatusCard premium={premium} paymentId={billing.lastPaymentId} status={status} error={error} />
    </div>
  );
}
