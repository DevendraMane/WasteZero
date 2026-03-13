import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MobileBottomNav from "../components/MobileBottomNav";
import { Outlet } from "react-router-dom";
import { useDarkMode } from "../store/DarkModeContext";

const DashboardLayout = () => {
  const { isDarkMode } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      className={`flex h-screen overflow-hidden transition duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full lg:ml-0">
        {/* TOPBAR (Fixed) */}
        <div
          className={`shrink-0 shadow-sm ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        </div>

        {/* PAGE CONTENT (Scrollable only here) */}
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 transition duration-300 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
