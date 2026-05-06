import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import LegalDocumentPage from "@/pages/legal-document";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Anchor-section deep links — render Home; the page reads the path and scrolls to the matching section */}
      <Route path="/about" component={Home} />
      <Route path="/platforms" component={Home} />
      <Route path="/contact" component={Home} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/legal/:type" component={LegalDocumentPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
