import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import debounce from "lodash.debounce";
import MapPicker from "../../components/MapPicker";

const EditOpportunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authorizationToken, API, user } = useAuth();
  const { isDarkMode } = useDarkMode();

  const submittingRef = useRef(false);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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

  /* ================= FETCH OPPORTUNITY ================= */

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const res = await axios.get(`${API}/api/opportunities/${id}`, {
          headers: { Authorization: authorizationToken },
        });

        const data = res.data;

        const currentUserId = String(user?._id || user?.id || "");
        const ownerId = String(data?.ngo_id?._id || data?.ngo_id || "");

        if (
          user?.role === "ngo" &&
          currentUserId &&
          ownerId &&
          currentUserId !== ownerId
        ) {
          alert("You are not authorized to edit this opportunity");
          navigate(`/opportunities/${id}`);
          return;
        }

        setForm({
          title: data.title,
          description: data.description,
          duration: data.duration,
          location: data.location,
          required_skills: data.required_skills?.join(", "),
          date: data.date?.split("T")[0],
        });

        setLocationQuery(data.location);

        setCoordinates({
          lat: data.latitude || null,
          lng: data.longitude || null,
        });

        if (data.image) setPreview(data.image);
      } catch (error) {
        console.error("Error fetching opportunity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id, API, authorizationToken, user?._id, user?.id, user?.role, navigate]);

  /* ================= INPUT HANDLER ================= */

  const handleChange = ({ target: { name, value } }) => {
    if (saving) return;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImage = (e) => {
    if (saving) return;

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
    setSaving(true);

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

      await axios.put(`${API}/api/opportunities/${id}`, formData, {
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/opportunities/${id}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Update failed");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center py-32 transition duration-300 ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center overflow-y-auto py-10 z-50">
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* HEADER */}

        <div
          className={`flex justify-between items-center p-6 border-b sticky top-0 z-10 transition duration-300 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold transition duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Edit Opportunity
          </h2>

          <button
            disabled={saving}
            onClick={() => navigate(-1)}
            className={`text-lg disabled:opacity-40 transition duration-300 ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-black"
            }`}
          >
            ✕
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className={`p-6 space-y-6 overflow-y-auto ${
            saving ? "opacity-70 pointer-events-none" : ""
          }`}
        >
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-3 transition duration-300 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                : "border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            }`}
            required
          />

          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-3 transition duration-300 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                : "border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            }`}
            required
          />

          <input
            name="required_skills"
            value={form.required_skills}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-3 transition duration-300 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                : "border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            }`}
          />

          {/* MAP */}

          <div>
            <p
              className={`text-sm mb-2 transition duration-300 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Select exact location
            </p>

            <div
              className={`h-64 rounded-xl overflow-hidden border transition duration-300 ${
                isDarkMode ? "border-gray-600" : "border-gray-300"
              }`}
            >
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

          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition duration-300 ${
              isDarkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-300"
            }`}
          >
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
                <p
                  className={`transition duration-300 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Click to upload opportunity image
                </p>
              )}
            </label>
          </div>

          {/* BUTTONS */}

          <div
            className={`flex justify-end gap-4 pt-4 border-t transition duration-300 ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              type="button"
              disabled={saving}
              onClick={() => navigate(-1)}
              className={`px-6 py-2 rounded-lg disabled:opacity-50 transition duration-300 ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${
                saving
                  ? "bg-green-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}

              {saving ? "Updating..." : "Update Opportunity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOpportunity;
