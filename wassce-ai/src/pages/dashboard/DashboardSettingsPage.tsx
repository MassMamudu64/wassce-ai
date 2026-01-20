import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLearningStore } from "../../stores/learningStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import {
  getOpenAiApiKey,
  getUserProfile,
  loadUserProfile,
  loadUserSettings,
  removeUserProfile,
  setOpenAiApiKey,
  setUserProfile,
} from "../../utils/settings";

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const { studentProfile, resetProgress } = useLearningStore();
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);
  const userRef = user?.id ?? user?.email ?? null;
  const [openAiKey, setOpenAiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const maskedKey = useMemo(() => {
    if (!openAiKey) return "";
    const trimmed = openAiKey.trim();
    if (trimmed.length <= 8) return "********";
    return `${trimmed.slice(0, 3)}********${trimmed.slice(-4)}`;
  }, [openAiKey]);

  const profileInitials = useMemo(() => {
    const fallback = "ST";
    const trimmed = profileName.trim();
    if (!trimmed) return fallback;
    const initials = trimmed
      .split(/\s+/)
      .filter(Boolean)
      .map((segment) => segment[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return initials || fallback;
  }, [profileName]);

  useEffect(() => {
    if (!userRef) {
      Promise.resolve().then(() => {
        setProfileName(user?.name ?? "");
        setProfileAvatar("");
        setOpenAiKey("");
      });
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

    return () => {
      mounted = false;
    };
  }, [user?.name, userRef]);

  const handleSaveOpenAiKey = async () => {
    const trimmed = openAiKey.trim();
    await setOpenAiApiKey(trimmed ? trimmed : null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProfileError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Image is too large (max 2MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setProfileError(null);
    if (!userRef) {
      setProfileError("Sign in to update your profile.");
      return;
    }
    const trimmedName = profileName.trim();
    if (!trimmedName) {
      setProfileError("Display name is required.");
      return;
    }
    await setUserProfile(userRef, {
      displayName: trimmedName,
      avatarDataUrl: profileAvatar ? profileAvatar : undefined,
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

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-900">Account and configuration</h1>
        <p className="mt-2 text-sm text-slate-600">Control your profile, data, and optional AI key.</p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-600">Update your display name and profile image (stored in Supabase).</p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt="Profile avatar"
              className="h-16 w-16 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600">
              {profileInitials}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Upload image
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            {profileAvatar && (
              <button
                type="button"
                onClick={() => setProfileAvatar("")}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Remove image
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
            placeholder="Display name"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveProfile}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {profileSaved ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleClearProfile}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>

        {profileError && <p className="mt-3 text-sm text-rose-600">{profileError}</p>}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h2 className="text-lg font-semibold text-slate-900">OpenAI API key (optional)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Stored in Supabase. Needed for AI Chat and AI flashcard generation.
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
        <p className="mt-3 text-xs text-slate-500">Sessions are stored securely in Supabase.</p>
      </section>

      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <h2 className="text-lg font-semibold">Reset progress</h2>
        <p className="mt-1 text-sm">Clears study sessions, quiz stats, and profile data in your Supabase account.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              resetProgress();
              resetWorkspace();
              void setOpenAiApiKey(null);
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
