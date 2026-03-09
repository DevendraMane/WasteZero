import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { socket } from "../utils/socket";

const Topbar = () => {
  const navigate = useNavigate();
  const { user, logoutUser, API, authorizationToken } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellAnimate, setBellAnimate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= FETCH NOTIFICATIONS ================= */

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: {
          Authorization: authorizationToken,
        },
      });

      const data = await res.json();

      setNotifications(data);

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
    const handleFocus = () => {
      fetchNotifications();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  /* ================= REALTIME NOTIFICATIONS ================= */

  useEffect(() => {
    socket.on("new_notification", (notification) => {
      console.log("Realtime notification:", notification);

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      setBellAnimate(true);

      setTimeout(() => {
        setBellAnimate(false);
      }, 800);
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  /* ================= CLOSE DROPDOWN OUTSIDE CLICK ================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= BELL CLICK ================= */

  const handleBellClick = () => {
    setUnreadCount(0);
    navigate("/notifications");
  };

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      {/* SEARCH BAR */}
      <div className="w-1/2">
        <input
          type="text"
          placeholder="Search pickups, opportunities..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-6 relative">
        {/* ================= NOTIFICATION ================= */}

        <button
          onClick={handleBellClick}
          className={`relative text-xl hover:text-green-600 transition ${
            bellAnimate ? "animate-bounce" : ""
          }`}
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {/* ================= PROFILE DROPDOWN ================= */}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition"
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

            <span className="font-medium text-sm">{user?.name || "User"}</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl rounded-xl border overflow-hidden z-50 animate-fadeIn">
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition"
              >
                My Profile
              </button>

              <button
                onClick={() => {
                  navigate("/settings");
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition"
              >
                Settings
              </button>

              <div className="border-t"></div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition"
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
