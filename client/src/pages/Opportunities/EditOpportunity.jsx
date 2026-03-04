import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import debounce from "lodash.debounce";
import MapPicker from "../../components/MapPicker";

const EditOpportunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authorizationToken, API } = useAuth();

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
  }, [id]);

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
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center overflow-y-auto py-10 z-50">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* HEADER */}

        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">Edit Opportunity</h2>

          <button
            disabled={saving}
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-black text-lg disabled:opacity-40"
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
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            required
          />

          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            name="required_skills"
            value={form.required_skills}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
          />

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
              disabled={saving}
              onClick={() => navigate(-1)}
              className="bg-gray-100 px-6 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition
              ${
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
