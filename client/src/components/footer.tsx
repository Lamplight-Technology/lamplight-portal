import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import LoginModal from "@/components/login-modal";
import type { Company } from "@shared/schema";

interface FooterProps {
  company?: Company;
}

export default function Footer({ company }: FooterProps) {
  const defaultBlurb = "Specializing in cutting-edge SaaS platforms that transform how businesses operate, scale, and succeed in the digital economy.";
  const defaultEmail = "info@example.com";
  const [loginOpen, setLoginOpen] = useState(false);

  const { data: authData } = useQuery<{ user: any | null }>({
    queryKey: ["/api/user"],
  });
  const isAuthenticated = authData?.user !== null && authData?.user !== undefined;

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <h3 className="text-xl font-bold mb-4 text-blue-400">{company?.name || "Lamplight Technology"}</h3>
            <p className="text-slate-300 mb-4">{company?.footerBlurb || defaultBlurb}</p>
            <div className="flex items-center gap-2 text-slate-300 mb-2">
              <Mail className="h-4 w-4" />
              <a 
                href={`mailto:${company?.contactEmail || defaultEmail}`}
                className="hover:text-blue-400 transition-colors"
                data-testid="link-footer-email"
              >
                {company?.contactEmail || defaultEmail}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-slate-300 hover:text-blue-400 transition-colors">Home</a></li>
              {company?.showAbout !== false && (
                <li><a href="/about" className="text-slate-300 hover:text-blue-400 transition-colors">About Us</a></li>
              )}
              {company?.showPlatforms !== false && (
                <li><a href="/platforms" className="text-slate-300 hover:text-blue-400 transition-colors">Our Platforms</a></li>
              )}
              <li><a href="/careers" className="text-slate-300 hover:text-blue-400 transition-colors">Careers</a></li>
              {company?.showContact !== false && (
                <li><a href="/contact" className="text-slate-300 hover:text-blue-400 transition-colors">Contact</a></li>
              )}
              <li><a href="/insights" className="text-slate-300 hover:text-blue-400 transition-colors">Insights</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/legal/privacy" className="text-slate-300 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/legal/terms" className="text-slate-300 hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="/legal/cookies" className="text-slate-300 hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              <li><a href="/legal/support" className="text-slate-300 hover:text-blue-400 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        {/* Values tagline */}
        <div className="border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm italic mb-6">
            Built with purpose. Operated with integrity.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-slate-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} {company?.name?.trim() || "Lamplight Technology"}. All rights reserved.
          </div>
          <div className="text-slate-400 text-sm flex items-center gap-3">
            <span>
              Website designed and developed by <span className="text-blue-400">Lamplight Software</span>
            </span>
            {!isAuthenticated && (
              <>
                <span aria-hidden className="text-slate-700">·</span>
                <button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="text-slate-600 hover:text-slate-300 text-xs transition-colors"
                  data-testid="link-footer-signin"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} redirect="/admin" />
    </footer>
  );
}