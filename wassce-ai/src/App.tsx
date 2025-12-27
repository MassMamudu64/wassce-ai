import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/Landing/LandingPage";
import { AuthProvider } from "./contexts/AuthContext";
import { LearningProvider } from "./contexts/LearningContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { UIProvider } from "./contexts/UIContext";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardOverviewPage from "./pages/dashboard/DashboardOverviewPage";
import DashboardToolsPage from "./pages/dashboard/DashboardToolsPage";
import DashboardPlannerPage from "./pages/dashboard/DashboardPlannerPage";
import DashboardPastPapersPage from "./pages/dashboard/DashboardPastPapersPage";
import DashboardTopicsPage from "./pages/dashboard/DashboardTopicsPage";
import DashboardProgressPage from "./pages/dashboard/DashboardProgressPage";
import DashboardSettingsPage from "./pages/dashboard/DashboardSettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import TermsPage from "./pages/legal/TermsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import PricingPage from "./pages/marketing/PricingPage";
import AboutPage from "./pages/marketing/AboutPage";
import BlogPage from "./pages/marketing/BlogPage";
import HelpPage from "./pages/marketing/HelpPage";
import FaqPage from "./pages/marketing/FaqPage";
import FeaturesRedirectPage from "./pages/marketing/FeaturesRedirectPage";

const App = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <LearningProvider>
          <Router>
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
                <Route path="settings" element={<DashboardSettingsPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </LearningProvider>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
