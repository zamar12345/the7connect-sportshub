
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const DonateButton = ({ recipientId, recipientName }: { recipientId: string; recipientName: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDonate = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { recipientId, amount: 4999 }, // $49.99 in cents
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
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
