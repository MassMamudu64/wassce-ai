import { useNavigate } from "react-router-dom";
import LandingNavbar from "../../components/LandingNavbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import CTASection from "./CTASection";
import FooterSection from "./FooterSection";

const LandingPage = () => {
  const navigate = useNavigate();
  const openSignUp = () => navigate("/auth/signup");
  const openSignIn = () => navigate("/auth/signin");

  return (
    <div className="landing-theme min-h-screen">
      <LandingNavbar onLoginOpen={openSignUp} />
      <main>
        <HeroSection onOpenLogin={openSignUp} />
        <FeaturesSection />
        <CTASection onOpenLogin={openSignIn} />
      </main>
      <FooterSection />
    </div>
  );
};

export default LandingPage;
