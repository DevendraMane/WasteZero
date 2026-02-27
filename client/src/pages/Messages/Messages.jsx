import { useAuth } from "../../store/AuthContext";
import UserMessages from "./UserMessages";
import AdminMessages from "./AdminMessages";

const Messages = () => {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminMessages />;
  }

  return <UserMessages />;
};

export default Messages;
