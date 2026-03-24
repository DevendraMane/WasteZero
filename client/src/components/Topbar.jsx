import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useDarkMode } from "../store/DarkModeContext";
import { socket } from "../utils/socket";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import { Menu } from "lucide-react";

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logoutUser, API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  /* ================= FETCH NOTIFICATIONS ================= */

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: authorizationToken },
      });

      const data = await res.json();

      const unread = data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [API, authorizationToken]);

  /* ================= REFRESH WHEN TAB FOCUSED ================= */

  useEffect(() => {
    const handleFocus = () => fetchNotifications();

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  /* ================= REALTIME NOTIFICATIONS ================= */

  useEffect(() => {
    socket.on("new_notification", (notification) => {
      if (notification) setUnreadCount((prev) => prev + 1);
    });

    return () => socket.off("new_notification");
  }, []);

  /* ================= CLOSE DROPDOWN OUTSIDE CLICK ================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= BELL CLICK ================= */

  const handleBellClick = () => {
    setUnreadCount(0);
    navigate("/notifications");
  };

  return (
    <div
      className={`flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 lg:px-8 py-5 shadow-sm transition duration-300 ${
        isDarkMode ? "bg-gray-800 border-b border-gray-700" : "bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onMenuClick}
        className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-full transition ${
          isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"
        }`}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* SEARCH BAR */}
      <div className="flex-1 min-w-0">
        <SearchBar />
      </div>

      {/* RIGHT SECTION */}

      <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
        {/* ================= BELL ================= */}

        <button
          onClick={handleBellClick}
          className={`relative w-10 h-10 flex items-center justify-center rounded-full transition
          ${
            unreadCount > 0
              ? "bg-green-100"
              : isDarkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <motion.span
            className="text-xl"
            animate={
              unreadCount > 0
                ? { rotate: [0, 20, -20, 15, -15, 10, -10, 0] }
                : { rotate: 0 }
            }
            transition={{
              repeat: unreadCount > 0 ? Infinity : 0,
              duration: 1,
              ease: "easeInOut",
            }}
            style={{ originX: 0.5, originY: 0 }}
          >
            🔔
          </motion.span>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {/* ================= PROFILE ================= */}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className={`flex items-center gap-3 px-3 py-2 rounded-full transition ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <div className="relative">
              <img
                src={
                  user?.profileImage
                    ? user.profileImage.startsWith("http")
                      ? user.profileImage
                      : `${API}/uploads/${user.profileImage}`
                    : `https://ui-avatars.com/api/?name=${user?.name}`
                }
                alt="profile"
                className="w-8 h-8 rounded-full object-cover"
              />

              {!user?.location && (
                <div className="group absolute -top-1 -right-1">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>

                  {user.role === "volunteer" ? (
                    <div className="absolute right-0 mt-2 w-48 bg-black text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                      Update your location for nearest opportunities
                    </div>
                  ) : (
                    <div className="absolute right-0 mt-2 w-48 bg-black text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                      Update your location for nearest volunteers
                    </div>
                  )}
                </div>
              )}
            </div>

            <span
              className={`hidden md:inline font-medium text-sm ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {user?.name || "User"}
            </span>
          </button>

          {showMenu && (
            <div
              className={`absolute right-0 mt-3 w-48 rounded-xl border overflow-hidden z-50 transition duration-300 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 shadow-lg"
                  : "bg-white border-gray-200 shadow-xl"
              }`}
            >
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowMenu(false);
                }}
                className={`w-full text-left px-4 py-3 transition ${
                  isDarkMode
                    ? "hover:bg-gray-600 text-gray-100"
                    : "hover:bg-gray-100 text-gray-900"
                }`}
              >
                My Profile
              </button>

              <button
                onClick={() => {
                  navigate("/settings");
                  setShowMenu(false);
                }}
                className={`w-full text-left px-4 py-3 transition ${
                  isDarkMode
                    ? "hover:bg-gray-600 text-gray-100"
                    : "hover:bg-gray-100 text-gray-900"
                }`}
              >
                Settings
              </button>

              <div
                className={`${isDarkMode ? "border-gray-600" : "border-gray-200"} border-t`}
              ></div>

              <button
                onClick={handleLogout}
                className={`w-full text-left px-4 py-3 transition ${
                  isDarkMode
                    ? "text-red-400 hover:bg-gray-600"
                    : "text-red-600 hover:bg-red-50"
                }`}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
