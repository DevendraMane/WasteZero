import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    location: "",
    address: "",
    skills: "",
    bio: "",
    profileImage: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setFormData({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "",
        location: data.location || "",
        address: data.address || "",
        skills: data.skills?.join(", ") || "",
        bio: data.bio || "",
        profileImage: data.profileImage || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("profileImage", file);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/upload-profile-image",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        },
      );

      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          profileImage: data.imageUrl,
        }));
      }
    } catch {
      alert("Image upload failed");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          address: formData.address,
          skills: formData.skills.split(",").map((s) => s.trim()),
          bio: formData.bio,
        }),
      });

      if (res.ok) {
        alert("Profile Updated");
        setEditMode(false);
        fetchProfile();
      }
    } catch {
      alert("Update failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-lg">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <button
          onClick={handleLogout}
          className="bg-red-100 text-red-600 px-5 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* PROFILE IMAGE */}
      <div className="flex items-center gap-6 mb-10">
        <img
          src={
            formData.profileImage ||
            "https://ui-avatars.com/api/?name=" + formData.name
          }
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border"
        />

        {editMode && <input type="file" onChange={handleImageUpload} />}
      </div>

      {/* PROFILE DETAILS */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium">Name</label>
          {editMode ? (
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg"
            />
          ) : (
            <p className="mt-1">{formData.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <p className="mt-1">{formData.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Role</label>
          <p className="mt-1 capitalize">{formData.role}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          {editMode ? (
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg"
            />
          ) : (
            <p className="mt-1">{formData.location}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium">Address</label>
        {editMode ? (
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />
        ) : (
          <p className="mt-1">{formData.address}</p>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium">Skills</label>
        {editMode ? (
          <input
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />
        ) : (
          <p className="mt-1">{formData.skills}</p>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium">Bio</label>
        {editMode ? (
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />
        ) : (
          <p className="mt-1">{formData.bio}</p>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-4 mt-8">
        {editMode ? (
          <>
            <button
              onClick={() => {
                setEditMode(false);
                fetchProfile();
              }}
              className="bg-gray-100 px-6 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Save
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
