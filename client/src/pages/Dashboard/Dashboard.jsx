import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // -------------------------
  // TAB STATE
  // -------------------------
  const [activeTab, setActiveTab] = useState("profile");

  // -------------------------
  // PROFILE STATE
  // -------------------------
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    location: "",
    address: "",
    skills: "",
    bio: "",
  });

  // -------------------------
  // PASSWORD STATE
  // -------------------------
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // -------------------------
  // LOGOUT
  // -------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // -------------------------
  // FETCH PROFILE FROM DB
  // -------------------------
  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: token,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const user = await res.json();

      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        location: user.location || "",
        address: user.address || "",
        skills: user.skills?.join(", ") || "",
        bio: user.bio || "",
      });

      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // -------------------------
  // INPUT CHANGE HANDLER
  // -------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // -------------------------
  // UPDATE PROFILE
  // -------------------------
  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          address: formData.address,
          skills: formData.skills.split(",").map((s) => s.trim()),
          bio: formData.bio,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profile updated successfully");

        fetchProfile();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Error updating profile");
    }
  };

  // -------------------------
  // CHANGE PASSWORD
  // -------------------------
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        alert("Password changed successfully");

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert(data.message);
      }
    } catch {
      alert("Error changing password");
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <DashboardLayout>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>My Profile</h1>

        <button
          onClick={handleLogout}
          className="main-btn"
          style={{ width: "120px" }}
        >
          Logout
        </button>
      </div>

      {/* TABS */}
      <div className="tabs">
        <button
          className={activeTab === "profile" ? "active-tab" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>

        <button
          className={activeTab === "password" ? "active-tab" : ""}
          onClick={() => setActiveTab("password")}
        >
          Password
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="card">
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} />

          <label>Email</label>
          <input value={formData.email} disabled />

          <label>Role</label>
          <input value={formData.role} disabled />

          <label>Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
          />

          <label>Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
          />

          <label>Skills</label>
          <input
            name="skills"
            value={formData.skills}
            onChange={handleChange}
          />

          <label>Bio</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} />

          <button className="main-btn" onClick={handleUpdate}>
            Save Changes
          </button>
        </div>
      )}

      {/* PASSWORD TAB */}
      {activeTab === "password" && (
        <div className="card">
          <h2>Change Password</h2>

          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
          />

          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
          />

          <button className="main-btn" onClick={handleChangePassword}>
            Change Password
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
