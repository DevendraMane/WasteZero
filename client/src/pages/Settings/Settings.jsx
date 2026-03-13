import React, { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";

const Settings = () => {
  const { user, API, token } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [notifications, setNotifications] = useState({
    email: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch user preferences on component mount
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        if (!token || !user) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/api/auth/user/preferences`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, [API, token, user]);

  const handleToggle = async (key) => {
    const updatedNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(updatedNotifications);

    // Save to backend
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/auth/user/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notifications: updatedNotifications,
        }),
      });

      if (res.ok) {
        setMessage("✓ Notification preferences updated");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await res.json();
        console.error("[PREFERENCES ERROR]", res.status, errorData);
        setMessage("✗ Failed to update preferences");
        // Revert the change
        setNotifications(notifications);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage("✗ Error saving preferences: " + error.message);
      setNotifications(notifications);
    } finally {
      setSaving(false);
    }
  };

  const handleDarkMode = async () => {
    toggleDarkMode();

    // Save to backend
    try {
      await fetch(`${API}/api/auth/user/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          darkMode: !isDarkMode,
        }),
      });
    } catch (error) {
      console.error("Error saving dark mode preference:", error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (confirm) {
      const finalConfirm = window.confirm(
        "This will permanently delete all your data. Continue?",
      );

      if (finalConfirm) {
        setSaving(true);
        try {
          const res = await fetch(`${API}/api/auth/user/delete-account`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            setMessage("✓ Account deleted successfully");
            // Clear all storage
            window.location.href = "/login";
            return;
          } else {
            const data = await res.json();
            setMessage(`✗ ${data.message || "Failed to delete account"}`);
          }
        } catch (error) {
          console.error("Error deleting account:", error);
          setMessage("✗ Error deleting account");
        } finally {
          setSaving(false);
        }
      }
    }
  };

  return (
    <div
      className={`max-w-4xl mx-auto space-y-8 transition duration-300 ${
        isDarkMode ? "bg-gray-900 min-h-screen p-8" : "p-8"
      }`}
    >
      {/* HEADER */}
      <div>
        <h1
          className={`text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Settings
        </h1>
        <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Manage your account preferences and configurations
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* NOTIFICATIONS */}
          <div
            className={`p-8 rounded-2xl shadow-md space-y-6 transition duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Notifications
            </h2>

            {["email"].map((type) => (
              <div
                key={type}
                className={`flex justify-between items-center border-b pb-4 ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div>
                  <p
                    className={`font-medium capitalize ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {type} Notifications
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Receive updates via {type}
                  </p>
                </div>

                <button
                  onClick={() => handleToggle(type)}
                  disabled={saving}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                    notifications[type]
                      ? "bg-green-500 justify-end"
                      : isDarkMode
                        ? "bg-gray-600 justify-start"
                        : "bg-gray-300 justify-start"
                  } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                </button>
              </div>
            ))}
          </div>

          {/* APPEARANCE */}
          <div
            className={`p-8 rounded-2xl shadow-md space-y-6 transition duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Appearance
            </h2>

            <div className="flex justify-between items-center">
              <div>
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Dark Mode
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Toggle dark theme
                </p>
              </div>

              <button
                onClick={handleDarkMode}
                disabled={saving}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                  isDarkMode
                    ? "bg-green-600 justify-end"
                    : "bg-gray-300 justify-start"
                } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow"></div>
              </button>
            </div>
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

          {/* DANGER ZONE */}
          {user && user.role !== "admin" && (
            <div
              className={`p-8 rounded-2xl shadow-md space-y-6 transition duration-300 ${
                isDarkMode
                  ? "bg-gray-800 border border-red-900"
                  : "bg-white border border-red-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                Danger Zone
              </h2>

              <div className="flex justify-between items-center">
                <div>
                  <p
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Delete Account
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Permanently remove your account and data
                  </p>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg transition duration-300 ${
                    isDarkMode
                      ? "bg-red-900 text-red-200 hover:bg-red-800"
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {saving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Settings;
