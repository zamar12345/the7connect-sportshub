
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; 

const DonateButton = ({ recipientId, recipientName }: { recipientId: string; recipientName: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDonate = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to donate");
        window.location.href = "/auth";
        return;
      }
      
      // For now, we'll simulate the payment flow until we set up Stripe
      toast.info(`Processing donation for ${recipientName}...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to success page
      window.location.href = "/donation-success";
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Could not process donation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDonate}
      disabled={isLoading}
      className="bg-sport-orange hover:bg-sport-orange/90 rounded-full"
    >
      <CreditCard size={16} className="mr-1" />
      {isLoading ? "Processing..." : "Donate"}
    </Button>
  );
};

export default DonateButton;
