import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../store/AuthContext";
import axios from "axios";
import debounce from "lodash.debounce";
import MapPicker from "../../components/MapPicker";

const SchedulePickups = () => {
  const { API, authorizationToken, user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [pickups, setPickups] = useState([]);

  const [editingPickup, setEditingPickup] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    category: "",
    location: "",
  });

  const [coordinates, setCoordinates] = useState({
    lat: null,
    lng: null,
  });

  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

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

  /* ================= FETCH PICKUPS ================= */

  const fetchPickups = async () => {
    try {
      const res = await fetch(`${API}/api/pickups/volunteer`, {
        headers: { Authorization: authorizationToken },
      });

      const data = await res.json();

      if (res.ok) setPickups(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user?.role === "volunteer") {
      fetchPickups();
    }
  }, [API, authorizationToken, user]);

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= EDIT PICKUP ================= */

  const handleEditPickup = (pickup) => {
    const dateObj = new Date(pickup.scheduled_time);

    setFormData({
      date: dateObj.toISOString().split("T")[0],
      time: dateObj.toTimeString().slice(0, 5),
      category: pickup.category,
      location: pickup.location || "",
    });

    setLocationQuery(pickup.location || "");

    setCoordinates({
      lat: pickup.latitude || null,
      lng: pickup.longitude || null,
    });

    setEditingPickup(pickup._id);
    setShowForm(true);
  };

  /* ================= CREATE / UPDATE PICKUP ================= */

  const handleSubmitPickup = async () => {
    if (!formData.date || !formData.time || !formData.category) {
      alert("Please fill all fields");
      return;
    }

    const scheduled_time = new Date(`${formData.date}T${formData.time}`);

    try {
      const url = editingPickup
        ? `${API}/api/pickups/${editingPickup}`
        : `${API}/api/pickups`;

      const method = editingPickup ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify({
          category: formData.category,
          scheduled_time,
          location: formData.location,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        }),
      });

      if (res.ok) {
        fetchPickups();

        setShowForm(false);
        setEditingPickup(null);

        setFormData({
          date: "",
          time: "",
          category: "",
          location: "",
        });

        setLocationQuery("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Pickup Scheduling
          </h1>
          <p className="text-gray-500 mt-1">
            Schedule waste pickups and track collection status
          </p>
        </div>

        {user?.role === "volunteer" && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingPickup(null);
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            {showForm ? "Close Form" : "Schedule Pickup"}
          </button>
        )}
      </div>

      {/* CREATE / EDIT FORM */}

      {showForm && user?.role === "volunteer" && (
        <div className="bg-white p-8 rounded-2xl shadow-md grid md:grid-cols-2 gap-6">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border px-4 py-2 rounded"
          />

          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="border px-4 py-2 rounded"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border px-4 py-2 rounded md:col-span-2"
          >
            <option value="">Select Waste Type</option>
            <option value="Plastic">Plastic</option>
            <option value="E-Waste">E-Waste</option>
            <option value="Organic">Organic</option>
            <option value="Metal">Metal</option>
          </select>

          {/* LOCATION SEARCH */}

          <div className="md:col-span-2 space-y-3">
            <input
              type="text"
              placeholder="Search pickup location"
              value={locationQuery}
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
          </div>

          {/* MAP PICKER */}

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-2">
              Or pick exact pickup location on map
            </p>

            <div className="h-64 rounded-xl overflow-hidden border">
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

          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={handleSubmitPickup}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              {editingPickup ? "Update Pickup" : "Confirm Pickup"}
            </button>
          </div>
        </div>
      )}

      {/* PICKUP LIST */}

      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Your Pickups</h2>

        {pickups.length === 0 ? (
          <div className="text-gray-400 text-center py-10 border border-dashed rounded-lg">
            No pickups scheduled yet
          </div>
        ) : (
          <div className="space-y-4">
            {pickups.map((pickup) => {
              const dateObj = new Date(pickup.scheduled_time);

              return (
                <div key={pickup._id} className="border-b pb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {pickup.category} Waste Pickup
                      </p>

                      <p className="text-sm text-gray-500">
                        📅 {dateObj.toLocaleDateString()} | ⏱{" "}
                        {dateObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {pickup.location && (
                        <p className="text-sm text-gray-500">
                          📍 {pickup.location}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
  ${
    pickup.status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : pickup.status === "assigned"
        ? "bg-blue-100 text-blue-700"
        : pickup.status === "in-progress"
          ? "bg-purple-100 text-purple-700"
          : "bg-green-100 text-green-700"
  }`}
                    >
                      {pickup.status}
                    </span>
                  </div>

                  {/* EDIT BUTTON */}

                  {pickup.status === "pending" && (
                    <button
                      onClick={() => handleEditPickup(pickup)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Edit Pickup
                    </button>
                  )}

                  {(pickup.status === "assigned" ||
                    pickup.status === "in-progress" ||
                    pickup.status === "completed") && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 space-y-1">
                      {pickup.agent_name && (
                        <p>🚚 Agent: {pickup.agent_name}</p>
                      )}

                      {pickup.agent_phone && (
                        <p>📞 Contact: {pickup.agent_phone}</p>
                      )}

                      {pickup.agent_vehicle && (
                        <p>🚛 Vehicle: {pickup.agent_vehicle}</p>
                      )}

                      <p
                        className={`font-medium
        ${
          pickup.status === "assigned"
            ? "text-blue-700"
            : pickup.status === "in-progress"
              ? "text-purple-700"
              : "text-green-700"
        }
      `}
                      >
                        {pickup.status === "assigned" &&
                          "An agent has been assigned for your pickup. Please be available at the scheduled time."}

                        {pickup.status === "in-progress" &&
                          "The agent is currently collecting your waste."}

                        {pickup.status === "completed" &&
                          "Your waste pickup has been successfully completed. Thank you for contributing to WasteZero!"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePickups;
