import React, { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import History from "@/pages/History";
import Account from "@/pages/Account";
import Help from "@/pages/Help";
import { useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Add logging
  console.log("ProtectedRoute - auth state:", { isAuthenticated, loading });

  // Add a timeout to prevent indefinite loading state
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (loading) {
      console.log("Checking auth status...");
      timeout = setTimeout(() => {
        console.log("Auth check timeout reached, forcing loading to false");
        // Note: We can't directly modify the loading state here,
        // but this will trigger a redirect if still not authenticated
        if (!isAuthenticated) {
          console.log("Not authenticated after timeout, redirecting to login");
          setLocation("/login");
        }
      }, 5000); // 5 second timeout
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [loading, isAuthenticated, setLocation]);
  
  // Handle redirection to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      console.log("User not authenticated");
      console.log("Auth check complete, setting loading to false");
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  // Show loading spinner
  if (loading) {
    console.log("Rendering loading spinner");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="ml-2 text-gray-500">Loading...</p>
      </div>
    );
  }

  // Return null when not authenticated (the redirect effect will handle navigation)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render the protected component
  console.log("Rendering protected component");
  return <Component {...rest} />;
}

function Router() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Log router state for debugging
  console.log("Router state:", { isAuthenticated, loading });
  
  // When on login page, redirect to dashboard if already authenticated
  useEffect(() => {
    const pathname = window.location.pathname;
    if (isAuthenticated && !loading && pathname === "/login") {
      console.log("Router - Redirecting from login to dashboard (already authenticated)");
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);
  
  // If still loading auth state, show a simple loading spinner
  if (loading) {
    console.log("Router - auth state loading");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="ml-2 text-gray-500">Loading application...</p>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <AppLayout>
          <ProtectedRoute component={Dashboard} />
        </AppLayout>
      </Route>
      
      <Route path="/settings">
        <AppLayout>
          <ProtectedRoute component={Settings} />
        </AppLayout>
      </Route>
      
      <Route path="/history">
        <AppLayout>
          <ProtectedRoute component={History} />
        </AppLayout>
      </Route>
      
      <Route path="/account">
        <AppLayout>
          <ProtectedRoute component={Account} />
        </AppLayout>
      </Route>
      
      <Route path="/help">
        <AppLayout>
          <ProtectedRoute component={Help} />
        </AppLayout>
      </Route>
      
      <Route>
        <AppLayout>
          <NotFound />
        </AppLayout>
      </Route>
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
