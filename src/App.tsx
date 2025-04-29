
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingCheck from "@/components/OnboardingCheck";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import DonationHistory from "@/pages/DonationHistory";
import DonationSuccess from "@/pages/DonationSuccess";
import Messages from "@/pages/Messages";
import Welcome from "@/pages/onboarding/Welcome";
import ProfileInfo from "@/pages/onboarding/Profile";
import Interests from "@/pages/onboarding/Interests";
import Complete from "@/pages/onboarding/Complete";
import Compose from "@/pages/Compose";
import Settings from "@/pages/Settings";
import AdvancedSearch from "@/pages/AdvancedSearch";
import ProfileEdit from "@/pages/ProfileEdit";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/context/QueryProvider";
import { AuthProvider } from "@/context/AuthProvider";

import "./App.css";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<OnboardingCheck><Home /></OnboardingCheck>} />
        <Route path="/explore" element={<OnboardingCheck><Explore /></OnboardingCheck>} />
        <Route path="/notifications" element={<OnboardingCheck><Notifications /></OnboardingCheck>} />
        <Route path="/profile/:id" element={<OnboardingCheck><Profile /></OnboardingCheck>} />
        <Route path="/profile/edit" element={<OnboardingCheck><ProfileEdit /></OnboardingCheck>} />
        <Route path="/donations/history" element={<OnboardingCheck><DonationHistory /></OnboardingCheck>} />
        <Route path="/donations/success" element={<OnboardingCheck><DonationSuccess /></OnboardingCheck>} />
        <Route path="/messages" element={<OnboardingCheck><Messages /></OnboardingCheck>} />
        <Route path="/messages/:id" element={<OnboardingCheck><Messages /></OnboardingCheck>} />
        <Route path="/compose" element={<OnboardingCheck><Compose /></OnboardingCheck>} />
        <Route path="/settings" element={<OnboardingCheck><Settings /></OnboardingCheck>} />
        <Route path="/search" element={<OnboardingCheck><AdvancedSearch /></OnboardingCheck>} />
        
        {/* Onboarding routes */}
        <Route path="/onboarding/welcome" element={<Welcome />} />
        <Route path="/onboarding/profile" element={<ProfileInfo />} />
        <Route path="/onboarding/interests" element={<Interests />} />
        <Route path="/onboarding/complete" element={<Complete />} />
      </Route>
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="the7connect-theme">
        <QueryProvider>
          <AuthProvider>
            <AppRoutes />
            <Toaster position="bottom-center" />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
