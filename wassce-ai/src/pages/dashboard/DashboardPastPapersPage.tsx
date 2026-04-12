import PaperViewer from "../../dashboard/pass-papers/PaperViewer";

export default function DashboardPastPapersPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Past papers</p>
        <h1 className="text-2xl font-semibold text-slate-900">Interactive exam practice</h1>
        <p className="mt-2 text-sm text-slate-600">
          Select a subject, year, and paper to begin. Answer questions one at a time, track your progress, and identify weak topics.
        </p>
      </header>
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <PaperViewer />
      </section>
    </div>
  );
}
