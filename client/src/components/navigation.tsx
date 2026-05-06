import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings, Menu, LogOut } from "lucide-react";
import type { Company } from "@shared/schema";

interface NavigationProps {
  onAdminClick: () => void;
  company?: Company;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

export default function Navigation({ onAdminClick, company, isAuthenticated = false, isAdmin = false }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  // If we're on the homepage, scroll smoothly to the section. If we're on
  // another route (/about, /careers, /insights, /admin, etc.), navigate to
  // the homepage with the matching path so home.tsx's auto-scroll handler
  // picks it up.
  const goToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    if (location === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    setLocation(`/${sectionId === "home" ? "" : sectionId}`);
  };

  const headerPadding = company?.headerPaddingY ?? 16;
  const titleStyle = {
    fontFamily: company?.titleFontFamily ?? "Inter",
    fontSize: `${company?.titleFontSize ?? 24}px`,
    fontWeight: company?.titleFontWeight ?? "700",
    color: company?.titleColor ?? "#0f172a",
  };
  const sloganStyle = {
    fontFamily: company?.sloganFontFamily ?? "Inter",
    fontSize: `${company?.sloganFontSize ?? 14}px`,
    fontWeight: company?.sloganFontWeight ?? "400",
    color: company?.sloganColor ?? "#64748b",
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="flex justify-between items-center"
          style={{ paddingTop: `${headerPadding}px`, paddingBottom: `${headerPadding}px` }}
        >
          <div className="flex items-center gap-3">
            {company?.logo && (
              <img 
                src={company.logo} 
                alt={company.name}
                style={{ height: `${company.logoHeight ?? 40}px` }}
                className="w-auto object-contain"
                data-testid="img-company-logo"
              />
            )}
            {(!company?.logo || company?.showNameWithLogo) && (
              <div className="flex flex-col">
                <h1 
                  className="leading-tight" 
                  style={titleStyle}
                  data-testid="text-company-name"
                >
                  {company?.name || "Lamplight Technology"}
                </h1>
                {company?.sloganText && (
                  <span 
                    style={sloganStyle}
                    className="leading-tight"
                    data-testid="text-company-slogan"
                  >
                    {company.sloganText}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => goToSection('home')}
                className="text-lamplight-primary hover:text-lamplight-accent px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </button>
              {company?.showPlatforms !== false && (
                <button
                  onClick={() => goToSection('platforms')}
                  className="text-slate-500 hover:text-lamplight-accent px-3 py-2 text-sm font-medium transition-colors"
                >
                  Platforms
                </button>
              )}
              {company?.showAbout !== false && (
                <button
                  onClick={() => goToSection('why')}
                  className="text-slate-500 hover:text-lamplight-accent px-3 py-2 text-sm font-medium transition-colors"
                >
                  Why
                </button>
              )}
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-500 hover:text-lamplight-accent px-3 py-2 text-sm font-medium transition-colors"
              >
                About
              </Link>
              {company?.showContact !== false && (
                <button
                  onClick={() => goToSection('contact')}
                  className="text-slate-500 hover:text-lamplight-accent px-3 py-2 text-sm font-medium transition-colors"
                >
                  Contact
                </button>
              )}
              {isAuthenticated && (
                <>
                  <Button
                    onClick={onAdminClick}
                    className="bg-lamplight-accent text-white hover:bg-blue-600"
                    size="sm"
                    data-testid="button-admin"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => goToSection('home')}
                className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-lamplight-accent"
              >
                Home
              </button>
              {company?.showPlatforms !== false && (
                <button
                  onClick={() => goToSection('platforms')}
                  className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-lamplight-accent"
                >
                  Platforms
                </button>
              )}
              {company?.showAbout !== false && (
                <button
                  onClick={() => goToSection('why')}
                  className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-lamplight-accent"
                >
                  Why
                </button>
              )}
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-lamplight-accent"
              >
                About
              </Link>
              {company?.showContact !== false && (
                <button
                  onClick={() => goToSection('contact')}
                  className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-lamplight-accent"
                >
                  Contact
                </button>
              )}
              {isAuthenticated && (
                <>
                  <Button
                    onClick={onAdminClick}
                    className="bg-lamplight-accent text-white hover:bg-blue-600 mx-3"
                    size="sm"
                    data-testid="button-admin-mobile"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="mx-3"
                    size="sm"
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
