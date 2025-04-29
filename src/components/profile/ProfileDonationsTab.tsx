
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { Donation } from "@/types/supabase";

const ProfileDonationsTab = ({ userId }: { userId: string }) => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('donations_history')
          .select('*');
          
        if (isOwnProfile) {
          // Show both received and sent donations for own profile
          query = query.or(`recipient_id.eq.${userId},donor_id.eq.${userId}`);
        } else {
          // Only show received donations for other users' profiles
          query = query.eq('recipient_id', userId);
        }
        
        const { data, error } = await query
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching donations:', error);
          setLoading(false);
          return;
        }
        
        if (data) {
          setDonations(data as Donation[]);
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDonations();
    }
  }, [userId, isOwnProfile]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No donations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <div key={donation.id} className="border border-border rounded-lg p-4">
          {isOwnProfile && (
            <p className="text-sm text-muted-foreground mb-1">
              {donation.recipient_id === userId ? 'Received from' : 'Sent to'}: 
              <span className="font-medium ml-1">
                {donation.recipient_id === userId 
                  ? donation.donor_name || donation.donor_username || 'Anonymous' 
                  : donation.recipient_name || donation.recipient_username || 'Someone'}
              </span>
            </p>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">{formatAmount(donation.amount)}</span>
            <span className="text-sm text-muted-foreground">{formatDate(donation.created_at)}</span>
          </div>
          
          {donation.message && (
            <p className="mt-2 text-sm italic">"{donation.message}"</p>
          )}
          
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              donation.status === 'completed' ? 'bg-green-100 text-green-800' : 
              donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileDonationsTab;
