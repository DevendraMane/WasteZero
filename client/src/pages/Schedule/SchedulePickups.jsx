import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import axios from "axios";
import debounce from "lodash.debounce";
import MapPicker from "../../components/MapPicker";
import { devError } from "../../utils/logger";
import { showError, showSuccess } from "../../utils/alert";

const PICKUP_BATCH_SIZE = 6;

const SchedulePickups = () => {
  const { API, authorizationToken, user } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [showForm, setShowForm] = useState(false);
  const [pickups, setPickups] = useState([]);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [editingPickup, setEditingPickup] = useState(null);
  const [submittingPickup, setSubmittingPickup] = useState(false);
  const [visiblePickupCount, setVisiblePickupCount] =
    useState(PICKUP_BATCH_SIZE);
  const loadMoreRef = useRef(null);

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

  /* LOCATION SEARCH */

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
      devError(err);
    }
  };

  const debouncedSearch = useMemo(() => debounce(searchLocation, 500), []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  /* FETCH PICKUPS */

  const fetchPickups = async () => {
    try {
      const res = await fetch(`${API}/api/pickups/volunteer`, {
        headers: { Authorization: authorizationToken },
      });

      const data = await res.json();

      if (res.ok) setPickups(data);
    } catch (err) {
      devError(err);
    }
  };

  useEffect(() => {
    if (user?.role === "volunteer") {
      fetchPickups();
    }
  }, [API, authorizationToken, user]);

  useEffect(() => {
    setVisiblePickupCount(PICKUP_BATCH_SIZE);
  }, [pickups.length]);

  const visiblePickups = pickups.slice(0, visiblePickupCount);
  const hasMorePickups = visiblePickupCount < pickups.length;

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMorePickups) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisiblePickupCount((prev) =>
            Math.min(prev + PICKUP_BATCH_SIZE, pickups.length),
          );
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMorePickups, pickups.length]);

  /* INPUT CHANGE */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* EDIT PICKUP */

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

  /* CREATE / UPDATE PICKUP */

  const handleSubmitPickup = async () => {
    if (submittingPickup) return;

    if (!formData.date || !formData.time || !formData.category) {
      showError("Please fill all fields");
      return;
    }

    const scheduled_time = new Date(`${formData.date}T${formData.time}`);

    setSubmittingPickup(true);

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
        showSuccess(editingPickup ? "Pickup updated" : "Pickup scheduled");

        setFormData({
          date: "",
          time: "",
          category: "",
          location: "",
        });

        setLocationQuery("");
      } else {
        showError("Failed to save pickup");
      }
    } catch (err) {
      devError(err);
      showError("Failed to save pickup");
    } finally {
      setSubmittingPickup(false);
    }
  };

  /* OPEN AGENT DETAILS */

  const openAgentDetails = (pickup) => {
    setSelectedPickup(pickup);
    setShowAgentModal(true);
  };

  /* PRINT RECEIPT */

  const printReceipt = () => {
    const printContents = document.getElementById("receipt").innerHTML;

    const newWindow = window.open("", "", "width=800,height=600");

    newWindow.document.write(`
      <html>
        <head>
          <title>Pickup Receipt</title>
          <style>
            body{font-family:Arial;padding:30px}
            h2{text-align:center}
            .row{margin:10px 0}
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}
          >
            Pickup Scheduling
          </h1>
          <p
            className={`mt-1 text-sm sm:text-base ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Schedule waste pickups and track collection status
          </p>
        </div>

        {user?.role === "volunteer" && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingPickup(null);
            }}
            className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition"
          >
            {showForm ? "Close Form" : "Schedule Pickup"}
          </button>
        )}
      </div>

      {/* FORM WITH ANIMATION */}

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          showForm ? "max-h-175 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`p-4 sm:p-6 rounded-2xl shadow-md grid md:grid-cols-2 gap-4 sm:gap-6 transition duration-300 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`px-4 py-2 rounded border transition duration-300 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />

          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`px-4 py-2 rounded border transition duration-300 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`px-4 py-2 rounded md:col-span-2 border transition duration-300 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
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
              className={`rounded-lg px-4 py-3 w-full border transition duration-300 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />

            {suggestions.length > 0 && (
              <div
                className={`rounded-lg max-h-40 overflow-y-auto border transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              >
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
                    className={`px-4 py-2 cursor-pointer transition duration-300 ${
                      isDarkMode
                        ? "hover:bg-gray-600 text-gray-300"
                        : "hover:bg-gray-100 text-gray-900"
                    }`}
                  >
                    {place.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MAP PICKER */}

          <div className="md:col-span-2">
            <p
              className={`text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Or pick exact pickup location on map
            </p>

            <div
              className={`h-52 sm:h-64 rounded-xl overflow-hidden border transition duration-300 ${
                isDarkMode ? "border-gray-600" : "border-gray-300"
              }`}
            >
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
              disabled={submittingPickup}
              className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submittingPickup ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : editingPickup ? (
                "Update Pickup"
              ) : (
                "Confirm Pickup"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PICKUP LIST */}

      <div
        className={`p-4 sm:p-6 rounded-2xl shadow-md transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Your Pickups
        </h2>

        {pickups.length === 0 ? (
          <div
            className={`text-center py-10 border border-dashed rounded-lg transition duration-300 ${
              isDarkMode
                ? "text-gray-400 border-gray-700 bg-gray-900"
                : "text-gray-400 border-gray-300 bg-white"
            }`}
          >
            No pickups scheduled yet
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {visiblePickups.map((pickup) => {
              const dateObj = new Date(pickup.scheduled_time);

              return (
                <div
                  key={pickup._id}
                  className={`rounded-xl p-3 sm:p-4 border space-y-3 transition duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`font-semibold leading-snug ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {pickup.category} Waste Pickup
                      </p>

                      <p
                        className={`text-sm mt-1 ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {dateObj.toLocaleDateString()} |{" "}
                        {dateObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {pickup.location && (
                        <p
                          className={`text-sm mt-1 wrap-break-word ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {pickup.location}
                        </p>
                      )}
                    </div>

                    {/* STATUS BADGE */}

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shrink-0
                      ${
                        pickup.status === "pending"
                          ? isDarkMode
                            ? "bg-yellow-900 text-yellow-200"
                            : "bg-yellow-100 text-yellow-700"
                          : pickup.status === "assigned"
                            ? isDarkMode
                              ? "bg-blue-900 text-blue-200"
                              : "bg-blue-100 text-blue-700"
                            : pickup.status === "in-progress"
                              ? isDarkMode
                                ? "bg-purple-900 text-purple-200"
                                : "bg-purple-100 text-purple-700"
                              : isDarkMode
                                ? "bg-green-900 text-green-200"
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
                      className={`text-sm font-medium hover:underline ${
                        isDarkMode ? "text-blue-300" : "text-blue-600"
                      }`}
                    >
                      Edit Pickup
                    </button>
                  )}

                  {/* AGENT INFO */}

                  {(pickup.status === "assigned" ||
                    pickup.status === "in-progress" ||
                    pickup.status === "completed") && (
                    <div
                      className={`p-3 rounded-lg text-sm space-y-1 ${
                        isDarkMode
                          ? "bg-gray-800 text-gray-300"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {pickup.agent_name && <p>Agent: {pickup.agent_name}</p>}

                      <button
                        onClick={() => openAgentDetails(pickup)}
                        className={`text-sm font-medium hover:underline ${
                          isDarkMode ? "text-green-300" : "text-green-600"
                        }`}
                      >
                        View Agent Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {hasMorePickups && (
              <div ref={loadMoreRef} className="py-3 text-center">
                <span
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Loading more pickups...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AGENT MODAL */}

      {showAgentModal && selectedPickup && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/30 z-50 p-3">
          <div
            className={`p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-md max-h-[85vh] overflow-y-auto ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-lg sm:text-xl font-semibold mb-4 text-center ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Pickup Receipt
            </h2>

            <div
              id="receipt"
              className={`space-y-2 text-sm ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              <p>
                <strong>Waste Type:</strong> {selectedPickup.category}
              </p>

              <p>
                <strong>Location:</strong> {selectedPickup.location}
              </p>

              <p>
                <strong>Status:</strong> {selectedPickup.status}
              </p>

              <p>
                <strong>Agent:</strong>{" "}
                {selectedPickup.agent_name || "Not Assigned"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {selectedPickup.agent_phone || "+91 9876543210"}
              </p>

              <p>
                <strong>Vehicle:</strong>{" "}
                {selectedPickup.agent_vehicle || "Waste Collection Van"}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedPickup.scheduled_time).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-6">
              <button
                onClick={printReceipt}
                className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Print Receipt
              </button>

              <button
                onClick={() => setShowAgentModal(false)}
                className={`w-full sm:w-auto px-4 py-2 rounded transition ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePickups;
