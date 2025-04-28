
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

const DonationSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success("Thank you for your donation!");
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <CheckCircle className="w-16 h-16 text-sport-green mb-4" />
        <h1 className="text-2xl font-bold mb-2">Thank you for your donation!</h1>
        <p className="text-muted-foreground text-center">
          Your support means a lot. You will be redirected back to the home page shortly.
        </p>
      </div>
    </MobileLayout>
  );
};

export default DonationSuccess;
