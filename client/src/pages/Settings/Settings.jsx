import React, { useState } from "react";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const [darkMode, setDarkMode] = useState(false);

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm(
      "Are you sure you want to delete your account?",
    );

    if (confirm) {
      alert("Account deletion logic goes here");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-2">
          Manage your account preferences and configurations
        </p>
      </div>

      {/* NOTIFICATIONS */}
      <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">
        <h2 className="text-xl font-semibold">Notifications</h2>

        {["email", "sms", "push"].map((type) => (
          <div
            key={type}
            className="flex justify-between items-center border-b pb-4"
          >
            <div>
              <p className="font-medium capitalize">{type} Notifications</p>
              <p className="text-sm text-gray-500">
                Receive updates via {type}
              </p>
            </div>

            <button
              onClick={() => handleToggle(type)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                notifications[type]
                  ? "bg-green-500 justify-end"
                  : "bg-gray-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow"></div>
            </button>
          </div>
        ))}
      </div>

      {/* APPEARANCE */}
      <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">
        <h2 className="text-xl font-semibold">Appearance</h2>

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className="text-sm text-gray-500">
              Toggle dark theme (UI only demo)
            </p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
              darkMode
                ? "bg-green-500 justify-end"
                : "bg-gray-300 justify-start"
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow"></div>
          </button>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="bg-white p-8 rounded-2xl shadow-md space-y-6 border border-red-200">
        <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-gray-500">
              Permanently remove your account and data
            </p>
          </div>

          <button
            onClick={handleDeleteAccount}
            className="bg-red-100 text-red-600 px-6 py-2 rounded-lg hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
