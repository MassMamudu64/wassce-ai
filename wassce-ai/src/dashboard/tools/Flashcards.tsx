import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { generatePassPaperFlashcards, samplePassPaperFlashcards } from "../../utils/flashcards";
import { getOpenAiApiKey } from "../../utils/settings";

const defaultPrompt =
  "WASSCE-style chemistry prompt: Explain how to approach a question on buffer preparation and note why the answer matters.";

const Flashcards = () => {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [cards, setCards] = useState(samplePassPaperFlashcards);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const hasApiKey = Boolean(getOpenAiApiKey());

  const handleGenerate = async () => {
    if (!hasApiKey) return;
    setGenerationError(null);

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setGenerationError("Add a prompt to generate flashcards.");
      return;
    }

    setGenerating(true);
    try {
      const newCards = await generatePassPaperFlashcards(trimmedPrompt);
      setCards(newCards);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate flashcards.";
      const help = message.toLowerCase().includes("api key")
        ? "Check your API key in Settings and try again."
        : "Try again in a moment.";
      setGenerationError(`Failed to generate flashcards from AI. ${help}`);
      setCards(
        samplePassPaperFlashcards.map((card, index) =>
          index === 0 ? { ...card, question: `${trimmedPrompt} (WASSCE pass paper-style prompt)` } : card,
        ),
      );
    } finally {
      setGenerating(false);
    }
  };

  const summaryLabel = useMemo(() => (hasApiKey ? "AI enabled" : "AI key required"), [hasApiKey]);

  return (
    <div className="space-y-5 rounded-2xl border border-slate-900/70 bg-slate-950/80 p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Flashcard API</p>
            <h3 className="text-lg font-semibold text-white">Generate WASSCE pass paper flashcards</h3>
          </div>
          <div className="text-xs uppercase tracking-[0.4em] text-emerald-300">{summaryLabel}</div>
        </div>

        {!hasApiKey && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
            Add your OpenAI API key in Settings to enable AI flashcard generation. Sample cards are shown below.
            <div className="mt-2">
              <Link
                to="/dashboard/settings"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 hover:text-white"
              >
                Open settings →
              </Link>
            </div>
          </div>
        )}
      </div>

      <textarea
        value={prompt}
        disabled={!hasApiKey}
        onChange={(event) => setPrompt(event.target.value)}
        className="min-h-[120px] w-full rounded-2xl border border-slate-900/80 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!hasApiKey || generating}
          className={`rounded-full border border-transparent bg-gradient-to-r from-indigo-500 to-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white shadow-[0_10px_20px_rgba(14,165,233,0.4)] transition ${
            hasApiKey
              ? "hover:from-indigo-400 hover:to-emerald-400 active:scale-[0.98]"
              : "cursor-not-allowed opacity-70"
          }`}
        >
          {generating ? "Generating..." : "Generate flashcards"}
        </button>
        {!hasApiKey && <p className="text-xs text-slate-400">Open Settings to add your OpenAI key and enable generation.</p>}
      </div>

      {generationError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {generationError}
        </div>
      )}

      <div className="space-y-3">
        {cards.map((card) => (
          <article key={`${card.subject}-${card.question}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400">{card.subject}</p>
              <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-300">WASSCE</span>
            </div>
            <p className="mt-3 font-semibold text-white">{card.question}</p>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{card.answer}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-indigo-200">{card.tip}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Flashcards;
