import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Gamepad2, Layers, ListChecks } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const aiInsights = [
  "Generating a personalized quiz for Physics…",
  "Analyzing weak topics in Mathematics…",
  "Creating flashcards for Organic Chemistry…",
  "Planning your next study blocks…",
  "Preparing revision games for Biology…",
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
      }, 40);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setCurrentMessage(currentMsg.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      }, 25);
    } else if (!isDeleting && charIndex === currentMsg.length) {
      timer = setTimeout(() => setIsDeleting(true), 1600);
    } else if (isDeleting && charIndex === 0) {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setMsgIndex((prev) => (prev + 1) % messages.length);
      }, 300);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [charIndex, isDeleting, messages, msgIndex]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,rgba(0,0,0,0)_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">WASSCE AI</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-slate-300">
              Smarter learning for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-white"> WASSCE students</span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg text-slate-400 leading-relaxed">
              Plan sessions, practice questions, and track progress — all in one daily workspace.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard/overview"
                  className="rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-indigo-500/20"
                >
                  Open Dashboard
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-indigo-500/20"
                >
                  Get Started
                </button>
              )}

              <a
                href="#features"
                className="rounded-xl border border-slate-700 px-8 py-3.5 font-semibold text-slate-200 hover:bg-slate-800/80 transition-all duration-300 backdrop-blur-sm"
              >
                See Features
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-indigo-500/30 p-4">
              <div className="flex items-center mb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-2" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-slate-400">wassce-ai-engine</span>
              </div>

              <div className="text-sm text-green-400 font-mono rounded-lg">
                <div className="text-indigo-300 mb-1">
                  AI: {currentMessage}
                  <span className="animate-pulse">{!isDeleting && charIndex < messages[msgIndex].length ? "|" : ""}</span>
                </div>
                <div className="text-slate-500 mt-2 flex items-center">
                  <span className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  <span>Active • Processing insights</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  {[
                    { name: "Flashcards", icon: Layers, color: "bg-amber-500/20" },
                    { name: "Quizzes", icon: ListChecks, color: "bg-emerald-500/20" },
                    { name: "Study Games", icon: Gamepad2, color: "bg-rose-500/20" },
                    { name: "AI Coach", icon: Bot, color: "bg-indigo-500/20" },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className={`${item.color} backdrop-blur-sm rounded-xl py-3 px-4 border border-white/10 flex flex-col items-center justify-center`}
                    >
                      <item.icon size={22} className="mb-1 text-white" />
                      <div className="text-xs text-slate-300 font-medium text-center">{item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

