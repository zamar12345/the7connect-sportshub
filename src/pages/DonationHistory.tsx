
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { History, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Define type for donation data
type Donation = {
  id: string;
  amount: number;
  message?: string;
  created_at: string;
  status: string;
  stripe_session_id?: string;
  donor_id?: string;
  donor_username?: string;
  donor_name?: string;
  donor_avatar?: string;
  recipient_id?: string;
  recipient_username?: string;
  recipient_name?: string;
  recipient_avatar?: string;
};

const DonationHistory = () => {
  const { user } = useAuth();
  const [sentDonations, setSentDonations] = useState<Donation[]>([]);
  const [receivedDonations, setReceivedDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch donations sent by the current user
        const { data: sent, error: sentError } = await supabase
          .from('donations_history')
          .select('*')
          .eq('donor_id', user.id)
          .order('created_at', { ascending: false });
          
        if (sentError) throw sentError;
        
        // Fetch donations received by the current user
        const { data: received, error: receivedError } = await supabase
          .from('donations_history')
          .select('*')
          .eq('recipient_id', user.id)
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
  }, [user]);

  // Format donation amount as USD
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-500";
      case 'pending':
        return "bg-yellow-500";
      case 'cancelled':
      case 'expired':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Function to get user display name
  const getDisplayName = (username?: string, fullName?: string) => {
    if (fullName) return fullName;
    if (username) return `@${username}`;
    return "Unknown User";
  };

  // Render donation card
  const renderDonationCard = (donation: Donation, isSent: boolean) => {
    const otherParty = isSent
      ? {
          id: donation.recipient_id,
          name: getDisplayName(donation.recipient_username, donation.recipient_name),
          avatar: donation.recipient_avatar,
        }
      : {
          id: donation.donor_id,
          name: getDisplayName(donation.donor_username, donation.donor_name),
          avatar: donation.donor_avatar,
        };

    return (
      <Card key={donation.id} className="mb-4">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {otherParty.avatar ? (
                <AvatarImage src={otherParty.avatar} alt={otherParty.name} />
              ) : (
                <AvatarFallback>{otherParty.name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-base">{otherParty.name}</CardTitle>
              <CardDescription className="text-xs">
                {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getStatusColor(donation.status)} text-white`}>
            {donation.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-primary">{formatAmount(donation.amount)}</p>
              {donation.message && <p className="mt-2 text-sm">{donation.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center space-x-2 mb-6">
        <History size={24} className="text-primary" />
        <h1 className="text-2xl font-bold">Donation History</h1>
      </div>
      
      <Tabs defaultValue="sent">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent">Donations Sent</TabsTrigger>
          <TabsTrigger value="received">Donations Received</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sent" className="pt-4">
          {sentDonations.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-muted/20">
              <DollarSign size={48} className="mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No donations sent yet</h3>
              <p className="text-muted-foreground">When you support other athletes, your donations will appear here.</p>
            </div>
          ) : (
            sentDonations.map(donation => renderDonationCard(donation, true))
          )}
        </TabsContent>
        
        <TabsContent value="received" className="pt-4">
          {receivedDonations.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-muted/20">
              <DollarSign size={48} className="mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No donations received yet</h3>
              <p className="text-muted-foreground">When others support you, their donations will appear here.</p>
            </div>
          ) : (
            receivedDonations.map(donation => renderDonationCard(donation, false))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonationHistory;
