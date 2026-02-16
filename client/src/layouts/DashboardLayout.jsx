import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/dashboard.css";

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Topbar />

        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
