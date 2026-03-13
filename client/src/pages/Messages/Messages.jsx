import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import UserMessages from "./UserMessages";
import AdminMessages from "./AdminMessages";

const Messages = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();

  if (user?.role === "admin") {
    return <AdminMessages isDarkMode={isDarkMode} />;
  }

  return <UserMessages isDarkMode={isDarkMode} />;
};

export default Messages;
