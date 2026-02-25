import React from "react";
import { useAuth } from "../../store/AuthContext";
import AdminDashboard from "./AdminDashboard";
import VolunteerDashboard from "./VolunteerDashboard";
import NgoDashboard from "./NGOdashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "ngo") return <NgoDashboard />;
  if (user?.role === "volunteer") return <VolunteerDashboard />;

  return <div>Unauthorized</div>;
};

export default Dashboard;
