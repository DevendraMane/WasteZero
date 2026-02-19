import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "volunteer",
  });
  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleRegister = async () => {
    // password match check
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration successful");
        navigate("/login");
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
        <button className="inactive-tab" onClick={() => navigate("/login")}>
          Login
        </button>
        <button className="active-tab">Register</button>
      </div>
      {/* Heading */}
      <h2 className="title">Create a new account</h2>
      <p className="subtitle">Fill in your details to join WasteZero</p>
      {/* Full Name */}
      <label className="label">Full Name</label>
      <input
        type="text"
        name="name"
        placeholder="Your full name"
        value={formData.name}
        onChange={handleChange}
      />
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
        placeholder="Create a password"
        value={formData.password}
        onChange={handleChange}
      />
      {/* Confirm Password */}
      <label className="label">Confirm Password</label>
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleChange}
      />
      {/* Role */}
      <label className="label">Role</label>
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="select"
      >
        <option value="volunteer">Volunteer</option>
        <option value="ngo">NGO</option>
        <option value="admin">Admin</option>
      </select>
      {/* Button */}
      <button className="main-btn" onClick={handleRegister}>
        Create Account
      </button>
    </div>
  );
};
export default Register;
