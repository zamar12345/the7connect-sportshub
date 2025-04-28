
import React, { useState, useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthProvider";
import { QueryProvider } from "@/context/QueryProvider";
import { Toaster } from "sonner";

// Import all pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import Notifications from "@/pages/Notifications";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import Compose from "@/pages/Compose";
import NotFound from "@/pages/NotFound";
import DonationSuccess from "@/pages/DonationSuccess";
import DonationHistory from "@/pages/DonationHistory";
import Settings from "@/pages/Settings";
import AdvancedSearch from "@/pages/AdvancedSearch";

// Import onboarding pages
import Welcome from "@/pages/onboarding/Welcome";
import ProfileSetup from "@/pages/onboarding/Profile";
import Interests from "@/pages/onboarding/Interests";
import Complete from "@/pages/onboarding/Complete";

// Import components
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingCheck from "@/components/OnboardingCheck";
import "./App.css";

function App() {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | "system" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Define routes
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Index />,
      errorElement: <NotFound />,
    },
    {
      path: "/home",
      element: (
        <OnboardingCheck>
          <Home />
        </OnboardingCheck>
      ),
    },
    {
      path: "/explore",
      element: (
        <OnboardingCheck>
          <Explore />
        </OnboardingCheck>
      ),
    },
    {
      path: "/notifications",
      element: (
        <OnboardingCheck>
          <Notifications />
        </OnboardingCheck>
      ),
    },
    {
      path: "/messages",
      element: (
        <ProtectedRoute>
          <OnboardingCheck>
            <Messages />
          </OnboardingCheck>
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <OnboardingCheck>
            <Profile />
          </OnboardingCheck>
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile/:id",
      element: (
        <OnboardingCheck>
          <Profile />
        </OnboardingCheck>
      ),
    },
    {
      path: "/compose",
      element: (
        <ProtectedRoute>
          <OnboardingCheck>
            <Compose />
          </OnboardingCheck>
        </ProtectedRoute>
      ),
    },
    {
      path: "/donation-history",
      element: (
        <ProtectedRoute>
          <OnboardingCheck>
            <DonationHistory />
          </OnboardingCheck>
        </ProtectedRoute>
      ),
    },
    {
      path: "/settings",
      element: (
        <ProtectedRoute>
          <OnboardingCheck>
            <Settings />
          </OnboardingCheck>
        </ProtectedRoute>
      ),
    },
    {
      path: "/advanced-search",
      element: (
        <OnboardingCheck>
          <AdvancedSearch />
        </OnboardingCheck>
      ),
    },
    {
      path: "/auth",
      element: <Auth />,
    },
    {
      path: "/donation-success",
      element: <DonationSuccess />
    },
    // Onboarding Routes
    {
      path: "/onboarding/welcome",
      element: <ProtectedRoute><Welcome /></ProtectedRoute>,
    },
    {
      path: "/onboarding/profile",
      element: <ProtectedRoute><ProfileSetup /></ProtectedRoute>,
    },
    {
      path: "/onboarding/interests",
      element: <ProtectedRoute><Interests /></ProtectedRoute>,
    },
    {
      path: "/onboarding/complete",
      element: <ProtectedRoute><Complete /></ProtectedRoute>,
    }
  ]);

  return (
    <ThemeProvider defaultTheme={theme} storageKey="theme">
      <QueryProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-center" />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
