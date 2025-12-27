import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/wassce-a-logo.jpeg";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
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

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3 text-lg font-extrabold tracking-tight text-white">
            <img src={Logo} alt="WASSCE AI Logo" className="h-10 w-10 rounded-md" />
            {/* <span className="uppercase text-xs tracking-[0.4em]">WASSCE AI</span> */}
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-sm font-medium text-slate-300 transition hover:text-white
                           after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0
                           after:bg-indigo-500 after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 text-sm text-slate-200">
                <span>{greeting}</span>
                <Link
                  to="/dashboard/overview"
                  className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs uppercase tracking-[0.4em] text-emerald-200 transition hover:border-emerald-400 hover:text-white"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full border border-indigo-500/30 px-3 py-1 text-xs uppercase tracking-[0.4em] text-indigo-300 transition hover:border-indigo-400 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth/signin"
                  className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/70"
                >
                  Sign in
                </Link>
                <button
                  onClick={onLoginOpen}
                  type="button"
                  className="rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(14,165,233,0.4)] transition hover:from-indigo-400 hover:to-emerald-400 active:scale-95"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          <button
            className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur">
            <div className="flex flex-col gap-5 px-6 py-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  {link.label}
                </a>
              ))}

              {user ? (
                <div className="flex flex-col gap-2 text-sm text-slate-200">
                  <span>{greeting}</span>
                  <Link
                    to="/dashboard/overview"
                    onClick={() => setMenuOpen(false)}
                    className="self-start text-xs uppercase tracking-[0.4em] text-emerald-200 hover:text-white"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="self-start text-xs uppercase tracking-[0.4em] text-indigo-300 hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/auth/signin"
                    onClick={() => setMenuOpen(false)}
                    className="self-start text-xs font-semibold uppercase tracking-[0.4em] text-slate-200 hover:text-white"
                  >
                    Sign in
                  </Link>
                  <button
                    onClick={() => {
                      onLoginOpen();
                      setMenuOpen(false);
                    }}
                    type="button"
                    className="rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/40 transition hover:from-indigo-400 hover:to-emerald-400 active:scale-95"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default LandingNavbar;
