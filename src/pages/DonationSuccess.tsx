
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type DonationDetail = {
  amount: number;
  recipient_name: string;
  recipient_username: string;
  recipient_avatar: string | null;
  status: string;
};

const DonationSuccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentDonation, setRecentDonation] = useState<DonationDetail | null>(null);

  useEffect(() => {
    const fetchRecentDonation = async () => {
      try {
        // Get the user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Get the most recent pending or completed donation
        const { data, error } = await supabase
          .from('donations_history')
          .select('amount, recipient_name, recipient_username, recipient_avatar, status')
          .eq('donor_id', user.id)
          .in('status', ['pending', 'completed'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching donation:", error);
          return;
        }

        setRecentDonation(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDonation();
    toast.success("Thank you for your donation!");
  }, [navigate]);

  return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <CheckCircle className="w-16 h-16 text-sport-green mb-4" />
        <h1 className="text-2xl font-bold mb-2">Thank you for your donation!</h1>
        
        {loading ? (
          <div className="animate-pulse w-64 h-20 bg-muted rounded-md"></div>
        ) : recentDonation ? (
          <div className="text-center">
            <p className="text-xl font-bold">${recentDonation.amount}</p>
            <p className="text-muted-foreground">
              to {recentDonation.recipient_name || recentDonation.recipient_username}
            </p>
            <p className="mt-4">Your support makes a difference.</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-center">
            Your support means a lot. Thank you for your generosity.
          </p>
        )}
        
        <div className="flex gap-4 mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Home
          </Button>
          <Button 
            onClick={() => navigate('/donation-history')}
          >
            View Your Donations
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default DonationSuccess;
