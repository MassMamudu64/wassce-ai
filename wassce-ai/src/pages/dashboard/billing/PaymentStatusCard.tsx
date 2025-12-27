type Status = "PENDING" | "SUCCESS" | "FAILED";

interface PaymentStatusCardProps {
  premium: boolean;
  paymentId: string | null;
  status: Status | null;
  error: string | null;
}

export default function PaymentStatusCard({ premium, paymentId, status, error }: PaymentStatusCardProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <div>
          Premium:{" "}
          <span className={premium ? "font-semibold text-emerald-300" : "font-semibold text-amber-300"}>
            {premium ? "Unlocked" : "Locked"}
          </span>
        </div>
        {paymentId ? <div className="text-xs text-slate-400">Payment ID: {paymentId}</div> : null}
      </div>

      {status ? (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-200">
          Status: <span className="font-semibold">{status}</span>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div>
      ) : null}
    </section>
  );
}

