
import { useState } from "react";
import { useSupabaseQuery } from "./useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types/supabase";

interface ProfileData {
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  sport?: string;
  disciplines?: string[];
}

export function useUserProfile(userId: string | undefined) {
  return useSupabaseQuery<User>(
    ['users', 'profile', userId],
    async () => {
      if (!userId) throw new Error("User ID is required");
      
      // Update to explicitly list the columns we want to fetch, including banner_url
      const { data, error } = await supabase
        .from("users")
        .select("id, username, full_name, avatar_url, banner_url, bio, sport, disciplines")
        .eq("id", userId)
        .single();
        
      if (error) {
        // Check if the error relates to the banner_url column not existing
        if (error.message.includes("column 'banner_url' does not exist")) {
          // Fallback: Let's fetch without banner_url in this case
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("users")
            .select("id, username, full_name, avatar_url, bio, sport, disciplines")
            .eq("id", userId)
            .single();
            
          if (fallbackError) throw fallbackError;
          
          // Return the data with a null banner_url
          return { ...fallbackData, banner_url: null } as User;
        }
        
        throw error;
      }
      
      return data as User;
    },
    {
      enabled: !!userId
    }
  );
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  
  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async ({ file, userId }: { file: File, userId: string }) => {
      setUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `avatars/${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        if (!data) throw new Error("Could not get public URL");
        
        return data.publicUrl;
      } finally {
        setUploading(false);
      }
    }
  });
  
  // Upload banner mutation
  const uploadBannerMutation = useMutation({
    mutationFn: async ({ file, userId }: { file: File, userId: string }) => {
      setUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `banners/${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Make sure the banners bucket exists
        try {
          const { data: bucketExists } = await supabase.storage
            .getBucket('banners');
            
          if (!bucketExists) {
            // Create bucket if it doesn't exist
            await supabase.storage
              .createBucket('banners', { public: true });
          }
        } catch (error) {
          // If error is "bucket not found", we'll create it
          await supabase.storage
            .createBucket('banners', { public: true });
        }
        
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('banners')
          .getPublicUrl(filePath);
          
        if (!data) throw new Error("Could not get public URL");
        
        return data.publicUrl;
      } finally {
        setUploading(false);
      }
    }
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ userId, profile }: { userId: string, profile: ProfileData}) => {
      const { error } = await supabase
        .from("users")
        .update(profile)
        .eq("id", userId);
        
      if (error) throw error;
      return profile;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile', variables.userId] });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error updating profile: ${error.message}`);
    }
  });
  
  return {
    uploadAvatar: uploadAvatarMutation.mutate,
    uploadBanner: uploadBannerMutation.mutate,
    isUploading: uploading,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending
  };
}
