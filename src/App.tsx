
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
        <Route path="/home" element={<OnboardingCheck children={<Home />} />} />
        <Route path="/explore" element={<OnboardingCheck children={<Explore />} />} />
        <Route path="/notifications" element={<OnboardingCheck children={<Notifications />} />} />
        <Route path="/profile/:id" element={<OnboardingCheck children={<Profile />} />} />
        <Route path="/profile/edit" element={<OnboardingCheck children={<ProfileEdit />} />} />
        <Route path="/donations/history" element={<OnboardingCheck children={<DonationHistory />} />} />
        <Route path="/donations/success" element={<OnboardingCheck children={<DonationSuccess />} />} />
        <Route path="/messages" element={<OnboardingCheck children={<Messages />} />} />
        <Route path="/messages/:id" element={<OnboardingCheck children={<Messages />} />} />
        <Route path="/compose" element={<OnboardingCheck children={<Compose />} />} />
        <Route path="/settings" element={<OnboardingCheck children={<Settings />} />} />
        <Route path="/search" element={<OnboardingCheck children={<AdvancedSearch />} />} />
        
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
