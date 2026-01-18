type Status = "PENDING" | "SUCCESS" | "FAILED";

interface PaymentStatusCardProps {
  premium: boolean;
  paymentId: string | null;
  status: Status | null;
  error: string | null;
}

export default function PaymentStatusCard({ premium, paymentId, status, error }: PaymentStatusCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <div>
          Premium:{" "}
          <span className={premium ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
            {premium ? "Unlocked" : "Locked"}
          </span>
        </div>
        {paymentId ? <div className="text-xs text-slate-500">Payment ID: {paymentId}</div> : null}
      </div>

      {status ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Status: <span className="font-semibold">{status}</span>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}
    </section>
  );
}
