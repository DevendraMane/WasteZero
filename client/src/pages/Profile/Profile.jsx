import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import debounce from "lodash.debounce";
import MapPicker from "../../components/MapPicker";

const Profile = () => {
  const navigate = useNavigate();
  const { user, API, authorizationToken, fetchProfile } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [coordinates, setCoordinates] = useState({
    lat: null,
    lng: null,
  });

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

  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  /* ================= SYNC USER → FORM ================= */

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        location: user.location || "",
        address: user.address || "",
        skills: user.skills?.join(", ") || "",
        bio: user.bio || "",
        profileImage: user.profileImage || "",
      });

      setLocationQuery(user.location || "");
    }
  }, [user]);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= INPUT CHANGE ================= */

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      console.log(err);
    }
  };

  const debouncedSearch = useMemo(() => debounce(searchLocation, 500), []);

  /* ================= IMAGE UPLOAD (CLOUDINARY) ================= */

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      profileImage: preview,
    }));

    const form = new FormData();
    form.append("profileImage", file);

    try {
      setUploading(true);

      const res = await axios.post(
        `${API}/api/image/upload-profile-image`,
        form,
        {
          headers: {
            Authorization: authorizationToken,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setFormData((prev) => ({
        ...prev,
        profileImage: res.data.imageUrl,
      }));

      fetchProfile();
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ================= UPDATE PROFILE ================= */

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `${API}/api/auth/update-profile`,
        {
          name: formData.name,
          location: formData.location,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          address: formData.address,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          bio: formData.bio,
        },
        {
          headers: {
            Authorization: authorizationToken,
          },
        },
      );

      if (res.status === 200) {
        alert("Profile Updated");
        setEditMode(false);
        fetchProfile();
      }
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-lg space-y-8">
      {/* PROFILE IMAGE */}

      <div className="flex items-center gap-6">
        <img
          src={
            formData.profileImage
              ? formData.profileImage
              : `https://ui-avatars.com/api/?name=${formData.name}`
          }
          referrerPolicy="no-referrer"
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border"
        />

        {editMode && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        )}
      </div>

      {/* BASIC DETAILS */}

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
      </div>

      {/* LOCATION */}

      {editMode ? (
        <div className="space-y-4">
          <input
            type="text"
            value={locationQuery}
            placeholder="Search location"
            onChange={(e) => {
              const value = e.target.value;
              setLocationQuery(value);
              debouncedSearch(value);
            }}
            className="border rounded-lg px-4 py-3 w-full"
          />

          {suggestions.length > 0 && (
            <div className="border rounded-lg max-h-40 overflow-y-auto">
              {suggestions.map((place) => (
                <div
                  key={place.place_id}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      location: place.display_name,
                    }));

                    setLocationQuery(place.display_name);
                    setSuggestions([]);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {place.display_name}
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-2">
              Or pick exact location on map
            </p>

            <div className="h-72 rounded-xl overflow-hidden border">
              <MapPicker
                setCoordinates={setCoordinates}
                setLocation={(address) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: address,
                  }))
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium">Location</label>
          <p className="mt-1">{formData.location}</p>
        </div>
      )}

      {/* SKILLS */}

      <div>
        <label className="block text-sm font-medium">Skills</label>

        {editMode ? (
          <input
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills
              ?.split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill.length > 0)
              .map((skill, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* BIO */}

      <div>
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

      <div className="flex justify-end gap-4">
        {!editMode && !user?.googleId && (
          <button
            onClick={() => navigate("/change-password")}
            className="border border-blue-500 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50"
          >
            Change Password
          </button>
        )}

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
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Save
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
