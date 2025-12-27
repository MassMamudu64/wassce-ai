import { useEffect, useMemo, useState, type ComponentType } from "react";
import { BookOpenText, Brain, Layers, PencilRuler } from "lucide-react";

type Feature = {
  title: string;
  desc: string;
  aiInsight: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const FeaturesSection = () => {
  const features = useMemo<Feature[]>(
    () => [
      {
        title: "Flashcards",
        desc: "Active recall prompts with clear answers and tips.",
        aiInsight: "Build a 10-card review set for your next session.",
        icon: Layers,
      },
      {
        title: "Quizzes",
        desc: "Short quizzes that save results to your Progress page.",
        aiInsight: "Focus quizzes on topics with low accuracy.",
        icon: Brain,
      },
      {
        title: "Notes",
        desc: "Keep summaries and key points in a searchable notebook.",
        aiInsight: "Turn a messy paragraph into a 5-bullet summary.",
        icon: BookOpenText,
      },
      {
        title: "Whiteboard",
        desc: "Draft concept maps and exam solution outlines.",
        aiInsight: "Sketch the steps before you write the full answer.",
        icon: PencilRuler,
      },
    ],
    [],
  );

  const [aiMessages, setAiMessages] = useState(() => features.map(() => ""));
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const currentMsg = features[activeFeature]?.aiInsight ?? "";
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (!isDeleting && charIndex < currentMsg.length) {
      timer = setTimeout(() => {
        setAiMessages((prev) => {
          const updated = [...prev];
          updated[activeFeature] = currentMsg.substring(0, charIndex + 1);
          return updated;
        });
        setCharIndex((prev) => prev + 1);
      }, 30);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setAiMessages((prev) => {
          const updated = [...prev];
          updated[activeFeature] = currentMsg.substring(0, charIndex - 1);
          return updated;
        });
        setCharIndex((prev) => prev - 1);
      }, 20);
    } else if (!isDeleting && charIndex === currentMsg.length) {
      timer = setTimeout(() => setIsDeleting(true), 1400);
    } else if (isDeleting && charIndex === 0) {
      timer = setTimeout(() => {
        setIsDeleting(false);
        const nextFeature = (activeFeature + 1) % features.length;
        setActiveFeature(nextFeature);
        setAiMessages((prev) => {
          const updated = [...prev];
          updated[nextFeature] = "";
          return updated;
        });
      }, 260);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeFeature, charIndex, features, isDeleting]);

  return (
    <section id="features" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Smart study tools built for WASSCE</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 border ${
                index === activeFeature
                  ? "border-indigo-300 shadow-lg ring-2 ring-indigo-100"
                  : "border-slate-100 hover:border-indigo-200 hover:shadow-xl"
              }`}
            >
              <feature.icon size={26} className="mb-4 text-indigo-600 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="font-bold text-lg text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">{feature.desc}</p>
              <div
                className={`text-xs text-indigo-700 bg-indigo-50 rounded-lg p-2 transition-all duration-300 ${
                  index === activeFeature ? "opacity-100" : "opacity-0 group-hover:opacity-80"
                }`}
              >
                <span className="font-medium">AI:</span> {aiMessages[index]}
                {index === activeFeature && !isDeleting && charIndex < feature.aiInsight.length && <span className="animate-pulse">|</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
