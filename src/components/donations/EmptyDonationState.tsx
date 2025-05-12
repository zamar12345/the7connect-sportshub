
import { DollarSign } from "lucide-react";

interface EmptyDonationStateProps {
  type: 'sent' | 'received';
}

const EmptyDonationState = ({ type }: EmptyDonationStateProps) => {
  return (
    <div className="text-center p-8 border rounded-md bg-muted/20">
      <DollarSign size={48} className="mx-auto text-muted-foreground mb-2" />
      <h3 className="font-medium text-lg">
        {type === 'sent' ? 'No donations sent yet' : 'No donations received yet'}
      </h3>
      <p className="text-muted-foreground">
        {type === 'sent'
          ? 'When you support other athletes, your donations will appear here.'
          : 'When others support you, their donations will appear here.'}
      </p>
    </div>
  );
};

export default EmptyDonationState;
