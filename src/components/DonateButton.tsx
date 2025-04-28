
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DonateButton = ({ recipientId, recipientName }: { recipientId: string; recipientName: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(5);
  const [message, setMessage] = useState("");

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

      // Convert amount to cents for Stripe
      const amountInCents = Math.round(amount * 100);
      
      // Call our Edge Function to create a Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { recipientId, amount: amountInCents }
      });
      
      if (error) throw new Error(error.message);
      
      if (data?.url) {
        // Redirect to Stripe Checkout page
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error("Could not process donation. Please try again.");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const predefinedAmounts = [5, 10, 20, 50, 100];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-sport-orange hover:bg-sport-orange/90 rounded-full"
        >
          <CreditCard size={16} className="mr-1" /> Donate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Support {recipientName}</DialogTitle>
          <DialogDescription>
            Support {recipientName} by making a one-time donation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="amount">Donation Amount (USD)</Label>
            <div className="grid grid-cols-5 gap-2 mt-2 mb-3">
              {predefinedAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? "default" : "outline"}
                  onClick={() => setAmount(preset)}
                  className="text-center"
                >
                  ${preset}
                </Button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="pl-7"
                min={1}
                step={1}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="mt-2"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleDonate}
            disabled={isLoading || amount <= 0}
            className="bg-sport-orange hover:bg-sport-orange/90"
          >
            {isLoading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DonateButton;
