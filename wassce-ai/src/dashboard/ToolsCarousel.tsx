import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

export type CarouselCard = {
  id: string;
  title: string;
  description: string;
  to: string;
  eyebrow?: string;
  tone?: "indigo" | "emerald" | "amber" | "slate";
};

interface ToolsCarouselProps {
  title: string;
  subtitle?: string;
  viewAllTo: string;
  cards: CarouselCard[];
}

const toneClass: Record<NonNullable<CarouselCard["tone"]>, string> = {
  indigo: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/25",
  emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/25",
  amber: "from-amber-500/20 to-amber-500/5 border-amber-500/25",
  slate: "from-slate-500/15 to-slate-500/5 border-slate-700/40",
};

export default function ToolsCarousel({ title, subtitle, viewAllTo, cards }: ToolsCarouselProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const rail = railRef.current;
    if (!rail) return;
    const { scrollLeft, scrollWidth, clientWidth } = rail;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const rail = railRef.current;
    if (!rail) return;
    const handleScroll = () => updateScrollState();
    rail.addEventListener("scroll", handleScroll, { passive: true });
    const observer = new ResizeObserver(() => updateScrollState());
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollByPage = (direction: "left" | "right") => {
    const rail = railRef.current;
    if (!rail) return;
    const amount = Math.max(280, Math.floor(rail.clientWidth * 0.9));
    rail.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const prepared = useMemo(() => {
    return cards.map((card) => ({
      ...card,
      tone: card.tone ?? "slate",
    }));
  }, [cards]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Tools</p>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByPage("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll tools left"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/40 text-slate-200 transition hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage("right")}
            disabled={!canScrollRight}
            aria-label="Scroll tools right"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/40 text-slate-200 transition hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
          <Link
            to={viewAllTo}
            className="rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 hover:border-slate-600"
          >
            View all
          </Link>
        </div>
      </div>

      <div
        ref={railRef}
        className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {prepared.map((card) => (
          <Link
            key={card.id}
            to={card.to}
            className={`group relative w-[78%] shrink-0 snap-start rounded-3xl border bg-gradient-to-br p-5 transition hover:-translate-y-0.5 hover:border-slate-600 sm:w-[52%] lg:w-[44%] ${
              toneClass[card.tone]
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-400">
                  {card.eyebrow ?? "Ready now"}
                </p>
                <h3 className="mt-2 truncate text-lg font-semibold text-white">{card.title}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-200">
                Open
              </span>
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">{card.description}</p>
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent transition group-hover:ring-white/10" />
          </Link>
        ))}
      </div>
    </section>
  );
}

