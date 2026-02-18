import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="sidebar">
      <h2 className="logo">♻ WasteZero</h2>

      <div className="user">
        <p>{user?.name}</p>
        <span>{user?.role}</span>
      </div>

      <div className="menu">
        <p onClick={() => navigate("/dashboard")}>Dashboard</p>

        <p>Schedule Pickup</p>

        <p>Opportunities</p>

        <p>Messages</p>

        <p>My Impact</p>

        <p onClick={() => navigate("/profile")}>My Profile</p>

        <p>Settings</p>
      </div>
    </div>
  );
};

export default Sidebar;
