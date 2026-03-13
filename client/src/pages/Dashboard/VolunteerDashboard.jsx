import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import Loader from "../../components/Loader";

const VolunteerDashboard = () => {
  const { API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [applications, setApplications] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [totalActiveOpportunities, setTotalActiveOpportunities] = useState(0);

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

  /* ================= FETCH TOTAL ACTIVE OPPORTUNITIES ================= */
  useEffect(() => {
    const fetchTotalActiveOpportunities = async () => {
      try {
        // Large limit to compute accurate active count on the client.
        const res = await fetch(`${API}/api/opportunities?page=1&limit=10000`, {
          headers: { Authorization: authorizationToken },
        });

        const data = await res.json();

        if (res.ok) {
          const opportunities = data?.data || [];
          const now = new Date();
          const activeCount = opportunities.filter(
            (opp) => opp?.date && new Date(opp.date) >= now,
          ).length;
          setTotalActiveOpportunities(activeCount);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTotalActiveOpportunities();
  }, [API, authorizationToken]);

  const myActiveOpportunities = applications.filter(
    (app) =>
      app.status === "accepted" &&
      new Date(app.opportunity_id?.date) >= new Date(),
  );

  const completedPickups = pickups.filter(
    (pickup) => pickup.status === "completed",
  );

  if (loadingApps || loadingPickups) {
    return <Loader />;
  }

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
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Opportunities Joined */}
        <StatCard
          title="Opportunities Joined"
          value={applications.length}
          color="from-purple-500 to-pink-600"
          isLoading={loadingApps}
        />

        {/* Active Opportunities */}
        <StatCard
          title="Active Opportunities"
          value={totalActiveOpportunities}
          color="from-indigo-500 to-blue-600"
          isLoading={loadingApps}
        />

        {/* Pickup Scheduled */}
        <StatCard
          title="Pickup Scheduled"
          value={pickups.length}
          color="from-green-500 to-emerald-600"
          isLoading={loadingPickups}
        />

        {/* Pickup Completed */}
        <StatCard
          title="Pickup Completed"
          value={completedPickups.length}
          color="from-orange-400 to-red-500"
          isLoading={loadingPickups}
        />
      </div>

      <p
        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
      >
        My active opportunities: {myActiveOpportunities.length}
      </p>

      {/* ================= OPPORTUNITIES LIST ================= */}
      <div
        className={`p-4 sm:p-6 rounded-2xl shadow-md transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="mb-4 sm:mb-6 flex items-start sm:items-center justify-between gap-3">
          <div>
            <h2
              className={`text-lg sm:text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              My Joined Opportunities
            </h2>
            <p
              className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Track your applied and accepted opportunities in one place.
            </p>
          </div>

          <span
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
              isDarkMode
                ? "bg-gray-700 text-gray-200"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {applications.length} total
          </span>
        </div>

        {applications.length === 0 ? (
          <div
            className={`text-center py-8 border border-dashed rounded-xl transition duration-300 ${
              isDarkMode
                ? "text-gray-400 border-gray-700 bg-gray-700"
                : "text-gray-400 border-gray-300 bg-gray-50"
            }`}
          >
            You haven’t joined any opportunities yet
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {applications.map((app) => {
              const opp = app.opportunity_id;
              const isPast = opp?.date && new Date(opp.date) < new Date();

              return (
                <div
                  key={app._id}
                  className={`p-3 sm:p-4 rounded-xl border transition duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3
                        className={`font-semibold leading-snug ${isDarkMode ? "text-white" : "text-gray-800"}`}
                      >
                        {opp?.title || "Untitled Opportunity"}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full ${
                            isDarkMode
                              ? "bg-gray-600 text-gray-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {opp?.location || "Location not set"}
                        </span>

                        {opp?.duration && (
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full ${
                              isDarkMode
                                ? "bg-gray-600 text-gray-200"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {opp.duration}
                          </span>
                        )}

                        {opp?.date && (
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full ${
                              isDarkMode
                                ? "bg-gray-600 text-gray-200"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {new Date(opp.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isPast ? (
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
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
                  </div>
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

const StatCard = ({ title, value, color, isLoading }) => (
  <div
    className={`bg-linear-to-r ${color} text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md`}
  >
    <p className="text-xs sm:text-sm opacity-85 leading-tight">{title}</p>
    <h2 className="text-xl sm:text-2xl font-bold mt-1.5 sm:mt-2">
      {isLoading ? "..." : value}
    </h2>
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
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${styles}`}>
      {status}
    </span>
  );
};

export default VolunteerDashboard;
