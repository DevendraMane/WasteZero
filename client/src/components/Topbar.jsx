import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const Topbar = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
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
        {/* NOTIFICATION */}
        <button className="text-xl hover:text-green-600 transition">🔔</button>

        {/* PROFILE DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            👤
            <span className="font-medium text-sm">{user?.name || "User"}</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg overflow-hidden z-50">
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
              >
                My Profile
              </button>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 transition"
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
