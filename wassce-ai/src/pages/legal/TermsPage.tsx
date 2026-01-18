import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Terms of Service</h1>
          <p className="text-sm text-slate-600">
            This app can run in demo mode with local browser storage or connect to Supabase for real user accounts.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">1. Local demo data</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            In demo mode, authentication data and study progress stay in your browser. When Supabase is configured, data
            is stored in your Supabase project and follows your security rules.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">2. AI features</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            AI chat, flashcards, and quizzes run in the browser using the API key you provide. You are responsible for
            the security and cost of your API usage.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">3. No guarantees</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            Content is provided for learning support and may contain errors. Always cross-check with official syllabus
            and past papers.
          </p>
        </section>

        <div className="pt-2">
          <Link to="/auth/signup" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">
            Back to sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
