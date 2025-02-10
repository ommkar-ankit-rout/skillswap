import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Skills from "@/pages/skills";
import Items from "@/pages/items";
import Profile from "@/pages/profile";
import Chat from "@/pages/chat";
import Notifications from "@/pages/notifications";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

function PrivateRoute({ component: Component, ...rest }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/dashboard" component={(props) => <PrivateRoute component={Dashboard} {...props} />} />
          <Route path="/skills" component={(props) => <PrivateRoute component={Skills} {...props} />} />
          <Route path="/items" component={(props) => <PrivateRoute component={Items} {...props} />} />
          <Route path="/profile" component={(props) => <PrivateRoute component={Profile} {...props} />} />
          <Route path="/chat" component={(props) => <PrivateRoute component={Chat} {...props} />} />
          <Route path="/notifications" component={(props) => <PrivateRoute component={Notifications} {...props} />} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
