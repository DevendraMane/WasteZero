import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useDarkMode } from "../store/DarkModeContext";
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  MessageCircle,
  User,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();

  const roleMenus = {
    volunteer: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Schedule", path: "/schedule", icon: CalendarDays },
      { name: "Opportunities", path: "/opportunities", icon: Briefcase },
      { name: "Messages", path: "/messages", icon: MessageCircle },
      { name: "Profile", path: "/profile", icon: User },
    ],
    ngo: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Opportunities", path: "/opportunities", icon: Briefcase },
      { name: "Applications", path: "/applications", icon: Users },
      { name: "Messages", path: "/messages", icon: MessageCircle },
      { name: "Profile", path: "/profile", icon: User },
    ],
    admin: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Users", path: "/users", icon: Users },
      { name: "Reports", path: "/analytics", icon: BarChart3 },
      { name: "Settings", path: "/platform-settings", icon: Settings },
      { name: "Profile", path: "/profile", icon: User },
    ],
  };

  const menuItems = roleMenus[user?.role] || [];

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t px-2 py-2 transition duration-300 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="grid grid-cols-5 gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg py-1.5 transition ${
                isActive
                  ? isDarkMode
                    ? "text-green-400 bg-gray-700"
                    : "text-green-600 bg-green-50"
                  : isDarkMode
                    ? "text-gray-300"
                    : "text-gray-500"
              }`}
            >
              <Icon size={16} />
              <span className="text-[10px] leading-none">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
