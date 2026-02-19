import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
const Dashboard = () => {
  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage platform users, monitor activity, and generate reports</p>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>0</p>
        </div>

        <div className="stat-card">
          <h3>Completed Pickups</h3>
          <p>0</p>
        </div>

        <div className="stat-card">
          <h3>Pending Pickups</h3>
          <p>0</p>
        </div>

        <div className="stat-card">
          <h3>Active Opportunities</h3>
          <p>0</p>
        </div>
      </div>

      {/* REPORTS */}
      <div className="section-card">
        <h2>Generate Reports</h2>

        <div className="report-buttons">
          <button>Users Report</button>
          <button>Pickups Report</button>
          <button>Opportunities Report</button>
          <button>Full Activity Report</button>
        </div>
      </div>

      {/* USERS */}
      <div className="section-card">
        <h2>Users</h2>

        <input
          type="text"
          placeholder="Search users..."
          className="search-input"
        />

        <div className="empty-state">No users found</div>
      </div>
    </div>
  );
};

export default Dashboard;
