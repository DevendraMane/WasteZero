import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

const EditOpportunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch existing opportunity
  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const res = await axios.get(`${API}/api/opportunities/${id}`, {
          headers: { Authorization: authorizationToken },
        });

        const data = res.data;

        setForm({
          title: data.title,
          description: data.description,
          duration: data.duration,
          location: data.location,
          required_skills: data.required_skills?.join(", "),
          date: data.date?.split("T")[0],
        });

        if (data.image) {
          setPreview(`${API}/uploads/${data.image}`);
        }
      } catch (error) {
        console.error("Error fetching opportunity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

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
      formData.append("date", form.date);
      formData.append("duration", form.duration);
      formData.append("required_skills", form.required_skills);

      if (image) {
        formData.append("image", image);
      }

      await axios.put(`${API}/api/opportunities/${id}`, formData, {
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Opportunity updated successfully");
      navigate(`/opportunities/${id}`);
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 space-y-6 relative">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Opportunity</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            required
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            name="required_skills"
            value={form.required_skills}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            />

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            />
            <input
              type="date"
              name="date"
              value={form.date}
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
              onClick={() => navigate(-1)}
              className="bg-gray-100 px-6 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOpportunity;
