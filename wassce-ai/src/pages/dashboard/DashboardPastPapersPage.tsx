import PassPaperViewer from "../../dashboard/pass-papers/PassPaperViewer";

export default function DashboardPastPapersPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Past papers</p>
        <h1 className="text-2xl font-semibold text-slate-900">Exam practice library</h1>
        <p className="mt-2 text-sm text-slate-600">Filter papers, open PDFs, and use them as the source of your practice blocks.</p>
      </header>
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <PassPaperViewer />
      </section>
    </div>
  );
}
