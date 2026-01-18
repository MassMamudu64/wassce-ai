import { CreditCard, Home, Settings, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUI } from "../../contexts/UIContext";

export default function MobileSnackbar() {
  const { theme } = useUI();
  const isDark = theme === "dark";
  const links = [
    { label: "Home", to: "/dashboard/overview", icon: Home },
    { label: "Billing", to: "/dashboard/billing", icon: CreditCard },
    { label: "Tools", to: "/dashboard/tools", icon: Wrench },
    { label: "Settings", to: "/dashboard/settings", icon: Settings },
  ] as const;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden pb-[env(safe-area-inset-bottom)]" role="status" aria-live="polite">
      <div
        className={`rounded-2xl border px-3 py-2 shadow-2xl backdrop-blur ${
          isDark ? "border-slate-800 bg-slate-950/95 text-slate-200" : "border-slate-200 bg-white/95 text-slate-700"
        }`}
      >
        <nav className="grid grid-cols-4 gap-2 text-xs font-semibold">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition ${
                  isActive
                    ? isDark
                      ? "bg-emerald-500/20 text-emerald-100"
                      : "bg-slate-900 text-white"
                    : isDark
                      ? "text-slate-300 hover:bg-slate-900/70"
                      : "text-slate-500 hover:bg-slate-100"
                }`
              }
              aria-label={link.label}
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
