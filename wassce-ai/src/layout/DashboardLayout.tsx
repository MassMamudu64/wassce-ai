import { useEffect, useMemo, type ComponentType } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useUI } from "../contexts/UIContext";

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
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];

const getNavClass = (active: boolean) =>
  `flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
    active
      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
      : "border-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-900/40"
  }`;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen, toggleSidebarCollapsed, toggleSidebar } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const layoutGrid = useMemo(
    () => (sidebarCollapsed ? "lg:grid-cols-[5rem_1fr]" : "lg:grid-cols-[16rem_1fr]"),
    [sidebarCollapsed],
  );

  return (
    <div className="h-dvh overflow-hidden bg-slate-950 text-white">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`h-full lg:grid ${layoutGrid}`}>
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-800 bg-slate-950/95 backdrop-blur transition-transform duration-200 lg:static lg:w-auto lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden px-4 py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.5em] text-slate-500">WASSCE AI</p>
                <p className="truncate text-sm font-semibold text-white">{user?.name ?? "Student"}</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-slate-300 hover:bg-slate-800/60 lg:hidden"
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
                    className={({ isActive }) => getNavClass(isActive)}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon size={18} className="shrink-0 text-slate-200" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </nav>

            {!sidebarCollapsed && (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-3 text-xs text-slate-300">
                Your dashboard is your daily workspace: plan, practice, review, repeat.
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-slate-200 hover:bg-slate-800/60 lg:hidden"
                onClick={toggleSidebar}
                aria-label="Open sidebar"
              >
                <Menu size={18} />
              </button>

              <button
                type="button"
                className="hidden items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-slate-200 hover:bg-slate-800/60 lg:inline-flex"
                onClick={toggleSidebarCollapsed}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>

              <div className="hidden sm:block">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Dashboard</p>
                <p className="text-sm font-semibold text-slate-100">{user?.email ?? "Signed in"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NavLink
                to="/"
                className="hidden rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 hover:border-slate-600 hover:text-white sm:inline-flex"
              >
                Landing
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 hover:border-indigo-400 hover:text-indigo-200"
              >
                Sign out
              </button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
