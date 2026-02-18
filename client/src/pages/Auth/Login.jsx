import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful");
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server error");
    }
  };
  return (
    <div className="card">
      {/* Tabs */}
      <div className="tabs">
        <button className="active-tab">Login</button>
        <button className="inactive-tab" onClick={() => navigate("/register")}>
          Register
        </button>
      </div>
      {/* Heading */}
      <h2 className="title">Login to your account</h2>
      <p className="subtitle">Enter your credentials to access your account</p>
      {/* Email */}
      <label className="label">Email</label>
      <input
        type="email"
        name="email"
        placeholder="Your email"
        value={formData.email}
        onChange={handleChange}
      />
      {/* Password */}
      <label className="label">Password</label>
      <input
        type="password"
        name="password"
        placeholder="Your password"
        value={formData.password}
        onChange={handleChange}
      />
      {/* Button */}
      <button className="main-btn" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};
export default Login;
