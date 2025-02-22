import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import AppRouter from "./AppRouter";
import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <AppRouter />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

//AppRouter.tsx
import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import CreateListingPage from "@/pages/create-listing-page";
import CategoryPage from "@/pages/category-page";
import BrowseRepairsPage from "@/pages/browse-repairs";
import { ProtectedRoute } from "./lib/protected-route";
import Navbar from "@/components/navbar";

function AppRouter() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/browse" component={BrowseRepairsPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/create-listing" component={CreateListingPage} />
        <Route path="/category/:category" component={CategoryPage} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default AppRouter;