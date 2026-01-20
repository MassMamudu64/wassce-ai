import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingLayout from "./MarketingLayout";

const tiers = [
  { name: "Free", price: "$0", blurb: "Start practicing today.", items: ["Sample quizzes", "Planner basics", "Past papers preview"] },
  { name: "Plus", price: "$20/mo", blurb: "Daily AI study support.", items: ["AI quizzes + hints", "AI flashcards", "Progress insights"] },
  { name: "School", price: "Contact", blurb: "For classrooms & cohorts.", items: ["Shared cohorts", "Teacher dashboards", "Bulk onboarding"] },
] as const;

export default function PricingPage() {
  return (
    <MarketingLayout title="Pricing" subtitle="Simple plans that keep your prep focused. Upgrade anytime.">
      <div className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <section key={tier.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{tier.name}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{tier.price}</p>
            <p className="mt-2 text-sm text-slate-600">{tier.blurb}</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              {tier.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {tier.name === "School" ? (
                <a
                  href="mailto:support@wassceai.com?subject=WASSCE%20AI%20School%20Plan"
                  className="inline-flex w-full justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Contact sales
                </a>
              ) : (
                <Link
                  to="/auth/signup"
                  className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Get started
                </Link>
              )}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">What you get with AI</p>
        <p className="mt-2">
          Your API key powers AI quizzes, in-quiz hints, flashcards, and chat. Keys are stored securely in Supabase.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/auth/signup" className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50">
            Create account
          </Link>
          <Link to="/dashboard/settings" className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50">
            Add API key in Settings
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
