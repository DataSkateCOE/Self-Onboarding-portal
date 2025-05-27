import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import MsalAuthProvider from "@/components/MsalAuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NewOnboarding from "@/pages/NewOnboarding";
import PendingApprovals from "@/pages/PendingApprovals";
import CompletedApprovals from "@/pages/CompletedApprovals";
import Partners from "@/pages/Partners";
import Documents from "@/pages/Documents";
import CertificateManagement from "@/pages/CertificateManagement";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  
  // Check if the current route is public (doesn't require authentication)
  const isPublicRoute = ["/", "/login"].includes(location);
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      
      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/new-onboarding">
        <ProtectedRoute>
          <NewOnboarding />
        </ProtectedRoute>
      </Route>
      <Route path="/pending-approvals">
        <ProtectedRoute>
          <PendingApprovals />
        </ProtectedRoute>
      </Route>
      <Route path="/completed-approvals">
        <ProtectedRoute>
          <CompletedApprovals />
        </ProtectedRoute>
      </Route>
      <Route path="/partners">
        <ProtectedRoute>
          <Partners />
        </ProtectedRoute>
      </Route>
      <Route path="/documents">
        <ProtectedRoute>
          <Documents />
        </ProtectedRoute>
      </Route>
      <Route path="/certificates">
        <ProtectedRoute>
          <CertificateManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Check if the current route is public (doesn't require authentication)
  const isPublicRoute = ["/", "/login"].includes(location);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="partner-portal-theme">
        <TooltipProvider>
          <MsalAuthProvider>
            <Toaster />
            {isPublicRoute ? (
              <Router />
            ) : (
              <MainLayout>
                <Router />
              </MainLayout>
            )}
          </MsalAuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
