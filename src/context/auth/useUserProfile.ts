
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "./types";
import { toast } from "sonner";

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const handleUserProfile = async (userId: string, userData?: any) => {
    try {
      console.log("Handling user profile for ID:", userId);
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('id, username, email, full_name, avatar_url, bio, sport, disciplines, onboarding_completed')
        .eq('id', userId)
        .maybeSingle();
        
      if (fetchError && !fetchError.message.includes('No rows found')) {
        console.error("Error fetching user profile:", fetchError);
        return null;
      }
      
      if (existingProfile) {
        console.log("Found existing user profile:", existingProfile);
        setProfile(existingProfile as UserProfile);
        return existingProfile;
      }
      
      console.log("No profile found, creating one with metadata:", userData);
      
      if (userData) {
        const username = userData.username || userData.email?.split('@')[0] || `user_${Date.now()}`;
        const fullName = userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        const email = userData.email || null;
        
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            username: username,
            email: email,
            full_name: fullName || null,
          })
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating user profile:", insertError);
          return null;
        }
        
        console.log("Created new user profile:", newProfile);
        setProfile(newProfile as UserProfile);
        return newProfile;
      }
      
      return null;
    } catch (error) {
      console.error("Exception handling user profile:", error);
      return null;
    }
  };

  return {
    profile,
    setProfile,
    handleUserProfile
  };
};
