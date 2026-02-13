import React from "react";
import { Outlet } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  return (
    <div className="container">
      <div className="left">
        <h2 className="logo">♻ WasteZero</h2>
        <h1>Join the Recycling Revolution</h1>
        <p>
          WasteZero connects volunteers, NGOs, and administrators to schedule
          pickups and manage recycling opportunities.
        </p>
      </div>

      <div className="right">
        <Outlet />
      </div>
    </div>
  );
};

export default Auth;
