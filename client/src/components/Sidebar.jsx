import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useDarkMode } from "../store/DarkModeContext";
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

const Sidebar = ({ onLinkClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
      { name: "Manage Pickups", path: "/ngo-pickups", icon: CalendarDays },
      { name: "Messages", path: "/messages", icon: MessageCircle },
    ],
    admin: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "User Management", path: "/users", icon: User },
      { name: "Reports & Analytics", path: "/analytics", icon: BarChart3 },
      {
        name: "Platform Settings",
        path: "/platform-settings",
        icon: Settings,
      },
    ],
  };

  const menuItems = roleMenus[user?.role] || [];

  const handleLogout = () => {
    logoutUser();
    if (onLinkClick) onLinkClick();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onLinkClick) onLinkClick();
  };

  return (
    <div
      className={`w-64 border-r h-screen flex flex-col transition duration-300 ${
        isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white"
      }`}
    >
      {/* FIXED LOGO — outside scroll area */}
      <div
        className={`px-6 pt-6 pb-4 border-b shrink-0 transition duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl shadow-sm">
            <img
              src={loader}
              alt="WasteZero Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <span
            className={`text-xl font-bold tracking-wide ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            <span className="text-green-600">Waste</span>Zero
          </span>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6">
        {/* USER INFO */}
        <div
          className={`mb-8 border-b pb-6 transition duration-300 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative group">
              <img
                src={
                  user?.profileImage
                    ? user.profileImage.startsWith("http")
                      ? user.profileImage
                      : `${import.meta.env.VITE_BACKEND_URL}/uploads/${user.profileImage}`
                    : `https://ui-avatars.com/api/?name=${user?.name}`
                }
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border"
              />

              {/* GLOWING DOT IF LOCATION MISSING */}
              {!user?.location && (
                <>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>

                  {/* TOOLTIP */}
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    {user?.role === "volunteer"
                      ? "Update your location for nearest opportunities"
                      : "Update your location for nearest volunteers"}
                  </div>
                </>
              )}
            </div>

            <div>
              <p
                className={`font-medium ${
                  isDarkMode ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {user?.name || "User"}
              </p>
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                } capitalize`}
              >
                {user?.role || "Role"}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN MENU */}
        <div
          className={`text-xs tracking-wider mb-3 ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          } uppercase`}
        >
          Main Menu
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? "bg-gray-800 text-green-400 font-medium"
                      : "bg-gray-100 text-gray-900 font-medium"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
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
        <div
          className={`text-xs tracking-wider mt-8 mb-3 ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          } uppercase`}
        >
          Settings
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleNavigate("/profile")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
              location.pathname === "/profile"
                ? isDarkMode
                  ? "bg-gray-800 text-green-400 font-medium"
                  : "bg-gray-100 text-gray-900 font-medium"
                : isDarkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="relative">
              <User size={18} />

              {/* GLOWING DOT IF LOCATION MISSING */}
              {!user?.location && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </div>
            My Profile
          </button>

          <button
            onClick={() => handleNavigate("/settings")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
              location.pathname === "/settings"
                ? isDarkMode
                  ? "bg-gray-800 text-green-400 font-medium"
                  : "bg-gray-100 text-gray-900 font-medium"
                : isDarkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Settings size={18} />
            Settings
          </button>

          {user?.role !== "admin" && (
            <button
              onClick={() => handleNavigate("/help")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                location.pathname === "/help"
                  ? isDarkMode
                    ? "bg-gray-800 text-green-400 font-medium"
                    : "bg-gray-100 text-gray-900 font-medium"
                  : isDarkMode
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <HelpCircle size={18} />
              Help & Support
            </button>
          )}
        </div>
      </div>

      {/* FIXED BOTTOM SECTION */}
      <div
        className={`border-t px-6 py-6 transition duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* DARK MODE */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Dark Mode
          </span>
          <button
            onClick={toggleDarkMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
              isDarkMode ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
                isDarkMode ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* SIGN OUT */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 
                   py-2.5 rounded-lg 
                   transition font-medium ${
                     isDarkMode
                       ? "border border-red-800 text-red-400 hover:bg-red-900 hover:border-red-700"
                       : "border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                   }`}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
