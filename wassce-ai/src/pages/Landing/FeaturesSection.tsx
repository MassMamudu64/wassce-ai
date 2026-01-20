import { BarChart3, BookOpenText, CalendarCheck, FileText, ListChecks } from "lucide-react";

const studySteps = [
  {
    title: "Set your focus",
    desc: "Pick a subject and exam year. We build a clear plan for what to do today.",
    detail: "Daily plan updates after every session.",
  },
  {
    title: "Practice with intent",
    desc: "Answer past papers and quizzes that target your weakest topics.",
    detail: "Every question feeds your progress stats.",
  },
  {
    title: "Review and adapt",
    desc: "Get feedback, revise with flashcards, and move on with confidence.",
    detail: "Your next session is ready before you leave.",
  },
];

const tools = [
  {
    title: "Planner",
    desc: "A daily schedule with countdowns, streaks, and priorities.",
    icon: CalendarCheck,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Past Papers",
    desc: "WASSCE questions organized by subject and topic.",
    icon: FileText,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    title: "Quizzes",
    desc: "Short tests that focus on weak areas and track accuracy.",
    icon: ListChecks,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    title: "Progress",
    desc: "See mastery by topic, accuracy trend, and time spent.",
    icon: BarChart3,
    tone: "bg-slate-100 text-slate-700",
  },
  {
    title: "Smart Notes",
    desc: "Turn messy notes into quick summaries and flashcards.",
    icon: BookOpenText,
    tone: "bg-teal-50 text-teal-700",
  },
];

const offerings = [
  {
    title: "Daily study plan",
    desc: "Clear priorities, streaks, and countdowns to keep momentum steady.",
  },
  {
    title: "AI practice engine",
    desc: "Quizzes and past papers that target weak topics automatically.",
  },
  {
    title: "Progress dashboard",
    desc: "Track accuracy, time spent, and mastery by topic.",
  },
];

const subjects = ["Mathematics", "English", "Integrated Science", "Biology", "Chemistry", "Physics", "Economics"];

const partners = ["WAEC", "Ministry of Education", "MTN"];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative bg-[#f8f6f1] py-20">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.02)_0%,rgba(15,118,110,0.05)_100%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6">
        <div id="how-it-works" className="scroll-mt-24">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">How it works</p>
              <h2 className="landing-display text-3xl font-semibold text-slate-900 sm:text-4xl">
                A simple study loop that keeps you focused.
              </h2>
              <p className="text-base text-slate-600">
                WASSCE AI turns your plan into daily actions. You always know what to study next and why it matters.
              </p>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">AI session check-in</p>
                <p className="mt-2">
                  Your focus is 48 percent Mechanics. We will start with 12 questions and a 10 minute recap.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {studySteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                    Step 0{index + 1}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.desc}</p>
                  <p className="mt-3 text-xs text-slate-500">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Tools</p>
              <h2 className="landing-display text-3xl font-semibold text-slate-900 sm:text-4xl">
                Everything you need to study daily.
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-600">
              Each tool connects to your dashboard, so your progress and plan update together.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div key={tool.title} className="rounded-3xl border border-slate-200 bg-white/80 p-6">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${tool.tone}`}>
                  <tool.icon size={20} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{tool.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">What WASSCE AI offers</p>
              <h2 className="landing-display text-3xl font-semibold text-slate-900 sm:text-4xl">
                A complete prep stack, built for real exam flow.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {offerings.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Mock exams</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">Practice with real WAEC structure.</h3>
              <p className="mt-3 text-sm text-slate-600">
                Timed sections, multiple choice format, and feedback that matches the real exam experience.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Partners</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">National scale, trusted partners.</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {partners.map((partner) => (
                  <span
                    key={partner}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Subjects covered</p>
            <h2 className="landing-display text-3xl font-semibold text-slate-900 sm:text-4xl">
              Core WASSCE subjects and electives.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {subjects.map((subject) => (
              <span
                key={subject}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
