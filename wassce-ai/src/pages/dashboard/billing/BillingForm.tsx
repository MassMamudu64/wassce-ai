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
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Provider</span>
          <select
            value={provider}
            onChange={(e) => onProvider(e.target.value as Provider)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
          >
            <option value="mtn">MTN MoMo</option>
            <option value="orange">Orange Money</option>
            <option value="lonestar">Lonestar Cell Money</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Phone</span>
          <input
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            placeholder="231XXXXXXXX"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Amount (LRD)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      <div className="mt-5">
        <button
          type="button"
          disabled={busy}
          onClick={onPay}
          className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Sending request..." : "Pay Now"}
        </button>
      </div>
    </section>
  );
}

