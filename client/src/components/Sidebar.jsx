import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const roleMenus = {
    volunteer: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Schedule Pickup", path: "/schedule" },
      { name: "Opportunities", path: "/opportunities" },
      { name: "Messages", path: "/messages" },
      { name: "My Impact", path: "/impact" },
      { name: "Profile", path: "/profile" },
    ],
    ngo: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Create Opportunity", path: "/opportunities" },
      { name: "Manage Applications", path: "/applications" },
      { name: "Messages", path: "/messages" },
      { name: "Profile", path: "/profile" },
    ],
    admin: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "User Management", path: "/users" },
      { name: "Reports & Analytics", path: "/analytics" },
      { name: "Platform Settings", path: "/settings" },
    ],
  };

  const menuItems = roleMenus[user?.role] || [];

  return (
    <div className="w-64 bg-white shadow-xl flex flex-col p-6">
      {/* LOGO */}
      <h2 className="text-2xl font-bold text-green-600 mb-10">♻ WasteZero</h2>

      {/* USER INFO */}
      <div className="mb-10">
        <p className="font-semibold text-gray-800">{user?.name || "User"}</p>
        <span className="text-sm text-gray-500 capitalize">
          {user?.role || "Role"}
        </span>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-green-100 text-green-700 font-semibold"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>

      {/* SPACER */}
      <div className="flex-grow" />

      {/* LOGOUT */}
      <button
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
        className="mt-6 bg-red-100 text-red-600 py-3 rounded-xl hover:bg-red-200 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
