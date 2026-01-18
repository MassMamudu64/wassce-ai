import { Link } from "react-router-dom";
import { samplePassPaperFlashcards } from "../../utils/flashcards";

interface CTASectionProps {
  onOpenLogin: () => void;
}

const CTASection = ({ onOpenLogin }: CTASectionProps) => {
  const sampleCard = samplePassPaperFlashcards[0];

  return (
    <section className="relative overflow-hidden bg-[#0b1220] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12)_0%,rgba(15,23,42,0)_55%)]" />
      <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-200">Ready for the next session</p>
          <h2 className="landing-display text-3xl font-semibold text-white sm:text-4xl">
            Start a focused study flow today.
          </h2>
          <p className="text-base text-slate-300">
            Your plan, practice, and progress stay connected. Students open the dashboard and immediately see what to do
            next.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onOpenLogin}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_16px_30px_rgba(255,255,255,0.15)] transition hover:bg-slate-100"
            >
              Start free
            </button>
            <Link
              to="/pricing"
              className="rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
            >
              View pricing
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "AI coach check-in",
                text: "Your top focus is Mechanics. Start with 12 questions and a 10 minute recap.",
              },
              {
                title: "Next session ready",
                text: "We queue flashcards and past paper drills before you finish today.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-100">{item.title}</p>
                <p className="mt-2 text-slate-200">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">Sample flashcard</p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">{sampleCard.subject}</p>
            <p className="mt-2 text-lg font-semibold text-white">{sampleCard.question}</p>
            <p className="mt-3 text-sm text-slate-200">{sampleCard.answer}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-amber-200">{sampleCard.tip}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">Tomorrow plan</p>
            <div className="mt-3 space-y-2 text-slate-200">
              {[
                { label: "Mathematics practice", time: "25 min" },
                { label: "Chemistry flashcards", time: "15 min" },
                { label: "Essay outline drill", time: "20 min" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="text-amber-200">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
