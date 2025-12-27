import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLearningStore } from "../../stores/learningStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { getOpenAiApiKey, setOpenAiApiKey } from "../../utils/settings";

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const { studentProfile, resetProgress } = useLearningStore();
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);

  const [openAiKey, setOpenAiKey] = useState(() => getOpenAiApiKey() ?? "");
  const [saved, setSaved] = useState(false);

  const maskedKey = useMemo(() => {
    if (!openAiKey) return "";
    const trimmed = openAiKey.trim();
    if (trimmed.length <= 8) return "••••••••";
    return `${trimmed.slice(0, 3)}••••••••${trimmed.slice(-4)}`;
  }, [openAiKey]);

  const handleSaveOpenAiKey = () => {
    const trimmed = openAiKey.trim();
    setOpenAiApiKey(trimmed ? trimmed : null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Settings</p>
        <h1 className="text-2xl font-semibold text-white">Account & configuration</h1>
        <p className="mt-2 text-sm text-slate-400">Control your profile, local data, and optional AI key.</p>
      </header>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">OpenAI API key (optional)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Stored locally in your browser. Needed for AI Chat and AI flashcard generation.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={openAiKey}
            onChange={(event) => setOpenAiKey(event.target.value)}
            placeholder="sk-…"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
          />
          <button
            type="button"
            onClick={handleSaveOpenAiKey}
            className="rounded-xl border border-emerald-400/60 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/20"
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">Current: {openAiKey ? maskedKey : "Not set"}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link to="/dashboard/tools/aichat" className="text-emerald-200 hover:text-white">
            Open AI Chat →
          </Link>
          <Link to="/dashboard/tools/flashcards" className="text-emerald-200 hover:text-white">
            Open Flashcards →
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Demo account</h2>
        <p className="mt-1 text-sm text-slate-400">Signed in as {user?.email ?? "unknown"}.</p>
        <p className="mt-3 text-xs text-slate-500">This demo stores your session locally in the browser.</p>
      </section>

      <section className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6">
        <h2 className="text-lg font-semibold text-white">Reset local progress</h2>
        <p className="mt-1 text-sm text-rose-100/90">Clears study sessions, quiz stats, and profile on this device.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              resetProgress();
              resetWorkspace();
              setOpenAiApiKey(null);
              setOpenAiKey("");
            }}
            className="rounded-xl border border-rose-500/60 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-50 hover:bg-rose-500/30"
          >
            Reset everything
          </button>
          <Link to="/dashboard/overview" className="self-center text-sm text-rose-100 hover:text-white">
            Return to overview →
          </Link>
        </div>
        <p className="mt-2 text-xs text-rose-100/80">
          This is irreversible. Use when you want to restart the demo cleanly.
        </p>
      </section>

      {studentProfile && (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Profile snapshot</h2>
          <p className="mt-1 text-sm text-slate-400">
            {studentProfile.name} • {studentProfile.examYear} • {studentProfile.subjects.length} subjects
          </p>
        </section>
      )}
    </div>
  );
}
