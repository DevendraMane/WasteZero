import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  MessageCircle,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import loader from "../assets/loader.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const roleMenus = {
    volunteer: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Schedule Pickup", path: "/schedule", icon: CalendarDays },
      { name: "Opportunities", path: "/opportunities", icon: Briefcase },
      { name: "Messages", path: "/messages", icon: MessageCircle },
      { name: "My Impact", path: "/impact", icon: BarChart3 },
    ],
    ngo: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Create Opportunity", path: "/opportunities", icon: Briefcase },
      { name: "Manage Applications", path: "/applications", icon: BarChart3 },
      { name: "Messages", path: "/messages", icon: MessageCircle },
    ],
    admin: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "User Management", path: "/users", icon: User },
      { name: "Reports & Analytics", path: "/analytics", icon: BarChart3 },
      { name: "Messages", path: "/messages", icon: MessageCircle },
      {
        name: "Platform Settings",
        path: "/platform-settings",
        icon: Settings,
      },
      { name: "Pickups", path: "/pickups", icon: CalendarDays },
      { name: "Opportunities", path: "/admin-opportunities", icon: Briefcase },
    ],
  };

  const menuItems = roleMenus[user?.role] || [];

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      {/* FIXED LOGO — outside scroll area */}
      <div className="px-6 pt-6 pb-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl shadow-sm">
            <img
              src={loader}
              alt="WasteZero Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-wide text-gray-800">
            <span className="text-green-600">Waste</span>Zero
          </span>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* USER INFO */}
        <div className="mb-8 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {user?.name || "User"}
              </p>
              <span className="text-sm text-gray-500 capitalize">
                {user?.role || "Role"}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN MENU */}
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">
          Main Menu
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* SETTINGS SECTION */}
        <div className="text-xs text-gray-400 uppercase tracking-wider mt-8 mb-3">
          Settings
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
              location.pathname === "/profile"
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User size={18} />
            My Profile
          </button>

          <button
            onClick={() => navigate("/settings")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
              location.pathname === "/settings"
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Settings size={18} />
            Settings
          </button>

          <button
            onClick={() => navigate("/help")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
              location.pathname === "/help"
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <HelpCircle size={18} />
            Help & Support
          </button>
        </div>
      </div>

      {/* FIXED BOTTOM SECTION */}
      <div className="border-t px-6 py-6 bg-white">
        {/* DARK MODE */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Dark Mode</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
              darkMode ? "bg-gray-800" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
                darkMode ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* SIGN OUT */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 
                   border border-red-300 
                   text-red-600 
                   py-2.5 rounded-lg 
                   hover:bg-red-50 
                   hover:border-red-400
                   transition font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
