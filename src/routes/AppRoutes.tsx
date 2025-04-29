
import { Route, Routes } from "react-router-dom";
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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected routes */}
      <Route path="/home" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <Home />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/explore" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <Explore />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <Notifications />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/profile/:id" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <Profile />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/profile/edit" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <ProfileEdit />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/donations/history" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <DonationHistory />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/donations/success" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <DonationSuccess />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <Messages />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/messages/:id" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <Messages />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/compose" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <Compose />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <Settings />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute>
          <OnboardingCheck>
            <AdvancedSearch />
          </OnboardingCheck>
        </ProtectedRoute>
      } />
      
      {/* Onboarding routes */}
      <Route path="/onboarding/welcome" element={
        <ProtectedRoute>
          <Welcome />
        </ProtectedRoute>
      } />
      <Route path="/onboarding/profile" element={
        <ProtectedRoute>
          <ProfileInfo />
        </ProtectedRoute>
      } />
      <Route path="/onboarding/interests" element={
        <ProtectedRoute>
          <Interests />
        </ProtectedRoute>
      } />
      <Route path="/onboarding/complete" element={
        <ProtectedRoute>
          <Complete />
        </ProtectedRoute>
      } />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
