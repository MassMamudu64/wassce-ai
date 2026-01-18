type Provider = "mtn" | "lonestar";

interface BillingFormProps {
  provider: Provider;
  phone: string;
  amount: number;
  busy: boolean;
  onProvider: (provider: Provider) => void;
  onPhone: (phone: string) => void;
  onAmount: (amount: number) => void;
  onPay: () => void;
}

export default function BillingForm({
  provider,
  phone,
  amount,
  busy,
  onProvider,
  onPhone,
  onAmount,
  onPay,
}: BillingFormProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Provider</span>
          <select
            value={provider}
            onChange={(e) => onProvider(e.target.value as Provider)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="mtn">MTN MoMo</option>
            <option value="lonestar">Lonestar Cell Money</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Phone</span>
          <input
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            placeholder="231XXXXXXXX"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Amount (LRD)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
        </label>
      </div>

      <div className="mt-5">
        <button
          type="button"
          disabled={busy}
          onClick={onPay}
          className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Sending request..." : "Pay Now"}
        </button>
      </div>
    </section>
  );
}
