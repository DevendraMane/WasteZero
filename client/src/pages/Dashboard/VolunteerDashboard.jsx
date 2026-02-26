import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";

const VolunteerDashboard = () => {
  const { API, authorizationToken } = useAuth();

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
    (app) => app.status !== "rejected",
  );

  const completedPickups = pickups.filter(
    (pickup) => pickup.status === "completed",
  );

  return (
    <div className="space-y-10">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Volunteer Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your volunteering activities and waste pickups
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">My Joined Opportunities</h2>

        {loadingApps ? (
          <p className="text-gray-400">Loading...</p>
        ) : applications.length === 0 ? (
          <div className="text-gray-400 text-center py-8 border border-dashed rounded-lg">
            You haven’t joined any opportunities yet
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-4 border rounded-xl flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {app.opportunity_id?.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {app.opportunity_id?.location} •{" "}
                    {app.opportunity_id?.duration}
                  </p>
                </div>

                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow-lg`}
  >
    <p className="text-sm opacity-80">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles =
    status === "accepted"
      ? "bg-green-100 text-green-700"
      : status === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles}`}>{status}</span>
  );
};

export default VolunteerDashboard;
