import PassPaperViewer from "../../dashboard/pass-papers/PassPaperViewer";

export default function DashboardPastPapersPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Past papers</p>
        <h1 className="text-2xl font-semibold text-white">Exam practice library</h1>
        <p className="mt-2 text-sm text-slate-400">Filter papers, open PDFs, and use them as the source of your practice blocks.</p>
      </header>
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <PassPaperViewer />
      </section>
    </div>
  );
}

