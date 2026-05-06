import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Cpu,
  HeartHandshake,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { Company } from "@shared/schema";

export default function AboutPage() {
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
              <span className="text-sm text-blue-200 font-medium">
                About Lamplight
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              We build software{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                that serves
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light max-w-3xl mx-auto">
              Not the other way around.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-blue-600 mb-2 tracking-wide uppercase">
                  What We Do
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-lamplight-primary mb-4">
                  A SaaS holding company
                </h2>
              </div>
            </div>
            <div className="space-y-5 text-lg text-slate-600 leading-relaxed pl-0 md:pl-20">
              <p>
                Lamplight Technology Holdings builds and operates software
                platforms across verticals, invests in purpose-aligned software
                businesses, and consults with organizations adopting AI and
                automation.
              </p>
              <p>
                Our first platform, <strong>AnchorPoint</strong>, brings modern
                camp management to faith-based camps and youth organizations.
                Several other platforms — across lawn care, restaurants,
                property management, automotive repair, accounting, and career
                services — are in active development.
              </p>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-20 md:py-28 bg-slate-50 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Cpu className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-blue-600 mb-2 tracking-wide uppercase">
                  How We Work
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-lamplight-primary mb-4">
                  Engineering with intent
                </h2>
              </div>
            </div>
            <div className="space-y-5 text-lg text-slate-600 leading-relaxed pl-0 md:pl-20">
              <p>
                We specialize in AI-enabled workflow design — automation,
                copilots, and agent-assisted operations — alongside systems
                integration and product-led transformation.
              </p>
              <p>
                Our engineering approach favors thoughtful defaults, honest
                trade-offs, and building for the long term over shipping fast
                at any cost. We&apos;d rather ship one feature we&apos;re proud
                of than five we have to apologize for.
              </p>
            </div>
          </div>
        </section>

        {/* Our Why — explicit values / faith */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI4YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAzMmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

          <div className="absolute top-10 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 bg-blue-500"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 bg-purple-500"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <HeartHandshake className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-blue-300 mb-2 tracking-wide uppercase">
                  Our Why
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why we build the way we do
                </h2>
              </div>
            </div>
            <div className="space-y-5 text-lg text-blue-100 leading-relaxed pl-0 md:pl-20">
              <p>
                Our team shares a Christian faith that shapes how we
                operate — with integrity, humility, and a long-term view of
                the people our software serves. It&apos;s why we won&apos;t
                ship things we can&apos;t stand behind, why we treat customers
                and team members with respect regardless of background, and
                why we believe business done well is a form of service.
              </p>
              <p className="text-xl md:text-2xl font-light italic text-white border-l-4 border-amber-400 pl-6 my-8">
                We build for clients of every background. Our faith shapes our
                character, not our customer list.
              </p>
              <p>
                Practically, that means we sweat the small stuff: clear
                communication, honest pricing, software that does what it
                says, and the discipline to walk away from work that
                doesn&apos;t fit. If you&apos;re evaluating us, that&apos;s
                what you should expect.
              </p>
            </div>
          </div>
        </section>

        {/* CTA back to platforms / contact */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-lamplight-primary mb-6">
              Ready to talk?
            </h3>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              Whether you want to see a platform, explore a partnership, or
              just understand how we work — we&apos;re happy to start a
              conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300"
                size="lg"
                data-testid="button-about-contact"
              >
                <Link href="/contact">
                  Reach out
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-slate-300 px-8 py-6 text-lg"
                size="lg"
                data-testid="button-about-platforms"
              >
                <Link href="/platforms">See our platforms</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer company={company} />
    </div>
  );
}
