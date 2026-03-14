import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import UserMessages from "./UserMessages";
import AdminMessages from "./AdminMessages";

const Messages = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();

  return (
    <div className="h-[calc(100dvh-70px)] overflow-hidden">
      {user?.role === "admin" ? (
        <AdminMessages isDarkMode={isDarkMode} />
      ) : (
        <UserMessages isDarkMode={isDarkMode} />
      )}
    </div>
  );
};

export default Messages;
