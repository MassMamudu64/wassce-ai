import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b1220] text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="text-2xl font-semibold text-white">WASSCE AI</div>
            <p className="text-sm text-slate-400">
              A focused learning platform for West African students preparing for WASSCE, designed to turn study time
              into daily momentum.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">Quick links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">Resources</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 text-slate-400" />
                <span>support@wassceai.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-slate-400" />
                <span>Monrovia, Liberia</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 text-slate-400" />
                <span>+231 88 123 4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Copyright (c) {currentYear} WASSCE AI. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <a href="mailto:support@wassceai.com" className="hover:text-white transition">
              Contact us
            </a>
            <Link to="/faq" className="hover:text-white transition">
              FAQ
            </Link>
            <Link to="/help" className="hover:text-white transition">
              Help Center
            </Link>
          </div>
          <div>
            Built with care by{" "}
            <a href="https://jula-tech.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 underline">
              Mass
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
