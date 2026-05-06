import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { Rocket, Info, Sparkles, Zap } from "lucide-react";
import type { Company, HeroBadge } from "@shared/schema";
import React from "react";

interface HeroSectionProps {
  company?: Company;
}

export default function HeroSection({ company }: HeroSectionProps) {
  const { data: heroBadges = [] } = useQuery<HeroBadge[]>({
    queryKey: ["/api/hero-badges"],
  });

  const scrollToPlatforms = () => {
    const element = document.getElementById('platforms');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToWhy = () => {
    const element = document.getElementById('why');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="home"
      className="relative text-white py-24 md:py-32 overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, ${company?.heroBackgroundGradientFrom || '#0f172a'}, ${company?.heroBackgroundGradientVia || '#1e3a8a'}, ${company?.heroBackgroundGradientTo || '#312e81'})`
      }}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI4YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAzMmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

      {/* Background Image Overlay */}
      {company?.heroBackgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${company.heroBackgroundImage})`,
            opacity: (company.heroBackgroundImageOpacity ?? 50) / 100
          }}
        ></div>
      )}

      <div
        className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
        style={{ backgroundColor: company?.heroBlobColor1 || '#3b82f6' }}
      ></div>
      <div
        className="absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
        style={{ backgroundColor: company?.heroBlobColor2 || '#a855f7' }}
      ></div>
      <div
        className="absolute -bottom-8 left-1/2 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
        style={{ backgroundColor: company?.heroBlobColor3 || '#6366f1' }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={company?.heroSideImage ? "grid lg:grid-cols-2 gap-12 items-center" : ""}>
          <div className={company?.heroSideImage ? "text-left" : "text-center"}>
            {company?.heroBadge && (
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-200 font-medium">{company.heroBadge}</span>
              </div>
            )}

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {company?.heroTitle || "Empowering Business Through"}{' '}
              {company?.heroTitleHighlight && (
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  {company.heroTitleHighlight}
                </span>
              )}
            </h1>

            <p className={`text-xl md:text-2xl mb-10 text-blue-100 leading-relaxed font-light ${company?.heroSideImage ? "" : "max-w-4xl mx-auto"}`}>
              {company?.heroDescription || "Lamplight Technology specializes in cutting-edge SaaS platforms that transform how customers and businesses operate, scale, and succeed in the digital economy."}
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 ${company?.heroSideImage ? "" : "justify-center"} items-center`}>
              {company?.showPlatforms !== false && (
                <Button
                  onClick={scrollToPlatforms}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 group"
                  size="lg"
                >
                  <Rocket className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  {company?.heroButtonPrimary || "Explore Our Platforms"}
                </Button>
              )}
              {company?.showAbout !== false && (
                <Button
                  onClick={scrollToWhy}
                  variant="outline"
                  className="border-2 border-blue-300/50 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-6 text-lg transition-all duration-300 group"
                  size="lg"
                >
                  <Info className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  {company?.heroButtonSecondary || "Learn More"}
                </Button>
              )}
            </div>
          </div>

          {/* Hero Side Image */}
          {company?.heroSideImage && (
            <div className="hidden lg:block">
              <img
                src={company.heroSideImage}
                alt="Hero illustration"
                className="w-full h-auto max-w-lg mx-auto drop-shadow-2xl"
              />
            </div>
          )}
        </div>

        <div className={`${company?.heroSideImage ? "mt-16" : "mt-16"} flex items-center justify-center gap-12 text-blue-200/80`}>
            {heroBadges.filter(badge => badge.isActive).map((badge, index) => {
              const IconComponent = Icons[badge.iconName as keyof typeof Icons] || Icons.HelpCircle;
              return (
                <React.Fragment key={badge.id}>
                  {index > 0 && <div className="h-4 w-px bg-blue-400/30" />}
                  <div className="flex items-center gap-2">
                    <IconComponent
                      className="h-5 w-5"
                      style={{ color: badge.iconColor }}
                    />
                    <span className="text-sm">{badge.text}</span>
                  </div>
                </React.Fragment>
              );
            })}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
