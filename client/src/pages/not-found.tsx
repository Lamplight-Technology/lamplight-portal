import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white px-4">
      <div className="max-w-xl w-full text-center">
        <div className="text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          We couldn&apos;t find that page
        </h1>
        <p className="text-lg text-blue-100 mb-8 leading-relaxed">
          The link may be broken, or the page may have moved. Let&apos;s get you
          back to something useful.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300"
            size="lg"
            data-testid="button-404-home"
          >
            <a href="/">
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-2 border-blue-300/50 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-6 text-lg transition-all duration-300"
            size="lg"
            data-testid="button-404-platforms"
          >
            <a href="/platforms">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Explore Platforms
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
