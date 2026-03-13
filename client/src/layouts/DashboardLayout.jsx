import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import { useDarkMode } from "../store/DarkModeContext";

const DashboardLayout = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`flex h-screen overflow-hidden transition duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* SIDEBAR (Fixed height) */}
      <div className="w-64 h-full">
        <Sidebar />
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full">
        {/* TOPBAR (Fixed) */}
        <div
          className={`flex-shrink-0 shadow-sm ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <Topbar />
        </div>

        {/* PAGE CONTENT (Scrollable only here) */}
        <main
          className={`flex-1 overflow-y-auto p-8 transition duration-300 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
