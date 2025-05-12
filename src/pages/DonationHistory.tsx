
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History } from "lucide-react";
import { useDonationHistory } from "@/hooks/useDonationHistory";
import DonationItem from "@/components/donations/DonationItem";
import DonationTable from "@/components/donations/DonationTable";
import EmptyDonationState from "@/components/donations/EmptyDonationState";
import ViewTypeToggle from "@/components/donations/ViewTypeToggle";

const DonationHistory = () => {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<"cards" | "table">("cards");
  const { sentDonations, receivedDonations, isLoading } = useDonationHistory(user?.id);

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
        <ViewTypeToggle viewType={viewType} onChange={setViewType} />
      </div>
      
      <Tabs defaultValue="sent">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent">Donations Sent</TabsTrigger>
          <TabsTrigger value="received">Donations Received</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sent" className="pt-4">
          {sentDonations.length === 0 ? (
            <EmptyDonationState type="sent" />
          ) : (
            viewType === "cards" 
              ? sentDonations.map(donation => (
                  <DonationItem key={donation.id} donation={donation} isSent={true} />
                ))
              : <DonationTable donations={sentDonations} isSent={true} />
          )}
        </TabsContent>
        
        <TabsContent value="received" className="pt-4">
          {receivedDonations.length === 0 ? (
            <EmptyDonationState type="received" />
          ) : (
            viewType === "cards" 
              ? receivedDonations.map(donation => (
                  <DonationItem key={donation.id} donation={donation} isSent={false} />
                ))
              : <DonationTable donations={receivedDonations} isSent={false} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonationHistory;
