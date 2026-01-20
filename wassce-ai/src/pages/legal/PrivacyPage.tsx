import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Privacy Policy</h1>
          <p className="text-sm text-slate-600">
            This app stores data in Supabase.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">What we store</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            <li>Account details created during sign up (stored in Supabase)</li>
            <li>Study progress and tool data (stored in Supabase)</li>
            <li>Optional OpenAI API key you enter in Settings (stored in Supabase)</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">AI requests</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            When you use AI features, prompts are sent to the OpenAI API directly from your browser using your API key.
            Do not include sensitive personal information in prompts.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">How to delete your data</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            Delete your account data inside your Supabase project or contact support for removal.
          </p>
        </section>

        <div className="pt-2">
          <Link to="/auth/signin" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
