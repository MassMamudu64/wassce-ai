import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Flame, ListChecks, Timer } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const aiInsights = [
  "Scanning past papers for weak topics...",
  "Building a focused quiz for Cell Biology...",
  "Drafting a revision plan for Mathematics...",
  "Ranking topics by confidence score...",
  "Preparing flashcards for Organic Chemistry...",
];

const highlightCards = [
  { title: "Study streak", value: "6 days", icon: Flame, tone: "bg-amber-100 text-amber-700" },
  { title: "Exam countdown", value: "82 days", icon: Timer, tone: "bg-emerald-100 text-emerald-700" },
  { title: "Accuracy trend", value: "+12%", icon: BarChart3, tone: "bg-slate-200 text-slate-700" },
  { title: "Next quiz", value: "15 questions", icon: ListChecks, tone: "bg-teal-100 text-teal-700" },
];

interface HeroSectionProps {
  onOpenLogin: () => void;
}

export default function HeroSection({ onOpenLogin }: HeroSectionProps) {
  const { isAuthenticated } = useAuth();
  const [currentMessage, setCurrentMessage] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const messages = useMemo(() => aiInsights, []);

  useEffect(() => {
    const currentMsg = messages[msgIndex];
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (!isDeleting && charIndex < currentMsg.length) {
      timer = setTimeout(() => {
        setCurrentMessage(currentMsg.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 36);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setCurrentMessage(currentMsg.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      }, 24);
    } else if (!isDeleting && charIndex === currentMsg.length) {
      timer = setTimeout(() => setIsDeleting(true), 1600);
    } else if (isDeleting && charIndex === 0) {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setMsgIndex((prev) => (prev + 1) % messages.length);
      }, 280);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [charIndex, isDeleting, messages, msgIndex]);

  return (
    <section className="landing-hero relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-aurora" />
        <div className="hero-aurora hero-aurora-secondary" />
        <div className="hero-orbit hero-orbit-1">
          <span className="hero-orbit-dot" />
        </div>
        <div className="hero-orbit hero-orbit-2">
          <span className="hero-orbit-dot" />
        </div>
       
    <span className="hero-orbit-dot" />
         <div className="hero-comet hero-comet-1" />
          <div className="hero-comet hero-comet-2" />
         <div className="hero-comet hero-comet-4" />
          <div className="hero-comet hero-comet-3" />
         <div className="hero-comet hero-comet-1" />
          <div className="hero-comet hero-comet-5" />
         <div className="hero-comet hero-comet-1" />
      </div>
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.08)_0%,rgba(255,255,255,0)_55%)]" />
      <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-amber-200/70 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <span className="hero-orbit-dot" />
          <div className="landing-fade-up landing-delay-1 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            WASSCE AI workspace <span className="hero-orbit-dot" />
          </div>
          <h1 className="landing-display landing-fade-up landing-delay-2 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Your daily WASSCE plan, built by AI and kept simple.
          </h1>
          <p className="landing-fade-up landing-delay-3 max-w-2xl text-lg text-slate-600">
            Know what to study today, practice past papers, and track progress after every session. Everything you need,
            in one clear workspace. <span className="hero-orbit-dot" />
          </p>

          <div className="landing-fade-up landing-delay-3 flex flex-col gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link
                to="/dashboard/overview"
                className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(15,23,42,0.25)] transition hover:bg-slate-800"
              >
                Open dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(15,23,42,0.25)] transition hover:bg-slate-800"
              >
                Start free
              </button>
            )}
            <a
              href="#features"
              className="rounded-2xl border border-slate-300 bg-white/70 px-8 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Explore the tools
            </a>
          </div>

          <div className="landing-fade-up landing-delay-3 grid grid-cols-2 gap-4 pt-4 text-sm sm:grid-cols-3">
            {[
              { label: "Students learning weekly", value: "2,400+" },
              { label: "Past papers indexed", value: "120+" },
              { label: "Average setup time", value: "10 min" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3">
                <div className="text-lg font-semibold text-slate-900">{stat.value}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative space-y-5 lg:justify-self-end">
          <div className="landing-fade-up landing-delay-2 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              <span>Today focus</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Streak 6</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">Integrated Science</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {["Kinematics summary", "Past paper: 2019 Q14", "Flashcards: energy basics"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-5 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-emerald-200">
              <span className="font-mono">AI:</span> {currentMessage}
              <span className="ml-1 text-emerald-400">{!isDeleting && charIndex < messages[msgIndex].length ? "|" : ""}</span>
            </div>
          </div>

          <div className="landing-float grid grid-cols-2 gap-4">
            {highlightCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-sm shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
              >
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${card.tone}`}>
                  <card.icon size={18} />
                </div>
                <div className="mt-3 font-semibold text-slate-900">{card.value}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
