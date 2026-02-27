import React, { useState } from "react";

const PlatformSettings = () => {
  const [settings, setSettings] = useState({
    allowRegistrations: true,
    allowPickups: true,
    allowOpportunities: true,
    autoFlagThreshold: 3,
    enableMessageMonitoring: true,
    maintenanceMode: false,
    platformName: "WasteZero",
    supportEmail: "support@wastezero.com",
  });

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

  const handleSave = () => {
    alert("Platform settings saved successfully.");
  };

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
            <button
              onClick={() => handleToggle(item.field)}
              className={`px-4 py-1 rounded-full text-sm ${
                settings[item.field]
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {settings[item.field] ? "Enabled" : "Disabled"}
            </button>
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
          <button
            onClick={() => handleToggle("enableMessageMonitoring")}
            className={`px-4 py-1 rounded-full text-sm ${
              settings.enableMessageMonitoring
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {settings.enableMessageMonitoring ? "Enabled" : "Disabled"}
          </button>
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

      {/* SYSTEM CONFIGURATION */}
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
      </div>

      {/* MAINTENANCE MODE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-medium text-gray-800">Maintenance Mode</h2>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">
            Enable Maintenance Mode (Platform temporarily unavailable)
          </span>
          <button
            onClick={() => handleToggle("maintenanceMode")}
            className={`px-4 py-1 rounded-full text-sm ${
              settings.maintenanceMode
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {settings.maintenanceMode ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PlatformSettings;
