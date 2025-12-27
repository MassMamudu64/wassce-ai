import { Link } from "react-router-dom";
import MarketingLayout from "./MarketingLayout";

const posts = [
  { t: "How to use quizzes to find weak topics", d: "A simple loop: attempt → review → repeat → track." },
  { t: "Past papers: the fastest way to improve", d: "How to turn a past paper into a weekly plan." },
  { t: "Active recall with flashcards (WASSCE edition)", d: "Build short decks and review on a schedule." },
] as const;

export default function BlogPage() {
  return (
    <MarketingLayout title="Blog" subtitle="Short, practical study guides for WASSCE students.">
      <div className="grid gap-6 lg:grid-cols-3">
        {posts.map((p) => (
          <article key={p.t} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">{p.t}</h2>
            <p className="mt-2 text-sm text-slate-600">{p.d}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Read time: 3 min</p>
          </article>
        ))}
      </div>
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
        <p className="font-semibold text-slate-900">Want more guides?</p>
        <p className="mt-2">Tell us what subject you want next and we’ll prioritize it.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700" href="mailto:support@wassceai.com?subject=Blog%20Request">
            Email request
          </a>
          <Link className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50" to="/auth/signup">
            Start studying
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}

