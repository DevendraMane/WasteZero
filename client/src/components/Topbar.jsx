import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white">
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

        {/* PROFILE */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            👤
            <span className="font-medium text-sm">{user?.name || "User"}</span>
          </button>

          {/* DROPDOWN */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg overflow-hidden">
              <button
                onClick={() => navigate("/profile")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                My Profile
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
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
