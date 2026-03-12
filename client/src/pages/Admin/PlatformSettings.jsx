import React, { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";

const PlatformSettings = () => {
  const { API, authorizationToken } = useAuth();
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
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-lg">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Platform Settings
        </h1>
        <p className="text-gray-500 mt-2">
          Configure global system behavior and administrative controls
        </p>
      </div>

      {/* GENERAL CONTROLS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-lg font-medium text-gray-800">General Controls</h2>

        {[
          { label: "Allow New Registrations", field: "allowRegistrations" },
          { label: "Enable Pickup Requests", field: "allowPickups" },
          {
            label: "Enable Opportunities Creation",
            field: "allowOpportunities",
          },
        ].map((item) => (
          <div key={item.field} className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{item.label}</span>
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

      {/* MODERATION CONTROLS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-lg font-medium text-gray-800">
          Moderation Controls
        </h2>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">
            Enable Message Monitoring
          </span>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableMessageMonitoring}
              onChange={() => handleToggle("enableMessageMonitoring")}
              className="sr-only"
            />
            <div
              className={`w-14 h-7 rounded-full transition ${
                settings.enableMessageMonitoring
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition ${
                  settings.enableMessageMonitoring
                    ? "translate-x-7"
                    : "translate-x-1"
                } mt-0.5`}
              ></div>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Auto-Flag Threshold (Number of Reports)
          </label>
          <input
            type="number"
            name="autoFlagThreshold"
            value={settings.autoFlagThreshold}
            onChange={handleChange}
            className="w-32 border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-medium text-gray-800">Maintenance Mode</h2>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">
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
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold mb-2">
                ⚠️ Maintenance Mode Active
              </p>
              <p className="text-xs text-yellow-700">
                Regular users will see this maintenance message and won't be
                able to access the platform. Only you (admin) can still access
                all features.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Maintenance Message (shown to users)
              </label>
              <textarea
                name="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter the message users will see during maintenance..."
              />
            </div>
          </>
        )}
      </div>

      {/* STATUS MESSAGE */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.startsWith("✓")
              ? "bg-green-100 text-green-800"
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
