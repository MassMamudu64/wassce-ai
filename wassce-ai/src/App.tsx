import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LearningProvider } from "./contexts/LearningContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineBanner from "./components/UI/OfflineBanner";
import { UIProvider } from "./contexts/UIContext";
import SupabaseSync from "./contexts/SupabaseSync";

// Route-level code splitting: each page is loaded on demand so the initial
// bundle stays small for students on low-end devices and slow networks.
const LandingPage = lazy(() => import("./pages/Landing/LandingPage"));
const DashboardLayout = lazy(() => import("./layout/DashboardLayout"));
const DashboardOverviewPage = lazy(() => import("./pages/dashboard/DashboardOverviewPage"));
const DashboardToolsPage = lazy(() => import("./pages/dashboard/DashboardToolsPage"));
const DashboardPlannerPage = lazy(() => import("./pages/dashboard/DashboardPlannerPage"));
const DashboardPastPapersPage = lazy(() => import("./pages/dashboard/DashboardPastPapersPage"));
const DashboardTopicsPage = lazy(() => import("./pages/dashboard/DashboardTopicsPage"));
const DashboardProgressPage = lazy(() => import("./pages/dashboard/DashboardProgressPage"));
const DashboardSettingsPage = lazy(() => import("./pages/dashboard/DashboardSettingsPage"));
const DashboardBillingPage = lazy(() => import("./pages/dashboard/DashboardBillingPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const SignInPage = lazy(() => import("./pages/auth/SignInPage"));
const SignUpPage = lazy(() => import("./pages/auth/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const TermsPage = lazy(() => import("./pages/legal/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/legal/PrivacyPage"));
const PricingPage = lazy(() => import("./pages/marketing/PricingPage"));
const AboutPage = lazy(() => import("./pages/marketing/AboutPage"));
const BlogPage = lazy(() => import("./pages/marketing/BlogPage"));
const HelpPage = lazy(() => import("./pages/marketing/HelpPage"));
const FaqPage = lazy(() => import("./pages/marketing/FaqPage"));
const FeaturesRedirectPage = lazy(() => import("./pages/marketing/FeaturesRedirectPage"));

const RouteFallback = () => (
  <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-slate-300">
    <div className="flex flex-col items-center gap-3">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
      <span className="text-sm">Loading…</span>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <UIProvider>
            <SupabaseSync>
              <LearningProvider>
                <OfflineBanner />
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/features" element={<FeaturesRedirectPage />} />
                    <Route path="/auth">
                      <Route index element={<Navigate to="signin" replace />} />
                      <Route path="signin" element={<SignInPage />} />
                      <Route path="signup" element={<SignUpPage />} />
                      <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    </Route>
                    <Route path="/legal">
                      <Route index element={<Navigate to="terms" replace />} />
                      <Route path="terms" element={<TermsPage />} />
                      <Route path="privacy" element={<PrivacyPage />} />
                    </Route>
                    <Route path="/terms" element={<Navigate to="/legal/terms" replace />} />
                    <Route path="/privacy" element={<Navigate to="/legal/privacy" replace />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="overview" replace />} />
                      <Route path="overview" element={<DashboardOverviewPage />} />
                      <Route path="planner" element={<DashboardPlannerPage />} />
                      <Route path="past-papers" element={<DashboardPastPapersPage />} />
                      <Route path="tools" element={<DashboardToolsPage />} />
                      <Route path="tools/:toolId" element={<DashboardToolsPage />} />
                      <Route path="topics" element={<DashboardTopicsPage />} />
                      <Route path="progress" element={<DashboardProgressPage />} />
                      <Route path="billing" element={<DashboardBillingPage />} />
                      <Route path="settings" element={<DashboardSettingsPage />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </LearningProvider>
            </SupabaseSync>
          </UIProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
