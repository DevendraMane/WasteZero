import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../store/DarkModeContext";

const NOTIFICATION_BATCH_SIZE = 8;

const Notifications = () => {
  const { API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [notifications, setNotifications] = useState([]);
  const [visibleCount, setVisibleCount] = useState(NOTIFICATION_BATCH_SIZE);
  const loadMoreRef = useRef(null);
  const navigate = useNavigate();

  const iconMap = {
    opportunity: "🌱",
    pickup: "🚚",
    message: "💬",
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: authorizationToken },
      });

      const data = await res.json();
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
          ? data.notifications
          : [];

      setNotifications(normalized);
    } catch {
      setNotifications([]);
    }
  };

  const markSingleRead = async (id) => {
    await fetch(`${API}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: authorizationToken },
    });

    setNotifications((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map((n) => (n._id === id ? { ...n, read: true } : n));
    });
  };

  const markAllRead = async () => {
    await fetch(`${API}/api/notifications/read`, {
      method: "PATCH",
      headers: { Authorization: authorizationToken },
    });

    setNotifications((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map((n) => ({ ...n, read: true }));
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    setVisibleCount(NOTIFICATION_BATCH_SIZE);
  }, [notifications.length]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.read !== b.read) return Number(a.read) - Number(b.read);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [notifications]);

  const visibleNotifications = sortedNotifications.slice(0, visibleCount);
  const hasMore = visibleCount < sortedNotifications.length;

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(
              prev + NOTIFICATION_BATCH_SIZE,
              sortedNotifications.length,
            ),
          );
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, sortedNotifications.length]);

  const hasVisibleNew = visibleNotifications.some((n) => !n.read);
  const hasVisibleOld = visibleNotifications.some((n) => n.read);

  return (
    <div
      className={`max-w-3xl mx-auto p-8 transition duration-300 min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <h1
          className={`text-2xl font-semibold transition duration-300 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Notifications
        </h1>

        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className={`text-sm transition duration-300 ${
              isDarkMode
                ? "text-green-400 hover:text-green-300 hover:underline"
                : "text-green-600 hover:underline"
            }`}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* EMPTY STATE */}

      {visibleNotifications.length === 0 && notifications.length === 0 && (
        <div
          className={`text-center py-20 transition duration-300 ${
            isDarkMode ? "text-gray-400" : "text-gray-400"
          }`}
        >
          <div className="text-5xl mb-3">🔔</div>

          <p
            className={`text-lg font-medium transition duration-300 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            You're all caught up!
          </p>

          <p
            className={`text-sm mt-1 transition duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-400"
            }`}
          >
            No new notifications right now.
          </p>
        </div>
      )}

      {/* NEW NOTIFICATIONS */}

      {hasVisibleNew && (
        <>
          <h2
            className={`text-sm font-semibold mb-3 transition duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            New
          </h2>

          {visibleNotifications
            .filter((n) => !n.read)
            .map((n) => (
              <div
                key={n._id}
                className={`flex justify-between items-center p-4 rounded-xl mb-3 transition duration-300 ${
                  isDarkMode
                    ? "bg-green-900/20 border border-green-700 hover:bg-green-900/40"
                    : "bg-green-50 border border-green-300 hover:bg-green-100"
                }`}
              >
                <div
                  onClick={() => navigate(n.link)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {/* ICON */}
                  <div className="text-xl">{iconMap[n.type] || "🔔"}</div>

                  {/* MESSAGE */}
                  <div>
                    <p
                      className={`text-sm font-medium transition duration-300 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {n.message}
                    </p>

                    <span
                      className={`text-xs transition duration-300 ${
                        isDarkMode ? "text-gray-400" : "text-gray-400"
                      }`}
                    >
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => markSingleRead(n._id)}
                  className={`text-xs transition duration-300 ${
                    isDarkMode
                      ? "text-green-400 hover:text-green-300 hover:underline"
                      : "text-green-600 hover:underline"
                  }`}
                >
                  Mark read
                </button>
              </div>
            ))}
        </>
      )}

      {/* EARLIER */}

      {hasVisibleOld && (
        <>
          <h2
            className={`text-sm font-semibold mt-8 mb-3 transition duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Earlier
          </h2>

          {visibleNotifications
            .filter((n) => n.read)
            .map((n) => (
              <div
                key={n._id}
                onClick={() => navigate(n.link)}
                className={`flex items-center gap-3 border p-4 rounded-xl mb-3 cursor-pointer transition duration-300 ${
                  isDarkMode
                    ? "border-gray-700 hover:bg-gray-800"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* ICON */}
                <div className="text-xl">{iconMap[n.type] || "🔔"}</div>

                {/* MESSAGE */}
                <div>
                  <p
                    className={`text-sm transition duration-300 ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {n.message}
                  </p>

                  <span
                    className={`text-xs transition duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
        </>
      )}

      {hasMore && (
        <div ref={loadMoreRef} className="py-6 text-center">
          <span
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Loading more notifications...
          </span>
        </div>
      )}
    </div>
  );
};

export default Notifications;
