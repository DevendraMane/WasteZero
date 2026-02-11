import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ================= REGISTER =================
  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Login successful");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

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
              <h3>Login</h3>
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
              />
              <button className="main-btn" onClick={handleLogin}>
                Login
              </button>
            </div>
          ) : (
            <div>
              <h3>Register</h3>
              <input
                type="text"
                name="username"
                placeholder="Username"
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
              />
              <button className="main-btn" onClick={handleRegister}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
