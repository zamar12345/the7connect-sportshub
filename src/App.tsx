
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
        <Route element={<OnboardingCheck>
          <Home />
        </OnboardingCheck>} path="/home" />
        <Route element={<OnboardingCheck>
          <Explore />
        </OnboardingCheck>} path="/explore" />
        <Route element={<OnboardingCheck>
          <Notifications />
        </OnboardingCheck>} path="/notifications" />
        <Route element={<OnboardingCheck>
          <Profile />
        </OnboardingCheck>} path="/profile/:id" />
        <Route element={<OnboardingCheck>
          <ProfileEdit />
        </OnboardingCheck>} path="/profile/edit" />
        <Route element={<OnboardingCheck>
          <DonationHistory />
        </OnboardingCheck>} path="/donations/history" />
        <Route element={<OnboardingCheck>
          <DonationSuccess />
        </OnboardingCheck>} path="/donations/success" />
        <Route element={<OnboardingCheck>
          <Messages />
        </OnboardingCheck>} path="/messages" />
        <Route element={<OnboardingCheck>
          <Messages />
        </OnboardingCheck>} path="/messages/:id" />
        <Route element={<OnboardingCheck>
          <Compose />
        </OnboardingCheck>} path="/compose" />
        <Route element={<OnboardingCheck>
          <Settings />
        </OnboardingCheck>} path="/settings" />
        <Route element={<OnboardingCheck>
          <AdvancedSearch />
        </OnboardingCheck>} path="/search" />
        
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
