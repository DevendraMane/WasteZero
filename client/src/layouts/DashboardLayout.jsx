import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <Topbar />
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
