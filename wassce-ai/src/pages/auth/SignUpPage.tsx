import { Apple, Chrome, Eye, EyeOff, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const providerAccounts = {
  google: {
    name: "Google Scholar",
    email: "google.scholar@wassce.ai",
    password: "provider:google",
    label: "Google",
    Icon: Chrome,
  },
  apple: {
    name: "Apple Scholar",
    email: "apple.scholar@wassce.ai",
    password: "provider:apple",
    label: "Apple",
    Icon: Apple,
  },
} as const;

export default function SignUpPage() {
  const { isAuthenticated, register, signIn } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedConfirmPassword = confirmPassword.trim();

  if (isAuthenticated) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  const validate = (): string | null => {
    if (!trimmedName) return "Full Name is required.";
    if (!trimmedEmail) return "Email is required.";
    if (!trimmedPassword) return "Password is required.";
    if (trimmedPassword.length < 6) return "Password should be at least 6 characters.";
    if (trimmedPassword !== trimmedConfirmPassword) return "Passwords do not match.";
    if (!agreeTerms) return "You must agree to the Terms of Service to continue.";
    return null;
  };

  const handleSignUp = async () => {
    setError(null);
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    setBusy(true);
    try {
      await register(trimmedName, trimmedEmail, trimmedPassword, remember);
      navigate("/dashboard/overview", { replace: true });
    } catch (caught) {
      const errMessage = caught instanceof Error ? caught.message : "Unable to create account.";
      setError(errMessage);
    } finally {
      setBusy(false);
    }
  };

  const handleProvider = async (provider: keyof typeof providerAccounts) => {
    setError(null);
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
        <aside className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18)_0%,rgba(0,0,0,0)_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_55%)]" />

          <div className="relative flex h-full w-full flex-col justify-between p-12 text-white">
            <div className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <GraduationCap className="h-6 w-6" />
              </span>
              <span className="text-lg font-semibold tracking-tight">WASSCE AI</span>
            </div>

            <div className="max-w-md space-y-5">
              <h2 className="text-5xl font-semibold leading-tight tracking-tight">Ace Your WASSCE with AI</h2>
              <p className="text-base leading-relaxed text-white/80">
                Join thousands of students studying smarter, not harder. Access personalized study plans, AI-driven
                practice tests, and instant feedback.
              </p>
            </div>

            <div className="max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["A", "K", "M"].map((initial) => (
                    <div
                      key={initial}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium">2,000+ students joined this week</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-3 lg:hidden">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </span>
              <span className="text-lg font-semibold tracking-tight">WASSCE AI</span>
            </Link>

            <h1 className="mt-10 text-4xl font-semibold tracking-tight text-slate-950">Create your account</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Start your journey to academic excellence today.
            </p>

            <div className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="signup-name">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Full Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="signup-email">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="signup-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800" htmlFor="signup-confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm-password"
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

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  By signing up, you agree to our{" "}
                  <Link to="/legal/terms" className="font-medium text-indigo-700 hover:text-indigo-800">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/legal/privacy" className="font-medium text-indigo-700 hover:text-indigo-800">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Keep me signed in
              </label>

              {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

              <button
                type="button"
                onClick={handleSignUp}
                disabled={busy}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? "Creating account..." : "Create Account"}
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-500">Or continue with</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {(Object.keys(providerAccounts) as (keyof typeof providerAccounts)[]).map((provider) => {
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

            <p className="mt-8 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/auth/signin" className="font-semibold text-indigo-700 hover:text-indigo-800">
                Log in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

