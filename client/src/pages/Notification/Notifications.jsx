import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const { API, authorizationToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const iconMap = {
    opportunity: "🌱",
    pickup: "🚚",
    message: "💬",
  };

  const fetchNotifications = async () => {
    const res = await fetch(`${API}/api/notifications`, {
      headers: { Authorization: authorizationToken },
    });

    const data = await res.json();
    setNotifications(data);
  };

  const markSingleRead = async (id) => {
    await fetch(`${API}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: authorizationToken },
    });

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = async () => {
    await fetch(`${API}/api/notifications/read`, {
      method: "PATCH",
      headers: { Authorization: authorizationToken },
    });

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const newNotifications = notifications.filter((n) => !n.read);
  const oldNotifications = notifications.filter((n) => n.read);

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Notifications</h1>

        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-green-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* EMPTY STATE */}

      {newNotifications.length === 0 && notifications.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔔</div>

          <p className="text-lg font-medium text-gray-600">
            You're all caught up!
          </p>

          <p className="text-sm text-gray-400 mt-1">
            No new notifications right now.
          </p>
        </div>
      )}

      {/* NEW NOTIFICATIONS */}

      {newNotifications.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">New</h2>

          {newNotifications.map((n) => (
            <div
              key={n._id}
              className="flex justify-between items-center bg-green-50 border border-green-300 p-4 rounded-xl mb-3 hover:bg-green-100 transition"
            >
              <div
                onClick={() => navigate(n.link)}
                className="flex items-center gap-3 cursor-pointer"
              >
                {/* ICON */}
                <div className="text-xl">{iconMap[n.type] || "🔔"}</div>

                {/* MESSAGE */}
                <div>
                  <p className="text-sm font-medium">{n.message}</p>

                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => markSingleRead(n._id)}
                className="text-xs text-green-600 hover:underline"
              >
                Mark read
              </button>
            </div>
          ))}
        </>
      )}

      {/* EARLIER */}

      {oldNotifications.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 mt-8 mb-3">
            Earlier
          </h2>

          {oldNotifications.map((n) => (
            <div
              key={n._id}
              onClick={() => navigate(n.link)}
              className="flex items-center gap-3 border p-4 rounded-xl mb-3 cursor-pointer hover:bg-gray-50 transition"
            >
              {/* ICON */}
              <div className="text-xl">{iconMap[n.type] || "🔔"}</div>

              {/* MESSAGE */}
              <div>
                <p className="text-sm">{n.message}</p>

                <span className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Notifications;
