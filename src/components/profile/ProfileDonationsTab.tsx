
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

interface ProfileDonationsTabProps {
  profileId: string;
}

const ProfileDonationsTab = ({ profileId }: ProfileDonationsTabProps) => {
  const { user } = useAuth();
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [receivedDonations, setReceivedDonations] = useState<any[]>([]);

  useEffect(() => {
    fetchDonations(profileId);
  }, [profileId]);

  const fetchDonations = async (userId: string) => {
    try {
      setDonationsLoading(true);
      
      const { data, error } = await supabase
        .from("donations_history")
        .select("*")
        .eq("recipient_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setReceivedDonations(data || []);
    } catch (error: any) {
      console.error("Error fetching donations:", error);
    } finally {
      setDonationsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const totalDonations = receivedDonations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueDonors = new Set(receivedDonations.map(d => d.donor_id));

  return (
    <div className="p-4">
      {donationsLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : receivedDonations.length > 0 ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="bg-card/50 rounded-lg p-4 text-center">
              <div className="text-lg font-semibold">${totalDonations.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Total Received</div>
            </div>
            <div className="bg-card/50 rounded-lg p-4 text-center">
              <div className="text-lg font-semibold">{uniqueDonors.size}</div>
              <div className="text-xs text-muted-foreground">Supporters</div>
            </div>
          </div>
          
          <h3 className="text-sm font-semibold mb-3">Recent Supporters</h3>
          <div className="space-y-3">
            {receivedDonations.slice(0, 5).map((donation) => (
              <div key={donation.id} className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  {donation.donor_avatar ? (
                    <AvatarImage src={donation.donor_avatar} alt={donation.donor_name || ""} />
                  ) : (
                    <AvatarFallback>{(donation.donor_name || "?").charAt(0).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{donation.donor_name || donation.donor_username}</p>
                  {donation.message && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">"{donation.message}"</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold">${donation.amount}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(donation.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
          
          {receivedDonations.length > 5 && (
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/donation-history"}
              >
                View All Donations
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CreditCard size={40} className="text-muted mb-2" />
          <p className="text-muted-foreground">No donations received yet</p>
          {user && user.id === profileId && (
            <p className="text-sm text-muted-foreground mt-2">
              Complete your profile to attract supporters.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDonationsTab;
