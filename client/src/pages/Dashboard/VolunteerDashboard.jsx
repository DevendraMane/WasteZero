import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";

const VolunteerDashboard = () => {
  const { API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [applications, setApplications] = useState([]);
  const [pickups, setPickups] = useState([]);

  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingPickups, setLoadingPickups] = useState(true);

  /* ================= FETCH APPLICATIONS ================= */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API}/api/applications/volunteer`, {
          headers: { Authorization: authorizationToken },
        });

        const data = await res.json();
        if (res.ok) setApplications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingApps(false);
      }
    };

    fetchApplications();
  }, [API, authorizationToken]);

  /* ================= FETCH PICKUPS ================= */
  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await fetch(`${API}/api/pickups/volunteer`, {
          headers: { Authorization: authorizationToken },
        });

        const data = await res.json();
        if (res.ok) setPickups(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPickups(false);
      }
    };

    fetchPickups();
  }, [API, authorizationToken]);

  const activeOpportunities = applications.filter(
    (app) =>
      app.status === "accepted" &&
      new Date(app.opportunity_id?.date) >= new Date(),
  );

  const completedPickups = pickups.filter(
    (pickup) => pickup.status === "completed",
  );

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* ================= HEADER ================= */}
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}
        >
          Volunteer Dashboard
        </h1>
        <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Manage your volunteering activities and waste pickups
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Opportunities Joined */}
        <StatCard
          title="Opportunities Joined"
          value={applications.length}
          color="from-purple-500 to-pink-600"
        />

        {/* Active Opportunities */}
        <StatCard
          title="Active Opportunities"
          value={activeOpportunities.length}
          color="from-indigo-500 to-blue-600"
        />

        {/* Pickup Scheduled */}
        <StatCard
          title="Pickup Scheduled"
          value={pickups.length}
          color="from-green-500 to-emerald-600"
        />

        {/* Pickup Completed */}
        <StatCard
          title="Pickup Completed"
          value={completedPickups.length}
          color="from-orange-400 to-red-500"
        />
      </div>

      {/* ================= OPPORTUNITIES LIST ================= */}
      <div
        className={`p-6 rounded-2xl shadow-md transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          My Joined Opportunities
        </h2>

        {loadingApps ? (
          <p className={isDarkMode ? "text-gray-400" : "text-gray-400"}>
            Loading...
          </p>
        ) : applications.length === 0 ? (
          <div
            className={`text-center py-8 border border-dashed rounded-lg transition duration-300 ${
              isDarkMode
                ? "text-gray-400 border-gray-700 bg-gray-700"
                : "text-gray-400 border-gray-300 bg-gray-50"
            }`}
          >
            You haven’t joined any opportunities yet
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const opp = app.opportunity_id;
              const isPast = opp?.date && new Date(opp.date) < new Date();

              return (
                <div
                  key={app._id}
                  className={`p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 border border-gray-600"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div>
                    <h3
                      className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {opp?.title}
                    </h3>

                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {opp?.location} • {opp?.duration}
                    </p>

                    {opp?.date && (
                      <p
                        className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        📅 {new Date(opp.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {isPast ? (
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        isDarkMode
                          ? "bg-red-900 text-red-200"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      Closed
                    </span>
                  ) : (
                    <StatusBadge
                      status={app.status}
                      date={opp?.date}
                      isDarkMode={isDarkMode}
                    />
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

/* ================= REUSABLE COMPONENTS ================= */

const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-linear-to-r ${color} text-white p-5 sm:p-6 rounded-2xl shadow-lg`}
  >
    <p className="text-sm opacity-80">{title}</p>
    <h2 className="text-2xl sm:text-3xl font-bold mt-2">{value}</h2>
  </div>
);

const StatusBadge = ({ status, date, isDarkMode }) => {
  const isPast = new Date(date) < new Date();

  if (isPast && status === "accepted") {
    return (
      <span
        className={`text-xs px-3 py-1 rounded-full ${
          isDarkMode ? "bg-gray-600 text-gray-200" : "bg-gray-200 text-gray-600"
        }`}
      >
        Completed
      </span>
    );
  }

  const styles =
    status === "accepted"
      ? isDarkMode
        ? "bg-green-900 text-green-200"
        : "bg-green-100 text-green-700"
      : status === "rejected"
        ? isDarkMode
          ? "bg-red-900 text-red-200"
          : "bg-red-100 text-red-700"
        : isDarkMode
          ? "bg-yellow-900 text-yellow-200"
          : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles}`}>{status}</span>
  );
};

export default VolunteerDashboard;
