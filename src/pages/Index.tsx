
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to the Home page when users visit the root URL
  return <Navigate to="/home" replace />;
};

export default Index;
