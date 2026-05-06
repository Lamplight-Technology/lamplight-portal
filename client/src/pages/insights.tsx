import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Company } from "@shared/schema";

export default function InsightsPage() {
  const [, setShowAdmin] = useState(false);

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/company"],
  });

  const { data: authData } = useQuery<{ user: any | null }>({
    queryKey: ["/api/user"],
  });

  const { data: adminData } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/user/is-admin"],
    enabled: authData?.user !== null && authData?.user !== undefined,
  });

  const isAuthenticated = authData?.user !== null && authData?.user !== undefined;
  const isAdmin = adminData?.isAdmin === true;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation
        onAdminClick={() => setShowAdmin(true)}
        company={company}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
      />

      <main>
        {/* Hero */}
        <section
          className="relative text-white py-24 md:py-32 overflow-hidden"
          style={{
            background: `linear-gradient(to bottom right, ${
              company?.heroBackgroundGradientFrom || "#0f172a"
            }, ${company?.heroBackgroundGradientVia || "#1e3a8a"}, ${
              company?.heroBackgroundGradientTo || "#312e81"
            })`,
          }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI4YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAzMmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 bg-blue-500"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 bg-purple-500"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-200 font-medium">Insights</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light max-w-3xl mx-auto italic">
              Coming soon.
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50 relative">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-lg text-slate-600 leading-relaxed">
            <p>
              We're putting together a small library of writing about how we think about AI
              adoption, building SaaS with integrity, and what we've learned operating multi-tenant
              platforms. If there's a topic you'd want us to cover, let us know.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-lamplight-primary mb-6">
              Have a topic in mind?
            </h3>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              We're shaping this slowly. If there's something you'd want us to cover, send a note.
            </p>
            <div className="flex justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300"
                size="lg"
                data-testid="button-insights-contact"
              >
                <Link href="/contact">
                  Suggest a topic
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer company={company} />
    </div>
  );
}
