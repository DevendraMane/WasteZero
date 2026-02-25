import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;
