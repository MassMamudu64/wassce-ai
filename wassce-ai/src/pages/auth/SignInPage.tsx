import { Apple, Chrome, Eye, EyeOff, GraduationCap, Monitor } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "../../utils/supabase";

type LocationState = { from?: { pathname?: string } };

const providerAccounts = {
  google: {
    name: "Google Scholar",
    email: "google.scholar@wassce.ai",
    password: "provider:google",
    label: "Google",
    Icon: Chrome,
  },
  microsoft: {
    name: "Microsoft Scholar",
    email: "microsoft.scholar@wassce.ai",
    password: "provider:microsoft",
    label: "Microsoft",
    Icon: Monitor,
  },
  apple: {
    name: "Apple Scholar",
    email: "apple.scholar@wassce.ai",
    password: "provider:apple",
    label: "Apple",
    Icon: Apple,
  },
} as const;

export default function SignInPage() {
  const { isAuthenticated, signIn, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const supabaseEnabled = Boolean(isSupabaseConfigured && supabase);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  const redirectTarget = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.pathname && state.from.pathname.startsWith("/dashboard")
      ? state.from.pathname
      : "/dashboard/overview";
  }, [location.state]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  const handleSignIn = async () => {
    setError(null);
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (!trimmedPassword) {
      setError("Password is required.");
      return;
    }

    setBusy(true);
    try {
      await signIn(trimmedEmail, trimmedPassword, remember);
      navigate(redirectTarget, { replace: true });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to sign in.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleProvider = async (provider: keyof typeof providerAccounts) => {
    setError(null);
    if (supabaseEnabled && supabase) {
      const oauthProvider = provider === "microsoft" ? "azure" : provider;
      setBusy(true);
      try {
        const { error } = await supabase.auth.signInWithOAuth({ provider: oauthProvider });
        if (error) throw new Error(error.message);
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Unable to continue with provider.";
        setError(message);
      } finally {
        setBusy(false);
      }
      return;
    }

    const account = providerAccounts[provider];
    setBusy(true);
    try {
      try {
        await signIn(account.email, account.password, true);
      } catch {
        try {
          await register(account.name, account.email, account.password, true);
        } catch {
          await signIn(account.email, account.password, true);
        }
      }
      navigate("/dashboard/overview", { replace: true });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to continue with provider.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <main className="flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </span>
              <span className="text-lg font-semibold tracking-tight">WASSCE AI</span>
            </Link>

            <h1 className="mt-10 text-4xl font-semibold tracking-tight text-slate-950">Welcome back, Scholar!</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Enter your credentials to access your personalized study workspace.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {(["google", "microsoft"] as const).map((provider) => {
                const { label, Icon } = providerAccounts[provider];
                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => handleProvider(provider)}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-500">Or continue with email</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="signin-email">
                  Email address
                </label>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="signin-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Password"
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

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Remember me
                </label>
                <Link to="/auth/forgot-password" className="text-sm font-medium text-indigo-700 hover:text-indigo-800">
                  Forgot password?
                </Link>
              </div>

              {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

              <button
                type="button"
                onClick={handleSignIn}
                disabled={busy}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? "Signing in..." : "Log In"}
              </button>

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link to="/auth/signup" className="font-semibold text-indigo-700 hover:text-indigo-800">
                  Sign Up for free
                </Link>
              </p>

              <div className="pt-6 text-center text-xs text-slate-500">
                <Link to="/legal/privacy" className="hover:text-slate-700">
                  Privacy Policy
                </Link>{" "}
                <span className="px-2 text-slate-300">•</span>
                <Link to="/legal/terms" className="hover:text-slate-700">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </main>

        <aside className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
          {/* <img alt="" class="absolute inset-0 h-full w-full object-cover" data-alt="Students studying together in a modern library environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMLjYW09H1oJec0GQE4Svpp13rdI2gNUhy_VR9ZHoXUyam5Xoq85temcFTLjgyXH4YvdCsSuxs9_sblTw5hSd7vvnf6zqhkk9AmkUqAhIddHRvCeJkonFJdHSyf5VZ4juMg5hOwfDj60DvUqoQeKmXAqqUIg9W9lxl_5WWRv_4wf49Pwkucd4sxIVW0ymDc185NGWAoXk_JxDvPZFsZ_wSUiAXLgFDhZg2yM0CNOXRTuRixuR7KKQXGlE7TJrAN23wftb0MErbP68"/>  */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.35)_0%,rgba(0,0,0,0)_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.25)_0%,rgba(0,0,0,0)_55%)]" />

          <div className="relative flex h-full items-end p-12">
            <div className="max-w-md rounded-3xl border border-white/15 bg-white/10 p-7 text-white shadow-[0_25px_60px_rgba(2,6,23,0.55)] backdrop-blur">
              <div className="flex items-center gap-1 text-amber-300">
                {"★★★★★".split("").map((star, index) => (
                  <span key={`${star}-${index}`} className="text-sm">
                    {star}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-lg font-medium leading-relaxed">
                &quot;WASSCE AI helped me organize my study schedule and focus on my weak areas. I felt so much more
                confident walking into the exam hall.&quot;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                  AK
                </div>
                <div>
                  <p className="text-sm font-semibold">Ama K.</p>
                  <p className="text-xs text-white/70">Grade A Student, 2023</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
