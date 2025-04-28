
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground mb-4">This page doesn't exist in the sports world</p>
        <p className="text-muted-foreground mb-6">The content you're looking for might have been moved or deleted.</p>
        <Button 
          onClick={() => navigate("/")} 
          className="bg-sport-green hover:bg-sport-green/90 text-white"
        >
          Return to Home Field
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
