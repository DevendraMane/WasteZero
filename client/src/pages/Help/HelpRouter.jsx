import { useAuth } from "../../store/AuthContext";
import VolunteerHelp from "./VolunteerHelp";
import NGOHelp from "./NGOHelp";
import AdminHelp from "./AdminHelp";

const HelpRouter = () => {
  const { user } = useAuth();

  if (user?.role === "volunteer") return <VolunteerHelp />;
  if (user?.role === "ngo") return <NGOHelp />;
  if (user?.role === "admin") return <AdminHelp />;

  return null;
};

export default HelpRouter;
