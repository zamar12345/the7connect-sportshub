
import { useState, useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthProvider";
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

// Import components
import ProtectedRoute from "@/components/ProtectedRoute";
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
      element: <Home />,
    },
    {
      path: "/explore",
      element: <Explore />,
    },
    {
      path: "/notifications",
      element: <Notifications />,
    },
    {
      path: "/messages",
      element: <ProtectedRoute><Messages /></ProtectedRoute>,
    },
    {
      path: "/profile",
      element: <ProtectedRoute><Profile /></ProtectedRoute>,
    },
    {
      path: "/profile/:id",
      element: <Profile />,
    },
    {
      path: "/compose",
      element: <ProtectedRoute><Compose /></ProtectedRoute>,
    },
    {
      path: "/donation-history",
      element: <ProtectedRoute><DonationHistory /></ProtectedRoute>,
    },
    {
      path: "/auth",
      element: <Auth />,
    },
    {
      path: "/donation-success",
      element: <DonationSuccess />
    }
  ]);

  return (
    <ThemeProvider defaultTheme={theme} storageKey="theme">
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
