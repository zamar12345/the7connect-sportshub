
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CreditCard, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Donation = {
  id: string;
  amount: number;
  message: string | null;
  created_at: string;
  status: string;
  recipient_username: string;
  recipient_name: string;
  recipient_avatar: string | null;
  donor_username: string;
  donor_name: string;
  donor_avatar: string | null;
};

const DonationHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sent");
  const [donations, setDonations] = useState<Donation[]>([]);
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    const fetchDonations = async () => {
      try {
        setLoading(true);
        
        const field = activeTab === "sent" ? "donor_id" : "recipient_id";
        
        const { data, error } = await supabase
          .from("donations_history")
          .select("*")
          .eq(field, user.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        setDonations(data || []);
      } catch (error: any) {
        console.error("Error fetching donations:", error);
        toast.error(`Error loading donations: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonations();
  }, [user, activeTab, navigate]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "expired":
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-muted-foreground bg-muted/50";
    }
  };
  
  return (
    <MobileLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-bold">Donation History</h1>
        </div>
        
        <Tabs defaultValue="sent" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="sent" className="flex-1">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Your Donations to Others</h2>
              
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : donations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-2" />
                  <p>You haven't made any donations yet.</p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate('/')}
                  >
                    Find Athletes to Support
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <Card key={donation.id} className="p-4">
                      <div className="flex items-center mb-2">
                        <Avatar className="h-10 w-10 mr-3">
                          {donation.recipient_avatar ? (
                            <AvatarImage src={donation.recipient_avatar} alt={donation.recipient_name || donation.recipient_username} />
                          ) : (
                            <AvatarFallback>{(donation.recipient_name || donation.recipient_username || "?").charAt(0).toUpperCase()}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{donation.recipient_name || donation.recipient_username}</p>
                          <p className="text-xs text-muted-foreground">@{donation.recipient_username}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${donation.amount}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(donation.status)}`}>
                            {donation.status}
                          </span>
                        </div>
                      </div>
                      
                      {donation.message && (
                        <>
                          <Separator className="my-2" />
                          <p className="text-sm italic">"{donation.message}"</p>
                        </>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(donation.created_at)}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="received" className="flex-1">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Donations Received</h2>
              
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : donations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                  <p>You haven't received any donations yet.</p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate('/profile')}
                  >
                    Complete Your Profile
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <Card className="bg-muted/50 p-4">
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-card rounded">
                          <p className="text-xs text-muted-foreground">Total Received</p>
                          <p className="text-xl font-bold">
                            ${donations.reduce((acc, d) => acc + (d.status === "completed" ? d.amount : 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 bg-card rounded">
                          <p className="text-xs text-muted-foreground">Supporters</p>
                          <p className="text-xl font-bold">
                            {new Set(donations.map(d => d.donor_id)).size}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supporter</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              {donation.donor_avatar ? (
                                <AvatarImage src={donation.donor_avatar} alt={donation.donor_name || donation.donor_username} />
                              ) : (
                                <AvatarFallback>{(donation.donor_name || donation.donor_username || "?").charAt(0).toUpperCase()}</AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium truncate">{donation.donor_name || donation.donor_username}</p>
                              {donation.message && (
                                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]">"{donation.message}"</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">${donation.amount}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {formatDate(donation.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default DonationHistory;
