import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isSupabaseConfigured } from "../../utils/supabase";

export default function ForgotPasswordPage() {
  const { resetPassword, signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedConfirmPassword = confirmPassword.trim();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.replace("#", ""));
    if (params.get("type") === "recovery") {
      setIsRecoveryFlow(true);
      const cleanUrl = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", cleanUrl);
    }
  }, []);

  const handleReset = async () => {
    setError(null);
    setNotice(null);

    if (isSupabaseConfigured) {
      if (isRecoveryFlow) {
        if (!trimmedPassword) {
          setError("New password is required.");
          return;
        }
        if (trimmedPassword.length < 6) {
          setError("Password should be at least 6 characters.");
          return;
        }
        if (trimmedPassword !== trimmedConfirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        setBusy(true);
        try {
          await resetPassword(trimmedEmail, trimmedPassword);
          navigate("/dashboard/overview", { replace: true });
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : "Unable to update password.";
          setError(message);
        } finally {
          setBusy(false);
        }
        return;
      }

      if (!trimmedEmail) {
        setError("Email is required.");
        return;
      }

      setBusy(true);
      try {
        await resetPassword(trimmedEmail, "");
        setNotice("Check your email for a password reset link.");
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Unable to send reset link.";
        setError(message);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (!trimmedPassword) {
      setError("New password is required.");
      return;
    }
    if (trimmedPassword.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await resetPassword(trimmedEmail, trimmedPassword);
      await signIn(trimmedEmail, trimmedPassword, true);
      navigate("/dashboard/overview", { replace: true });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to reset password.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col justify-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </span>
          <span className="text-lg font-semibold tracking-tight">WASSCE AI</span>
        </Link>

        <h1 className="mt-10 text-3xl font-semibold tracking-tight text-slate-950">Reset your password</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {isRecoveryFlow ? "Set a new password to finish your reset." : "Enter your email and we will send a password reset link."}
        </p>

        <div className="mt-8 space-y-5">
          {(!isSupabaseConfigured || !isRecoveryFlow) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="reset-email">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="Email Address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          )}

          {(!isSupabaseConfigured || isRecoveryFlow) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="reset-password">
                New password
              </label>
              <div className="relative">
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {(!isSupabaseConfigured || isRecoveryFlow) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="reset-confirm-password">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-700"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
          {notice ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p> : null}

          <button
            type="button"
            onClick={handleReset}
            disabled={busy}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy
              ? "Working..."
              : isSupabaseConfigured
                ? isRecoveryFlow
                  ? "Update password"
                  : "Send reset link"
                : "Reset password"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Remembered your password?{" "}
            <Link to="/auth/signin" className="font-semibold text-indigo-700 hover:text-indigo-800">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
