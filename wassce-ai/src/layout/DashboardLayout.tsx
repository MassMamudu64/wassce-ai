import { useEffect, useMemo, useRef, type ComponentType } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CreditCard,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Sun,
  Target,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useUI } from "../contexts/UIContext";
import { useLearningStore } from "../stores/learningStore";
import { useReadinessScore, useStudyStreak } from "../stores/learningSelectors";
import MobileSnackbar from "../components/UI/MobileSnackbar";
import ScrollIndicator from "../components/UI/ScrollIndicator";

type NavItem = {
  label: string;
  to: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// Grouped navigation gives the sidebar a learning-platform hierarchy instead of
// a flat admin list. Every destination resolves to a real route — "AI Tutor"
// deep-links into the existing AI chat tool so there are no dead links.
const navGroups: NavGroup[] = [
  {
    title: "Learn",
    items: [
      { label: "Dashboard", to: "/dashboard/overview", icon: LayoutDashboard },
      { label: "Study Planner", to: "/dashboard/planner", icon: CalendarDays },
      { label: "Subjects", to: "/dashboard/topics", icon: BookOpen },
    ],
  },
  {
    title: "Practice",
    items: [
      { label: "Past Papers", to: "/dashboard/past-papers", icon: FileText },
      { label: "AI Tutor", to: "/dashboard/tools/aichat", icon: Sparkles },
      { label: "Study Tools", to: "/dashboard/tools", icon: Wrench },
    ],
  },
  {
    title: "Insights",
    items: [{ label: "Progress", to: "/dashboard/progress", icon: BarChart3 }],
  },
  {
    title: "Account",
    items: [
      { label: "Billing", to: "/dashboard/billing", icon: CreditCard },
      { label: "Settings", to: "/dashboard/settings", icon: Settings },
    ],
  },
];

// Touch-first bottom bar for phones — the five destinations students reach for most.
const bottomNavItems: NavItem[] = [
  { label: "Home", to: "/dashboard/overview", icon: LayoutDashboard },
  { label: "Planner", to: "/dashboard/planner", icon: CalendarDays },
  { label: "Papers", to: "/dashboard/past-papers", icon: FileText },
  { label: "AI", to: "/dashboard/tools/aichat", icon: Sparkles },
  { label: "Progress", to: "/dashboard/progress", icon: BarChart3 },
];

const allItems = navGroups.flatMap((group) => group.items);

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "S";

const readinessTone: Record<string, string> = {
  ready: "text-emerald-500",
  "on-track": "text-emerald-500",
  building: "text-amber-500",
  starting: "text-rose-500",
  none: "text-slate-400",
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { studentProfile } = useLearningStore();
  const {
    sidebarCollapsed,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
  } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const isDark = theme === "dark";
  const streak = useStudyStreak();
  const readiness = useReadinessScore();

  const displayName = studentProfile?.name ?? user?.name ?? "Student";
  const initials = initialsOf(displayName);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  // Highlight the most specific matching route so "AI Tutor" wins over "Study
  // Tools" when both share the /dashboard/tools prefix.
  const activeTo = useMemo(() => {
    return allItems
      .filter((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))
      .sort((a, b) => b.to.length - a.to.length)[0]?.to;
  }, [location.pathname]);

  const pageTitle = useMemo(
    () => allItems.find((item) => item.to === activeTo)?.label ?? "Dashboard",
    [activeTo],
  );

  const layoutGrid = sidebarCollapsed ? "lg:grid-cols-[5.5rem_1fr]" : "lg:grid-cols-[17rem_1fr]";

  const navItemClass = (active: boolean) =>
    `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
      sidebarCollapsed ? "lg:justify-center" : ""
    } ${
      active
        ? "bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)]"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white"
    }`;

  return (
    <div className={isDark ? "min-h-dvh overflow-hidden bg-slate-950 text-slate-100" : "landing-theme min-h-dvh overflow-hidden"}>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`h-full lg:grid ${layoutGrid}`}>
        {/* ───────────── Sidebar ───────────── */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 border-r backdrop-blur transition-transform duration-200 lg:static lg:w-auto lg:translate-x-0 ${
            isDark ? "border-slate-800 bg-slate-950/95" : "border-slate-200 bg-white/90"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-full flex-col overflow-hidden px-4 py-5">
            {/* Brand + student identity */}
            <div className="flex items-center justify-between gap-3">
              <NavLink to="/dashboard/overview" className={`flex min-w-0 items-center gap-3 ${sidebarCollapsed ? "lg:justify-center" : ""}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-lg">
                  {initials}
                </span>
                {!sidebarCollapsed && (
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{displayName}</span>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
                      WASSCE AI
                    </span>
                  </span>
                )}
              </NavLink>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Readiness mini-card */}
            {!sidebarCollapsed && (
              <div className={`mt-5 rounded-2xl border p-3 ${isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                    <Target size={13} /> Readiness
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                    <Flame size={13} className={streak > 0 ? "fill-orange-500" : ""} /> {streak}
                  </span>
                </div>
                <p className={`mt-1 text-2xl font-bold ${readinessTone[readiness.band]}`}>
                  {readiness.score !== null ? `${readiness.score}%` : "--"}
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                    style={{ width: `${readiness.score ?? 0}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] font-medium text-slate-500">{readiness.label}</p>
              </div>
            )}

            {/* Grouped nav */}
            <nav className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
              {navGroups.map((group) => (
                <div key={group.title}>
                  {!sidebarCollapsed && (
                    <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
                      {group.title}
                    </p>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = item.to === activeTo;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={navItemClass(active)}
                          onClick={() => setSidebarOpen(false)}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <item.icon size={19} className="shrink-0" />
                          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="mt-4 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
              >
                <LogOut size={19} className="shrink-0" />
                Sign out
              </button>
            )}
          </div>
        </aside>

        {/* ───────────── Main column ───────────── */}
        <div className="flex min-h-0 flex-col">
          <header className={`sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur ${
            isDark ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-white/80"
          }`}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                onClick={toggleSidebar}
                aria-label="Open sidebar"
              >
                <Menu size={18} />
              </button>
              <button
                type="button"
                className="hidden items-center justify-center rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-600 hover:bg-slate-100 lg:inline-flex dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                onClick={toggleSidebarCollapsed}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
              <h1 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Live stat chips */}
              <span className="hidden items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 sm:inline-flex dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400">
                <Flame size={14} className={streak > 0 ? "fill-orange-500 text-orange-500" : ""} />
                {streak} day{streak !== 1 ? "s" : ""}
              </span>
              {readiness.score !== null && (
                <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 md:inline-flex dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Target size={14} />
                  {readiness.score}% ready
                </span>
              )}
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white" title={displayName}>
                {initials}
              </span>
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            <main
              ref={mainRef}
              className="h-full overflow-y-auto overscroll-y-contain px-4 py-6 pb-28 sm:px-6 lg:pb-8"
            >
              <Outlet />
            </main>
            <ScrollIndicator targetRef={mainRef} tone={isDark ? "dark" : "light"} />
          </div>
        </div>
      </div>

      {/* ───────────── Mobile bottom navigation ───────────── */}
      <nav
        className={`fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t px-1 pb-[env(safe-area-inset-bottom)] lg:hidden ${
          isDark ? "border-slate-800 bg-slate-950/95" : "border-slate-200 bg-white/95"
        } backdrop-blur`}
      >
        {bottomNavItems.map((item) => {
          const active = item.to === activeTo;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition ${
                active ? "text-emerald-500" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              <span className={`flex h-8 w-12 items-center justify-center rounded-full transition ${active ? "bg-emerald-500/15" : ""}`}>
                <item.icon size={20} />
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <MobileSnackbar />
    </div>
  );
}
