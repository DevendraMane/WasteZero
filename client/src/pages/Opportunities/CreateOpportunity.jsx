import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../store/AuthContext";

const CreateOpportunity = ({ onClose, onCreated }) => {
  const { authorizationToken, API } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    location: "",
    required_skills: "",
    date: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("duration", form.duration);
      formData.append("required_skills", form.required_skills);
      formData.append("date", form.date);

      if (image) {
        formData.append("image", image);
      }

      await axios.post(`${API}/api/opportunities`, formData, {
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Opportunity created successfully");
      onCreated();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Error creating opportunity");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 space-y-6 relative">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Create Opportunity</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="title"
            placeholder="Title"
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            rows="4"
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            name="required_skills"
            placeholder="Skills (comma separated)"
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              name="duration"
              placeholder="Duration"
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            />

            <input
              name="location"
              placeholder="Location"
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            />

            <input
              type="date"
              name="date"
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition">
            <label className="cursor-pointer">
              <input type="file" onChange={handleImage} hidden />

              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto h-40 object-cover rounded-lg"
                />
              ) : (
                <p className="text-gray-500">Click to upload image</p>
              )}
            </label>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 px-6 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOpportunity;
