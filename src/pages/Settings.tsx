
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  User, 
  Shield, 
  LogOut, 
  ChevronRight,
  Trash2,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PushNotificationToggle from "@/components/PushNotificationToggle";

const Settings = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);
  
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate('/');
    } catch (error: any) {
      toast.error(`Error signing out: ${error.message}`);
    }
  };
  
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <MobileLayout>
      <div className="container max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        {profile && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback>
                    <User size={24} />
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="font-semibold text-lg">{profile.full_name}</h2>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/profile/edit')}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Account</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center">
                <Bell size={18} className="mr-2" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <PushNotificationToggle />
                </div>
                <Button 
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => navigate('/settings/notifications')}
                >
                  <span>Notification Preferences</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center">
                <Shield size={18} className="mr-2" /> Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => navigate('/settings/password')}
                >
                  <span>Change Password</span>
                  <ChevronRight size={16} />
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => navigate('/settings/privacy')}
                >
                  <span>Privacy Settings</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center">
                <HelpCircle size={18} className="mr-2" /> Help & Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => window.open('https://support.example.com', '_blank')}
                >
                  <span>Help Center</span>
                  <ChevronRight size={16} />
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => navigate('/contact')}
                >
                  <span>Contact Us</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="pt-4 space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => navigate('/settings/delete-account')}
            >
              <Trash2 size={16} className="mr-2" /> Delete Account
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Settings;
