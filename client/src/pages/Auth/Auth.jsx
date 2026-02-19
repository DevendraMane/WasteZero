import React from "react";
import { Outlet } from "react-router-dom";
import "../../styles/Auth.css";

const Auth = () => {
  return (
    <div className="container">
      {/* LEFT */}
      <div className="left">
        <h2 className="logo">♻ WasteZero</h2>
        <h1>Join the Recycling Revolution</h1>
        <p>
          WasteZero connects volunteers, NGOs, and administrators to schedule
          pickups, manage recycling opportunities, and make a positive impact on
          our environment.
        </p>
        <div className="features">
          <div>
            <h4>Schedule Pickups</h4>
            <p>Easily arrange waste collection</p>
          </div>
          <div>
            <h4>Track Impact</h4>
            <p>Monitor your environmental contribution</p>
          </div>
          <div>
            <h4>Volunteer</h4>
            <p>Join recycling initiatives</p>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="right">
        <Outlet />
      </div>
    </div>
  );
};
export default Auth;
