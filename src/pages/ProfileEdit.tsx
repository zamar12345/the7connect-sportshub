
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import MobileLayout from "@/components/layout/MobileLayout";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileEditor from "@/components/ProfileEditor";
import { toast } from "sonner";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  const handleClose = () => {
    navigate(-1);
  };

  return (
    <MobileLayout>
      <div className="border-b border-border p-4 sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="font-semibold ml-2">Edit Profile</h1>
          </div>
          
          <div>
            {/* Right side empty for balance */}
          </div>
        </div>
      </div>
      
      <div className="container max-w-md mx-auto">
        <ProfileEditor onClose={handleClose} />
      </div>
    </MobileLayout>
  );
};

export default ProfileEdit;
