import { useEffect, useMemo, useRef, type ComponentType } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useUI } from "../contexts/UIContext";
import MobileSnackbar from "../components/UI/MobileSnackbar";
import ScrollIndicator from "../components/UI/ScrollIndicator";

type NavItem = {
  label: string;
  to: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Overview", to: "/dashboard/overview", icon: LayoutDashboard },
  { label: "Planner", to: "/dashboard/planner", icon: CalendarDays },
  { label: "Past Papers", to: "/dashboard/past-papers", icon: FileText },
  { label: "Tools", to: "/dashboard/tools", icon: Wrench },
  { label: "Topics", to: "/dashboard/topics", icon: BookOpen },
  { label: "Progress", to: "/dashboard/progress", icon: BarChart3 },
  { label: "Billing", to: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];

const getNavClass = (active: boolean, isDark: boolean) =>
  `flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
    active
      ? isDark
        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
        : "border-emerald-200 bg-emerald-50 text-emerald-700"
      : isDark
        ? "border-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-900/40"
        : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/70"
  }`;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen, toggleSidebarCollapsed, toggleSidebar, theme, toggleTheme } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const layoutGrid = useMemo(
    () => (sidebarCollapsed ? "lg:grid-cols-[5rem_1fr]" : "lg:grid-cols-[16rem_1fr]"),
    [sidebarCollapsed],
  );

  return (
    <div className={isDark ? "min-h-dvh overflow-hidden bg-slate-950 text-slate-100" : "landing-theme min-h-dvh overflow-hidden"}>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className={`fixed inset-0 z-20 lg:hidden ${isDark ? "bg-black/60" : "bg-slate-900/40"}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`h-full lg:grid ${layoutGrid}`}>
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 border-r backdrop-blur transition-transform duration-200 lg:static lg:w-auto lg:translate-x-0 ${
            isDark ? "border-slate-800 bg-slate-950/95" : "border-slate-200 bg-white/90"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-full flex-col overflow-hidden px-4 py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.5em] text-slate-500">WASSCE AI</p>
                <p className={`truncate text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  {user?.name ?? "Student"}
                </p>
              </div>
              <button
                type="button"
                className={`inline-flex items-center justify-center rounded-xl border p-2 lg:hidden ${
                  isDark ? "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80" : "border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100"
                }`}
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-6 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => getNavClass(isActive, isDark)}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon
                      size={18}
                      className={`shrink-0 ${
                        location.pathname.startsWith(item.to)
                          ? isDark
                            ? "text-emerald-300"
                            : "text-emerald-600"
                          : isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                      }`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </nav>

            {!sidebarCollapsed && (
              <div className={`mt-4 rounded-2xl border p-3 text-xs ${isDark ? "border-slate-800 bg-slate-900/60 text-slate-300" : "border-slate-200 bg-white/70 text-slate-500"}`}>
                Your dashboard is your daily workspace: plan, practice, review, repeat.
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col">
          <header className={`sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur ${
            isDark ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-white/80"
          }`}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`inline-flex items-center justify-center rounded-xl border p-2 lg:hidden ${
                  isDark ? "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80" : "border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100"
                }`}
                onClick={toggleSidebar}
                aria-label="Open sidebar"
              >
                <Menu size={18} />
              </button>

              <button
                type="button"
                className={`hidden items-center justify-center rounded-xl border p-2 lg:inline-flex ${
                  isDark ? "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80" : "border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100"
                }`}
                onClick={toggleSidebarCollapsed}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>

              <div className="hidden sm:block">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Dashboard</p>
                <p className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  {user?.email ?? user?.id ?? "Signed in"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                  isDark
                    ? "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80"
                    : "border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100"
                }`}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                {isDark ? "Light" : "Dark"}
              </button>
              <NavLink
                to="/"
                className={`hidden rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] sm:inline-flex ${
                  isDark
                    ? "border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                Landing
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                  isDark
                    ? "border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                }`}
              >
                Sign out
              </button>
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            <main
              ref={mainRef}
              className="h-full overflow-y-auto overscroll-y-contain px-4 py-6 pb-24 sm:px-6 sm:pb-6"
            >
              <Outlet />
            </main>
            <ScrollIndicator targetRef={mainRef} tone={isDark ? "dark" : "light"} />
          </div>
        </div>
      </div>

      <MobileSnackbar />
    </div>
  );
}
