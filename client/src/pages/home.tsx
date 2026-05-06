import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import PlatformCard from "@/components/platform-card";
import AdminPanel from "@/components/admin-panel";
import AccessDenied from "@/components/access-denied";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { ChartLine, Shield, Users } from "lucide-react";
import type { Company, Platform, AboutFeatureCard, HeroBadge } from "@shared/schema";

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);

  const { data: company, isLoading: companyLoading } = useQuery<Company>({
    queryKey: ["/api/company"],
  });

  const { data: platforms = [], isLoading: platformsLoading } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });

  const { data: featureCards = [], isLoading: featureCardsLoading } = useQuery<AboutFeatureCard[]>({
    queryKey: ["/api/about-feature-cards"],
  });

  const { data: authData, isLoading: authLoading } = useQuery<{ user: any | null }>({
    queryKey: ["/api/user"],
  });

  const { data: adminData, isLoading: adminLoading } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/user/is-admin"],
    enabled: authData?.user !== null && authData?.user !== undefined,
  });

  const isAuthenticated = authData?.user !== null && authData?.user !== undefined;
  const isAdmin = adminData?.isAdmin === true;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  }, []);

  // If the user landed on /about, /platforms, or /contact directly, scroll to the matching section
  // once the page content is loaded. Wait one tick for the anchors to render.
  useEffect(() => {
    if (companyLoading || platformsLoading) return;
    const path = window.location.pathname.replace(/\/$/, "");
    const anchorMap: Record<string, string> = {
      "/about": "about",
      "/platforms": "platforms",
      "/contact": "contact",
    };
    const sectionId = anchorMap[path];
    if (!sectionId) return;
    // RAF gives the layout a frame to settle before measuring scroll positions.
    requestAnimationFrame(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [companyLoading, platformsLoading]);

  useEffect(() => {
    if (!isAuthenticated && showAdmin) {
      setShowAdmin(false);
    }
  }, [isAuthenticated, showAdmin]);

  if (companyLoading || platformsLoading || authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lamplight-accent"></div>
      </div>
    );
  }

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setShowAdmin(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation onAdminClick={handleAdminClick} company={company} isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
      
      <main>
        <HeroSection company={company} />
        
        {company?.showAbout !== false && (
        <>
        {/* Company Overview */}
        <section id="about" className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI4YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAzMmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-60"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block">
                <div className="text-sm font-semibold text-blue-600 mb-3 tracking-wide uppercase">
                  {company?.aboutSectionLabel || "Why Choose Us"}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-lamplight-primary mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {company?.aboutTitle || "Building the Future of Software"}
                </h2>
              </div>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                {company?.aboutDescription}
              </p>
            </div>

            <div className={`grid ${
              company?.aboutCardsLayout === "2-col" ? "md:grid-cols-2" :
              company?.aboutCardsLayout === "4-col" ? "md:grid-cols-2 lg:grid-cols-4" :
              "md:grid-cols-3"
            } gap-8 lg:gap-12`}>
              {featureCards.filter(card => card.isActive).map((card) => {
                const IconComponent = Icons[card.iconName as keyof typeof Icons] || Icons.HelpCircle;
                return (
                  <div key={card.id} className="group relative">
                    <div
                      className="absolute inset-0 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(to bottom right, ${card.gradientFrom}20, ${card.gradientTo}20)`
                      }}
                    ></div>
                    <div
                      className="relative bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border"
                      style={{ borderColor: card.borderColor }}
                    >
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg"
                        style={{
                          background: `linear-gradient(to bottom right, ${card.gradientFrom}, ${card.gradientTo})`,
                          boxShadow: `0 10px 15px -3px ${card.gradientFrom}30`
                        }}
                      >
                        <IconComponent className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-lamplight-primary mb-3">
                        {card.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Values pull-quote — bookends the section beneath the pillar cards */}
            {company?.aboutPullQuote && (
              <div className="mt-16 md:mt-20 flex justify-center">
                <div className="relative max-w-3xl text-center">
                  <div
                    aria-hidden="true"
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-7xl text-blue-200/70 font-serif leading-none select-none"
                  >
                    &ldquo;
                  </div>
                  <p
                    className="relative text-2xl md:text-3xl font-light italic text-slate-700 leading-relaxed px-6"
                    data-testid="text-about-pull-quote"
                  >
                    {company.aboutPullQuote}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        </>
        )}

        {company?.showPlatforms !== false && (
        <>
        {/* Platform Showcase */}
        <section id="platforms" className="py-20 md:py-28 bg-slate-50 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block">
                <div className="text-sm font-semibold text-blue-600 mb-3 tracking-wide uppercase">
                  {company?.platformsSectionLabel || "Our Solutions"}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-lamplight-primary mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {company?.platformsTitle || "Our SaaS Platforms"}
                </h2>
              </div>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">{company?.platformsDescription || "Discover our platforms and services"}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {platforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
          </div>
        </section>
        </>
        )}

        {company?.showContact !== false && (
        <>
        {/* Contact Section */}
        <section id="contact" className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI4YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAzMmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
          
          <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-block">
                <div className="text-sm font-semibold text-blue-400 mb-3 tracking-wide uppercase">
                  {company?.contactSectionLabel || "Let's Connect"}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {company?.contactTitle || "Get in Touch"}
                </h2>
              </div>
              <p className="text-xl text-blue-100 mb-12 leading-relaxed max-w-2xl mx-auto">
                {company?.contactDescription || "Ready to transform your business with our SaaS platforms? Our team is here to help you get started."}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-10 py-6 text-lg shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/60 transition-all duration-300"
                  asChild
                  data-testid="button-contact-us"
                  size="lg"
                >
                  <a href={`mailto:${company?.contactEmail || 'info@example.com'}`}>
                    {company?.contactButtonText || "Contact Us"}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
        </>
        )}
      </main>

      <Footer company={company} />

      {showAdmin && isAuthenticated && (
        <>
          {isAdmin ? (
            <AdminPanel 
              company={company} 
              platforms={platforms} 
              onClose={() => setShowAdmin(false)} 
            />
          ) : (
            <AccessDenied onClose={() => setShowAdmin(false)} />
          )}
        </>
      )}
    </div>
  );
}
