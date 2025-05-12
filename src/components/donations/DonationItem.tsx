
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Donation } from "@/types/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DonationItemProps {
  donation: Donation;
  isSent: boolean;
}

const DonationItem = ({ donation, isSent }: DonationItemProps) => {
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

export default DonationItem;
