
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
import { History, DollarSign, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Donation } from "@/types/supabase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DonationHistory = () => {
  const { user } = useAuth();
  const [sentDonations, setSentDonations] = useState<Donation[]>([]);
  const [receivedDonations, setReceivedDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState<"cards" | "table">("cards");

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

  // Format date nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
              <CardTitle className="text-base">
                {otherParty.id ? (
                  <Link to={`/profile/${otherParty.id}`} className="hover:underline flex items-center">
                    {otherParty.name}
                    <ExternalLink size={14} className="ml-1 inline" />
                  </Link>
                ) : (
                  otherParty.name
                )}
              </CardTitle>
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
              {donation.message && <p className="mt-2 text-sm italic">"{donation.message}"</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render donation table
  const renderDonationTable = (donations: Donation[], isSent: boolean) => {
    return (
      <Table>
        <TableCaption>{isSent ? 'Your sent donations' : 'Your received donations'}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{isSent ? 'Recipient' : 'Donor'}</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.map(donation => {
            const person = isSent
              ? {
                  id: donation.recipient_id,
                  name: getDisplayName(donation.recipient_username, donation.recipient_name)
                }
              : {
                  id: donation.donor_id,
                  name: getDisplayName(donation.donor_username, donation.donor_name)
                };
                
            return (
              <TableRow key={donation.id}>
                <TableCell>
                  {person.id ? (
                    <Link to={`/profile/${person.id}`} className="hover:underline flex items-center">
                      {person.name}
                      <ExternalLink size={14} className="ml-1 inline" />
                    </Link>
                  ) : (
                    person.name
                  )}
                </TableCell>
                <TableCell className="font-medium">{formatAmount(donation.amount)}</TableCell>
                <TableCell>{formatDate(donation.created_at)}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(donation.status)} text-white`}>
                    {donation.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {donation.message || '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <History size={24} className="text-primary" />
          <h1 className="text-2xl font-bold">Donation History</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={viewType === "cards" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewType("cards")}
          >
            Cards
          </Button>
          <Button 
            variant={viewType === "table" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewType("table")}
          >
            Table
          </Button>
        </div>
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
            viewType === "cards" 
              ? sentDonations.map(donation => renderDonationCard(donation, true))
              : renderDonationTable(sentDonations, true)
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
            viewType === "cards" 
              ? receivedDonations.map(donation => renderDonationCard(donation, false))
              : renderDonationTable(receivedDonations, false)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonationHistory;
