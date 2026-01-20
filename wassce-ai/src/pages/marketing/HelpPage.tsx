import { Link } from "react-router-dom";
import MarketingLayout from "./MarketingLayout";

const steps = [
  { t: "1. Create an account", d: "Sign up to access your dashboard with Supabase-backed data." },
  { t: "2. Set up your profile", d: "Choose subjects and exam date to generate your daily plan." },
  { t: "3. Start a session", d: "Use Quizzes, Past Papers, or Flashcards, then log the work." },
  { t: "4. Track progress", d: "Results save automatically so tomorrow's plan stays accurate." },
] as const;

export default function HelpPage() {
  return (
    <MarketingLayout title="Help Center" subtitle="Get started fast and keep your workflow consistent.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Getting started</h2>
          <ol className="mt-4 space-y-4">
            {steps.map((s) => (
              <li key={s.t}>
                <p className="text-sm font-semibold text-slate-900">{s.t}</p>
                <p className="text-sm text-slate-600">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>
        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-900">Need AI features?</p>
            <p className="mt-2">Add your OpenAI API key in Settings to enable AI quizzes, hints, flashcards, and chat.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/dashboard/settings" className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
                Open Settings
              </Link>
              <Link to="/faq" className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50">
                Read FAQ
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-900">Contact support</p>
            <p className="mt-2">
              Email{" "}
              <a className="font-semibold text-indigo-700 hover:text-indigo-800" href="mailto:support@wassceai.com">
                support@wassceai.com
              </a>
              .
            </p>
          </div>
        </aside>
      </div>
    </MarketingLayout>
  );
}
