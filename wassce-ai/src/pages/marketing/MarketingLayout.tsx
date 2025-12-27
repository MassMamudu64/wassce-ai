import { GraduationCap } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function MarketingLayout({ title, subtitle, children }: Props) {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">WASSCE AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth/signin" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              Sign in
            </Link>
            <Link to="/auth/signup" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
          {subtitle ? <p className="mt-3 text-sm leading-relaxed text-slate-600">{subtitle}</p> : null}
        </div>
        <div className="mt-10">{children}</div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} WASSCE AI</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-slate-900">
              Terms
            </Link>
            <Link to="/help" className="hover:text-slate-900">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

