import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLearningStore } from "../../stores/learningStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { SUBJECT_OPTIONS } from "../../utils/subjects";
import {
  getOpenAiApiKey,
  getUserProfile,
  loadUserProfile,
  loadUserSettings,
  removeUserProfile,
  setOpenAiApiKey,
  setUserProfile,
} from "../../utils/settings";
import {
  AlertTriangle,
  BookOpen,
  Download,
  Key,
  Settings,
  Target,
  Trash2,
  User,
} from "lucide-react";

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const { studentProfile, setStudentProfile, resetProgress, studyStats, studySessions } = useLearningStore();
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);
  const userRef = user?.id ?? user?.email ?? null;

  // ── Profile fields ──
  const [openAiKey, setOpenAiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ── Study preferences ──
  const [dailyGoal, setDailyGoal] = useState(studentProfile?.dailyStudyGoalMinutes ?? 60);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(studentProfile?.subjects ?? []);
  const [examDate, setExamDate] = useState(studentProfile?.examDate ?? "");
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Sync from profile changes
  useEffect(() => {
    if (studentProfile) {
      setDailyGoal(studentProfile.dailyStudyGoalMinutes);
      setSelectedSubjects(studentProfile.subjects);
      setExamDate(studentProfile.examDate);
    }
  }, [studentProfile]);

  const maskedKey = useMemo(() => {
    if (!openAiKey) return "";
    const trimmed = openAiKey.trim();
    if (trimmed.length <= 8) return "********";
    return `${trimmed.slice(0, 3)}********${trimmed.slice(-4)}`;
  }, [openAiKey]);

  const profileInitials = useMemo(() => {
    const trimmed = profileName.trim();
    if (!trimmed) return "ST";
    return trimmed
      .split(/\s+/)
      .filter(Boolean)
      .map((seg) => seg[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";
  }, [profileName]);

  const examYear = useMemo(() => {
    if (!examDate) return new Date().getFullYear() + 1;
    const year = new Date(examDate).getFullYear();
    return Number.isFinite(year) ? year : new Date().getFullYear() + 1;
  }, [examDate]);

  useEffect(() => {
    if (!userRef) {
      setProfileName(user?.name ?? "");
      setProfileAvatar("");
      setOpenAiKey("");
      return;
    }

    let mounted = true;
    Promise.all([loadUserProfile(userRef), loadUserSettings(userRef)])
      .then(() => {
        if (!mounted) return;
        const profile = getUserProfile();
        setProfileName(profile?.displayName ?? user?.name ?? "");
        setProfileAvatar(profile?.avatarDataUrl ?? "");
        setOpenAiKey(getOpenAiApiKey() ?? "");
      })
      .catch(() => {
        if (!mounted) return;
        setOpenAiKey(getOpenAiApiKey() ?? "");
      });
    return () => { mounted = false; };
  }, [user?.name, userRef]);

  // ── Handlers ──
  const handleSaveOpenAiKey = async () => {
    const trimmed = openAiKey.trim();
    await setOpenAiApiKey(trimmed || null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProfileError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setProfileError("Please upload an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setProfileError("Image is too large (max 2MB)."); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setProfileAvatar(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setProfileError(null);
    if (!userRef) { setProfileError("Sign in to update your profile."); return; }
    const trimmedName = profileName.trim();
    if (!trimmedName) { setProfileError("Display name is required."); return; }
    await setUserProfile(userRef, {
      displayName: trimmedName,
      avatarDataUrl: profileAvatar || undefined,
    });
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 1200);
  };

  const handleClearProfile = async () => {
    if (!userRef) return;
    await removeUserProfile(userRef);
    setProfileAvatar("");
    setProfileName(user?.name ?? "");
    setProfileSaved(false);
    setProfileError(null);
  };

  const handleSavePreferences = () => {
    if (!studentProfile || !userRef) return;
    setStudentProfile({
      ...studentProfile,
      subjects: selectedSubjects,
      examDate,
      examYear,
      dailyStudyGoalMinutes: dailyGoal,
    });
    setPrefsSaved(true);
    window.setTimeout(() => setPrefsSaved(false), 1200);
  };

  const toggleSubject = (slug: string, checked: boolean) => {
    setSelectedSubjects((current) =>
      checked ? Array.from(new Set([...current, slug])) : current.filter((s) => s !== slug),
    );
  };

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      studentProfile,
      studyStats,
      studySessions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wassce-ai-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    resetProgress();
    resetWorkspace();
    void setOpenAiApiKey(null);
    setOpenAiKey("");
    setConfirmReset(false);
  };

  const todayString = useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Settings</p>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">Account and configuration</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Manage your profile, study preferences, API keys, and data.</p>
      </header>

      {/* ═══════ Profile ═══════ */}
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Update your display name and profile image.</p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          {profileAvatar ? (
            <img src={profileAvatar} alt="Avatar" className="h-16 w-16 rounded-full border border-slate-200 object-cover dark:border-slate-700" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {profileInitials}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Upload image
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            {profileAvatar && (
              <button type="button" onClick={() => setProfileAvatar("")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Display name"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleSaveProfile} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
              {profileSaved ? "Saved" : "Save"}
            </button>
            <button type="button" onClick={handleClearProfile} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
              Clear
            </button>
          </div>
        </div>
        {profileError && <p className="mt-3 text-sm text-rose-600">{profileError}</p>}
      </section>

      {/* ═══════ Study Preferences ═══════ */}
      {studentProfile && (
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Study preferences</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Configure your daily goal, subjects, and exam date. Changes affect the planner and recommendations.
          </p>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {/* Subjects */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Subjects ({selectedSubjects.length})</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECT_OPTIONS.map(({ slug, label }) => (
                  <label key={slug} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(slug)}
                      onChange={(e) => toggleSubject(slug, e.target.checked)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Goals and Exam */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div>
                <label className="block text-xs uppercase tracking-[0.4em] text-slate-500">Daily study goal (minutes)</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={15}
                    max={180}
                    step={15}
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="h-2 flex-1 rounded-full accent-emerald-600"
                  />
                  <span className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1 text-center text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    {dailyGoal}m
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.4em] text-slate-500">Exam date</label>
                <input
                  type="date"
                  value={examDate}
                  min={todayString}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.4em] text-slate-500">Exam year</label>
                <input
                  type="number"
                  value={examYear}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSavePreferences}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                {prefsSaved ? "Preferences saved" : "Save preferences"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ API Keys ═══════ */}
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">OpenAI API key (optional)</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Required for AI Chat and AI flashcard generation. Stored securely in Supabase.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={openAiKey}
            onChange={(e) => setOpenAiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
          <button type="button" onClick={handleSaveOpenAiKey} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
            {saved ? "Saved" : "Save"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Current: {openAiKey ? maskedKey : "Not set"}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link to="/dashboard/tools/aichat" className="text-slate-700 hover:text-slate-900 dark:text-slate-300">Open AI Chat</Link>
          <Link to="/dashboard/tools/flashcards" className="text-slate-700 hover:text-slate-900 dark:text-slate-300">Open Flashcards</Link>
        </div>
      </section>

      {/* ═══════ Account Session ═══════ */}
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Account session</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Signed in as {user?.email ?? user?.id ?? "unknown"}.</p>
        {studentProfile && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {studentProfile.name} | WASSCE {studentProfile.examYear} | {studentProfile.subjects.length} subjects | {studentProfile.dailyStudyGoalMinutes} min/day
            </p>
          </div>
        )}
      </section>

      {/* ═══════ Data Management ═══════ */}
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Data management</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Export your data or reset your progress.</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            <Download className="h-4 w-4" />
            Export data (JSON)
          </button>
        </div>
      </section>

      {/* ═══════ Danger Zone ═══════ */}
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/30">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-300">Danger zone</h2>
        </div>
        <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
          Clears all study sessions, quiz stats, planner data, and workspace notes. This is irreversible.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              confirmReset
                ? "border-rose-400 bg-rose-600 text-white hover:bg-rose-700"
                : "border-rose-200 bg-white text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            {confirmReset ? "Confirm: Reset everything" : "Reset all progress"}
          </button>
          {confirmReset && (
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="text-sm text-rose-600 hover:text-rose-800 dark:text-rose-400"
            >
              Cancel
            </button>
          )}
          <Link to="/dashboard/overview" className="text-sm text-rose-700 hover:text-rose-900 dark:text-rose-400">
            Return to overview
          </Link>
        </div>
      </section>
    </div>
  );
}
