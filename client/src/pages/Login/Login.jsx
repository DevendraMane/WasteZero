import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="container">
      {/* LEFT SIDE */}
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

      {/* RIGHT SIDE */}
      <div className="right">
        <div className="card">
          <div className="tabs">
            <button
              className={activeTab === "login" ? "active" : ""}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={activeTab === "register" ? "active" : ""}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          {activeTab === "login" ? (
            <div>
              <h3>Login to your account</h3>
              <input type="text" placeholder="Username" />
              <input type="password" placeholder="Password" />
              <button className="main-btn">Login</button>
            </div>
          ) : (
            <div>
              <h3>Create your account</h3>
              <input type="text" placeholder="Username" />
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button className="main-btn">Register</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
