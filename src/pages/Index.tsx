
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

const Index = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to Auth page if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect to the Home page when users visit the root URL and are logged in
  return <Navigate to="/home" replace />;
};

export default Index;
