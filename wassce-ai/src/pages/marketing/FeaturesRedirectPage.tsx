import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FeaturesRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
    window.setTimeout(() => {
      const node = document.getElementById("features");
      node?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [navigate]);

  return null;
}

