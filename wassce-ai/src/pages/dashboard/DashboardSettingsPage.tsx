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
    if (trimmed.length <= 8) return "********";
    return `${trimmed.slice(0, 3)}********${trimmed.slice(-4)}`;
  }, [openAiKey]);

  const handleSaveOpenAiKey = () => {
    const trimmed = openAiKey.trim();
    setOpenAiApiKey(trimmed ? trimmed : null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-900">Account and configuration</h1>
        <p className="mt-2 text-sm text-slate-600">Control your profile, data, and optional AI key.</p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h2 className="text-lg font-semibold text-slate-900">OpenAI API key (optional)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Stored locally in your browser. Needed for AI Chat and AI flashcard generation.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={openAiKey}
            onChange={(event) => setOpenAiKey(event.target.value)}
            placeholder="sk-..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={handleSaveOpenAiKey}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">Current: {openAiKey ? maskedKey : "Not set"}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link to="/dashboard/tools/aichat" className="text-slate-700 hover:text-slate-900">
            Open AI Chat
          </Link>
          <Link to="/dashboard/tools/flashcards" className="text-slate-700 hover:text-slate-900">
            Open Flashcards
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h2 className="text-lg font-semibold text-slate-900">Account session</h2>
        <p className="mt-1 text-sm text-slate-600">Signed in as {user?.email ?? user?.id ?? "unknown"}.</p>
        <p className="mt-3 text-xs text-slate-500">Sessions are stored in your browser or Supabase when configured.</p>
      </section>

      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <h2 className="text-lg font-semibold">Reset local progress</h2>
        <p className="mt-1 text-sm">Clears study sessions, quiz stats, and profile data on this device only.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              resetProgress();
              resetWorkspace();
              setOpenAiApiKey(null);
              setOpenAiKey("");
            }}
            className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            Reset everything
          </button>
          <Link to="/dashboard/overview" className="self-center text-sm text-rose-700 hover:text-rose-900">
            Return to overview
          </Link>
        </div>
        <p className="mt-2 text-xs">This is irreversible. Use when you want to restart the demo cleanly.</p>
      </section>

      {studentProfile && (
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Profile snapshot</h2>
          <p className="mt-1 text-sm text-slate-600">
            {studentProfile.name} | {studentProfile.examYear} | {studentProfile.subjects.length} subjects
          </p>
        </section>
      )}
    </div>
  );
}
