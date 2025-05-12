
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Donation } from "@/types/supabase";

interface UseDonationHistoryResult {
  sentDonations: Donation[];
  receivedDonations: Donation[];
  isLoading: boolean;
}

export const useDonationHistory = (userId?: string): UseDonationHistoryResult => {
  const [sentDonations, setSentDonations] = useState<Donation[]>([]);
  const [receivedDonations, setReceivedDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch donations sent by the current user
        const { data: sent, error: sentError } = await supabase
          .from('donations_history')
          .select('*')
          .eq('donor_id', userId)
          .order('created_at', { ascending: false });
          
        if (sentError) throw sentError;
        
        // Fetch donations received by the current user
        const { data: received, error: receivedError } = await supabase
          .from('donations_history')
          .select('*')
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false });
          
        if (receivedError) throw receivedError;
        
        setSentDonations(sent || []);
        setReceivedDonations(received || []);
      } catch (error: any) {
        console.error('Error fetching donations:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDonations();
  }, [userId]);

  return { sentDonations, receivedDonations, isLoading };
};
