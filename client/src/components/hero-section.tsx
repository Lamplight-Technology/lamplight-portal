import { Button } from "@/components/ui/button";
import { Rocket, Info, Sparkles, Zap } from "lucide-react";
import type { Company } from "@shared/schema";

interface HeroSectionProps {
  company?: Company;
}

export default function HeroSection({ company }: HeroSectionProps) {
  const scrollToPlatforms = () => {
    const element = document.getElementById('platforms');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI4YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAzMmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {company?.heroBadge && (
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-200 font-medium">{company.heroBadge}</span>
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              {company?.heroTitle || "Empowering Business Through Software Innovation"}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-4xl mx-auto leading-relaxed font-light">
            {company?.heroDescription || "Lamplight Technology specializes in cutting-edge SaaS platforms that transform how customers and businesses operate, scale, and succeed in the digital economy."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {company?.showPlatforms !== false && (
              <Button 
                onClick={scrollToPlatforms}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 group"
                size="lg"
              >
                <Rocket className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Explore Our Platforms
              </Button>
            )}
            {company?.showAbout !== false && (
              <Button 
                onClick={scrollToAbout}
                variant="outline" 
                className="border-2 border-blue-300/50 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-6 text-lg transition-all duration-300 group"
                size="lg"
              >
                <Info className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Learn More
              </Button>
            )}
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-12 text-blue-200/80">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-sm">Fast & Reliable</span>
            </div>
            <div className="h-4 w-px bg-blue-400/30"></div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm">Enterprise Security</span>
            </div>
            <div className="h-4 w-px bg-blue-400/30 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="text-sm">AI-Powered</span>
            </div>
          </div>
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
