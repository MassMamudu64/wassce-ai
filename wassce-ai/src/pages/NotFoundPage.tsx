import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-slate-400">The page you requested doesn’t exist.</p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600"
          >
            Go to landing
          </Link>
          <Link
            to="/dashboard/overview"
            className="rounded-xl border border-emerald-400/60 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/20"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

