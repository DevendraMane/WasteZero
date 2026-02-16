import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <DashboardLayout>
      <h1>My Profile</h1>

      <div className="card">
        <h2>Personal Information</h2>

        <label>Full Name</label>
        <input value={user?.name} readOnly />

        <label>Email</label>
        <input value={user?.email} readOnly />

        <label>Role</label>
        <input value={user?.role} readOnly />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
