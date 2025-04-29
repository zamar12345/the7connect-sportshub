import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { User } from "@/types/supabase";

// Add other necessary imports based on your implementation

const Profile = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // If no ID is provided, use the current user's ID
        const profileId = id || user?.id;
        
        if (!profileId) {
          setError("No profile ID provided");
          return;
        }
        
        // Only attempt to fetch with UUID format - check if ID is username or UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
        
        let query;
        
        if (isUUID) {
          // Query by ID if it's a UUID
          query = supabase
            .from("users")
            .select("*")
            .eq("id", profileId);
        } else {
          // Query by username if it's not a UUID
          query = supabase
            .from("users")
            .select("*")
            .eq("username", profileId);
        }
        
        const { data, error } = await query.single();
        
        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, user?.id]);

  // Return your profile UI component here
  // Using the profile, loading, and error state
  
  return (
    <div>
      {/* Profile content goes here */}
      {loading && <p>Loading profile...</p>}
      {error && <p>Error: {error}</p>}
      {profile && (
        <div>
          <h1>{profile.username}</h1>
          {/* Other profile information */}
        </div>
      )}
    </div>
  );
};

export default Profile;
