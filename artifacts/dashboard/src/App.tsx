import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Shell } from "@/components/layout/Shell";

import { Dashboard } from "@/pages/Dashboard";
import { Businesses } from "@/pages/Businesses";
import { BusinessDetail } from "@/pages/BusinessDetail";
import { CreateBusiness } from "@/pages/CreateBusiness";
import { Packages } from "@/pages/Packages";
import { Calls } from "@/pages/Calls";
import { Settings } from "@/pages/Settings";
import { ClientPortal } from "@/pages/ClientPortal";

const queryClient = new QueryClient();

function AdminRouter() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/businesses" component={Businesses} />
        <Route path="/businesses/new" component={CreateBusiness} />
        <Route path="/businesses/:id" component={BusinessDetail} />
        <Route path="/packages" component={Packages} />
        <Route path="/calls" component={Calls} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/client/:id" component={ClientPortal} />
      <Route component={AdminRouter} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
