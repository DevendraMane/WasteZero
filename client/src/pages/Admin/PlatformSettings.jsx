import React, { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import Loader from "../../components/Loader";

const PlatformSettings = () => {
  const { API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [API, authorizationToken]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/settings`, {
        headers: { Authorization: authorizationToken },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setMessage("Error loading settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setMessage("✓ Platform settings saved successfully");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("✗ Failed to save settings");
      }
    } catch (error) {
      console.error("Save failed:", error);
      setMessage("✗ Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!settings) {
    return (
      <div
        className={`flex items-center justify-center h-64 transition duration-300 ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <p className="text-red-500 text-lg">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div
      className={`space-y-10 transition duration-300 ${
        isDarkMode ? "bg-gray-900 min-h-screen p-4" : "bg-white"
      }`}
    >
      {/* HEADER */}
      <div>
        <h1
          className={`text-3xl font-semibold transition duration-300 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Platform Settings
        </h1>
        <p
          className={`mt-2 transition duration-300 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Configure global system behavior and administrative controls
        </p>
      </div>

      {/* GENERAL CONTROLS */}
      <div
        className={`p-6 rounded-xl shadow-sm space-y-6 transition duration-300 ${
          isDarkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-100"
        }`}
      >
        <h2
          className={`text-lg font-medium transition duration-300 ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          General Controls
        </h2>

        {[
          { label: "Allow New Registrations", field: "allowRegistrations" },
          { label: "Enable Pickup Requests", field: "allowPickups" },
          {
            label: "Enable Opportunities Creation",
            field: "allowOpportunities",
          },
        ].map((item) => (
          <div key={item.field} className="flex justify-between items-center">
            <span
              className={`text-sm transition duration-300 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {item.label}
            </span>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.field]}
                onChange={() => handleToggle(item.field)}
                className="sr-only"
              />
              <div
                className={`w-14 h-7 rounded-full transition ${
                  settings[item.field] ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition ${
                    settings[item.field] ? "translate-x-7" : "translate-x-1"
                  } mt-0.5`}
                ></div>
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* SYSTEM CONFIGURATION
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-lg font-medium text-gray-800">
          System Configuration
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Platform Name
          </label>
          <input
            type="text"
            name="platformName"
            value={settings.platformName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Support Email
          </label>
          <input
            type="email"
            name="supportEmail"
            value={settings.supportEmail}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>
      </div> */}

      {/* MAINTENANCE MODE */}
      <div
        className={`p-6 rounded-xl shadow-sm space-y-4 transition duration-300 ${
          isDarkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-100"
        }`}
      >
        <h2
          className={`text-lg font-medium transition duration-300 ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Maintenance Mode
        </h2>

        <div className="flex justify-between items-center">
          <span
            className={`text-sm transition duration-300 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Enable Maintenance Mode (Platform temporarily unavailable)
          </span>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={() => handleToggle("maintenanceMode")}
              className="sr-only"
            />
            <div
              className={`w-14 h-7 rounded-full transition ${
                settings.maintenanceMode ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition ${
                  settings.maintenanceMode ? "translate-x-7" : "translate-x-1"
                } mt-0.5`}
              ></div>
            </div>
          </label>
        </div>

        {settings.maintenanceMode && (
          <>
            <div
              className={`p-4 border rounded-lg transition duration-300 ${
                isDarkMode
                  ? "bg-yellow-900/20 border-yellow-700 text-yellow-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <p
                className={`text-sm font-semibold mb-2 transition duration-300 ${
                  isDarkMode ? "text-yellow-200" : "text-yellow-800"
                }`}
              >
                ⚠️ Maintenance Mode Active
              </p>
              <p
                className={`text-xs transition duration-300 ${
                  isDarkMode ? "text-yellow-300" : "text-yellow-700"
                }`}
              >
                Regular users will see this maintenance message and won't be
                able to access the platform. Only you (admin) can still access
                all features.
              </p>
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Maintenance Message (shown to users)
              </label>
              <textarea
                name="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={handleChange}
                rows="3"
                className={`w-full border rounded-lg px-4 py-2 transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    : "border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                }`}
                placeholder="Enter the message users will see during maintenance..."
              />
            </div>
          </>
        )}
      </div>

      {/* STATUS MESSAGE */}
      {message && (
        <div
          className={`p-4 rounded-lg transition duration-300 ${
            message.startsWith("✓")
              ? isDarkMode
                ? "bg-green-900 text-green-200"
                : "bg-green-100 text-green-800"
              : isDarkMode
                ? "bg-red-900 text-red-200"
                : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-white px-6 py-2 rounded-lg transition font-medium`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default PlatformSettings;
