import { Link } from "react-router-dom";
import MarketingLayout from "./MarketingLayout";
import AboutTeam from "./AboutTeam";

const values = [
  { title: "Clarity", desc: "A daily workspace that tells you exactly what to do next." },
  { title: "Practice-first", desc: "Quizzes, past papers, and recall tools before long lectures." },
  { title: "Feedback loops", desc: "Progress updates automatically so you improve session by session." },
  { title: "Student trust", desc: "No dead buttons. Every interaction should help you study." },
] as const;

export default function AboutPage() {
  return (
    <MarketingLayout
      title="About WASSCE AI"
      subtitle="We’re building a serious study platform for West African students—focused on practice, feedback, and daily momentum."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AboutTeam />
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Why we exist</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            WASSCE prep often fails because students don’t get a clear plan, consistent practice, or fast feedback. WASSCE
            AI organizes your daily study flow: pick a subject, practice real questions, get explanations, and track
            progress automatically.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/auth/signup" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Start studying
            </Link>
            <Link to="/dashboard/tools/quizzes" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              Try quizzes
            </Link>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Our principles</h2>
          <ul className="mt-4 space-y-3">
            {values.map((v) => (
              <li key={v.title}>
                <p className="text-sm font-semibold text-slate-900">{v.title}</p>
                <p className="text-sm text-slate-600">{v.desc}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Contact</h2>
        <p className="mt-2">Questions or partnerships: <a className="font-semibold text-indigo-700 hover:text-indigo-800" href="mailto:support@wassceai.com">support@wassceai.com</a></p>
      </section>
    </MarketingLayout>
  );
}

