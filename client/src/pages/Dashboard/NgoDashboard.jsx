import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import CreateOpportunity from "../Opportunities/CreateOpportunity.jsx";

const NgoDashboard = () => {
  const navigate = useNavigate();
  const { API, authorizationToken } = useAuth();

  const [showForm, setShowForm] = useState(false);

  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);

  const applicationCountMap = {};

  applications.forEach((app) => {
    const oppId = app.opportunity_id?._id;
    if (oppId) {
      applicationCountMap[oppId] = (applicationCountMap[oppId] || 0) + 1;
    }
  });

  const recentOpportunities = opportunities.slice(0, 5);
  /* ================= FETCH NGO OPPORTUNITIES ================= */
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await fetch(`${API}/api/opportunities/ngo/my`, {
          headers: { Authorization: authorizationToken },
        });

        const data = await res.json();
        if (res.ok) setOpportunities(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOpportunities();
  }, [API, authorizationToken]);

  /* ================= FETCH NGO APPLICATIONS ================= */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API}/api/applications/ngo`, {
          headers: { Authorization: authorizationToken },
        });

        const data = await res.json();
        if (res.ok) setApplications(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchApplications();
  }, [API, authorizationToken]);

  /* ================= CALCULATIONS ================= */
  const activeOpportunities = opportunities.filter(
    (opp) => opp.status === "open" || opp.status === "active",
  );

  const approvedVolunteers = applications.filter(
    (app) => app.status === "accepted",
  );

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">NGO Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Manage opportunities, review applications, and engage volunteers
        </p>
      </div>

      {/* ===================== STATS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Opportunities"
          value={opportunities.length}
          color="from-green-500 to-emerald-600"
        />

        <StatCard
          title="Active Opportunities"
          value={activeOpportunities.length}
          color="from-indigo-500 to-purple-600"
        />

        <StatCard
          title="Total Applications"
          value={applications.length}
          color="from-orange-400 to-red-500"
        />

        <StatCard
          title="Approved Volunteers"
          value={approvedVolunteers.length}
          color="from-pink-500 to-purple-600"
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-100 hover:bg-green-200 transition p-5 rounded-xl font-medium text-green-700"
          >
            + Create New Opportunity
          </button>

          <button
            onClick={() => navigate("/opportunities")}
            className="bg-indigo-100 hover:bg-indigo-200 transition p-5 rounded-xl font-medium text-indigo-700"
          >
            View All Opportunities
          </button>

          <button
            onClick={() => navigate("/applications")}
            className="bg-orange-100 hover:bg-orange-200 transition p-5 rounded-xl font-medium text-orange-700"
          >
            Review Applications
          </button>
        </div>
      </div>

      {showForm && (
        <CreateOpportunity
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            window.location.reload(); // simple refresh
          }}
        />
      )}

      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Recent Opportunities</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="py-3">Title</th>
                <th className="py-3">Location</th>
                <th className="py-3">Status</th>
                <th className="py-3">Applications</th>
              </tr>
            </thead>

            <tbody>
              {recentOpportunities.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-400">
                    No opportunities created yet
                  </td>
                </tr>
              ) : (
                recentOpportunities.map((opp) => (
                  <tr key={opp._id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{opp.title}</td>

                    <td className="py-3">{opp.location}</td>

                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          opp.status === "open" || opp.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {opp.status || "open"}
                      </span>
                    </td>

                    <td className="py-3">
                      {applicationCountMap[opp._id] || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/opportunities")}
            className="text-green-600 hover:underline"
          >
            View All Opportunities →
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow-lg`}
  >
    <p className="text-sm opacity-80">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

export default NgoDashboard;
