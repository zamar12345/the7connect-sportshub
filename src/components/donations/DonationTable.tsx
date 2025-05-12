
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Donation } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DonationTableProps {
  donations: Donation[];
  isSent: boolean;
}

const DonationTable = ({ donations, isSent }: DonationTableProps) => {
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

export default DonationTable;
