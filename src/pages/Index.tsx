
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth/AuthProvider";

const Index = () => {
  const { user } = useAuth();
  
  // Redirect to Auth page if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect to the Home page when users visit the root URL and are logged in
  return <Navigate to="/home" replace />;
};

export default Index;
