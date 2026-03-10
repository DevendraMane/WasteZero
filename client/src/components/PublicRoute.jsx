import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const PublicRoute = ({ children }) => {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
