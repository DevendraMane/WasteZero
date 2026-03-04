import React, { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../store/AuthContext";
import debounce from "lodash.debounce";
import MapPicker from "../../components/MapPicker";

const CreateOpportunity = ({ onClose, onCreated }) => {
  const { authorizationToken, API } = useAuth();

  const submittingRef = useRef(false);

  const [creating, setCreating] = useState(false);

  const [coordinates, setCoordinates] = useState({
    lat: null,
    lng: null,
  });

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

  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  /* ================= INPUT HANDLER ================= */

  const handleChange = ({ target: { name, value } }) => {
    if (creating) return;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImage = (e) => {
    if (creating) return;

    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= LOCATION SEARCH ================= */

  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: query,
            format: "json",
            addressdetails: 1,
            limit: 5,
          },
        },
      );

      setSuggestions(res.data);
    } catch (err) {
      console.error("Location search error:", err);
    }
  };

  const debouncedSearch = useMemo(() => debounce(searchLocation, 500), []);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, []);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setCreating(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("duration", form.duration);
      formData.append("required_skills", form.required_skills);
      formData.append("date", form.date);

      if (coordinates.lat) {
        formData.append("latitude", coordinates.lat);
        formData.append("longitude", coordinates.lng);
      }

      if (image) {
        formData.append("image", image);
      }

      await axios.post(`${API}/api/opportunities`, formData, {
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "multipart/form-data",
        },
      });

      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error creating opportunity");
    } finally {
      submittingRef.current = false;
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center overflow-y-auto py-10 z-50">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* HEADER */}

        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">Create Opportunity</h2>

          <button
            disabled={creating}
            onClick={onClose}
            className="text-gray-500 hover:text-black text-lg disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className={`p-6 space-y-6 overflow-y-auto ${creating ? "opacity-70 pointer-events-none" : ""}`}
        >
          {/* TITLE */}

          <input
            name="title"
            placeholder="Opportunity Title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            required
          />

          {/* DESCRIPTION */}

          <textarea
            name="description"
            placeholder="Describe the opportunity..."
            rows="4"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            required
          />

          {/* SKILLS */}

          <input
            name="required_skills"
            placeholder="Skills (comma separated)"
            value={form.required_skills}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
          />

          {/* DURATION + DATE */}

          <div className="grid grid-cols-2 gap-4">
            <select
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Duration</option>
              <option value="1 hour">1 Hour</option>
              <option value="2 hours">2 Hours</option>
              <option value="Half Day">Half Day</option>
              <option value="1 Day">1 Day</option>
              <option value="2 Days">2 Days</option>
              <option value="1 Week">1 Week</option>
            </select>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* MAP */}

          <div>
            <p className="text-sm text-gray-500 mb-2">Select exact location</p>

            <div className="h-64 rounded-xl overflow-hidden border">
              <MapPicker
                setCoordinates={setCoordinates}
                setLocation={(address) =>
                  setForm((prev) => ({
                    ...prev,
                    location: address,
                  }))
                }
              />
            </div>
          </div>

          {/* IMAGE */}

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                hidden
              />

              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto h-32 object-cover rounded-lg"
                />
              ) : (
                <p className="text-gray-500">
                  Click to upload opportunity image
                </p>
              )}
            </label>
          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              disabled={creating}
              onClick={onClose}
              className="bg-gray-100 px-6 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition
              ${
                creating
                  ? "bg-green-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {creating && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}

              {creating ? "Creating..." : "Create Opportunity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOpportunity;
