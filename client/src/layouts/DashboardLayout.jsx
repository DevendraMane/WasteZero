import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* SIDEBAR (Fixed height) */}
      <div className="w-64 h-full">
        <Sidebar />
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full">
        {/* TOPBAR (Fixed) */}
        <div className="flex-shrink-0 bg-white shadow-sm">
          <Topbar />
        </div>

        {/* PAGE CONTENT (Scrollable only here) */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
