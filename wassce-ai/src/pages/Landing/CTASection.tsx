import { useEffect, useMemo, useState } from "react";
import { samplePassPaperFlashcards } from "../../utils/flashcards";

interface CTASectionProps {
  onOpenLogin: () => void;
}

const CTASection = ({ onOpenLogin }: CTASectionProps) => {
  const messages = useMemo(
    () => [
      "Predicting your weak topics...",
      "Generating personalized study plan...",
      "Analyzing past exam patterns...",
      "Optimizing your revision schedule...",
      "Preparing flashcards for tomorrow...",
    ],
    [],
  );

  const [currentMessage, setCurrentMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentMsg = messages[currentIndex];
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (!isDeleting && charIndex < currentMsg.length) {
      timer = setTimeout(() => {
        setCurrentMessage(currentMsg.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 50);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setCurrentMessage(currentMsg.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      }, 30);
    } else if (!isDeleting && charIndex === currentMsg.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIndex === 0) {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setCurrentMessage("");
      }, 400);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [charIndex, currentIndex, isDeleting, messages]);

  const sampleCard = samplePassPaperFlashcards[0];

  return (
    <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_70%)]"></div>
      <div className="max-w-6xl mx-auto relative z-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-indigo-200">Action Center</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Turn prep into a daily routine</h2>
            <p className="text-indigo-100 mb-8 text-lg">
              Log sessions, practice past papers, and track progress with clear feedback and next steps.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onOpenLogin}
                className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition duration-300 transform hover:-translate-y-0.5 shadow-lg"
              >
                Sign in to start
              </button>
              <span className="text-indigo-200 text-sm mt-3">
                Create a demo account to unlock the dashboard workspace.
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center mb-4">
                <span className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2" />
                <span className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="font-mono text-sm text-green-300">
                <div className="mb-2">$ wassce-ai --analyze</div>
                <div className="text-left">
                  <span className="text-white">AI: </span>
                  <span>{currentMessage}</span>
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 text-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">Sample WASSCE pass paper flashcard</p>
              <p className="mt-3 text-sm uppercase tracking-[0.3em] text-slate-400">{sampleCard.subject}</p>
              <p className="mt-2 text-lg font-semibold text-white">{sampleCard.question}</p>
              <p className="mt-3 text-sm text-slate-300">{sampleCard.answer}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.4em] text-indigo-200">{sampleCard.tip}</p>
              <p className="mt-2 text-xs text-indigo-100 leading-relaxed">
                Sign in to open the dashboard and start practicing with flashcards, quizzes, and past papers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
