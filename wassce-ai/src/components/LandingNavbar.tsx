import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/wassce-a-logo.jpeg";

type NavLink = {
  label: string;
  href?: string;
  to?: string;
};

const navLinks: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", to: "/pricing" },
];

interface LandingNavbarProps {
  onLoginOpen: () => void;
}

const LandingNavbar = ({ onLoginOpen }: LandingNavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const greeting = useMemo(() => {
    if (!user) return null;
    return `Signed in as ${user.name}`;
  }, [user]);

  const linkClass =
    "text-sm font-medium text-slate-700 transition hover:text-slate-900";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-900">
          <img src={Logo} alt="WASSCE AI Logo" className="h-10 w-10 rounded-md" />
          <span className="hidden sm:inline-block">WASSCE AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.to ? (
              <Link key={link.label} to={link.to} className={linkClass}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className={linkClass}>
                {link.label}
              </a>
            ),
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>{greeting}</span>
              <Link
                to="/dashboard/overview"
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 transition hover:border-emerald-300"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/auth/signin"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                Sign in
              </Link>
              <button
                onClick={onLoginOpen}
                type="button"
                className="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(15,23,42,0.25)] transition hover:bg-slate-800 active:scale-95"
              >
                Start free
              </button>
            </div>
          )}
        </div>

        <button
          className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-white"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200/70 bg-white/90 backdrop-blur">
          <div className="flex flex-col gap-5 px-6 py-6">
            {navLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={linkClass}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={linkClass}
                >
                  {link.label}
                </a>
              ),
            )}

            {user ? (
              <div className="flex flex-col gap-2 text-sm text-slate-600">
                <span>{greeting}</span>
                <Link
                  to="/dashboard/overview"
                  onClick={() => setMenuOpen(false)}
                  className="self-start text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 hover:text-emerald-800"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="self-start text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:text-slate-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/auth/signin"
                  onClick={() => setMenuOpen(false)}
                  className="self-start text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:text-slate-900"
                >
                  Sign in
                </Link>
                <button
                  onClick={() => {
                    onLoginOpen();
                    setMenuOpen(false);
                  }}
                  type="button"
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
                >
                  Start free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
