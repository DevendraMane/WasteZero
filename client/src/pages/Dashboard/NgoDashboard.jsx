import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import CreateOpportunity from "../Opportunities/CreateOpportunity.jsx";

const NgoDashboard = () => {
  const navigate = useNavigate();
  const { API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();

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
  useEffect(() => {
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
    (opp) => new Date(opp.date) >= new Date(),
  );

  const approvedVolunteers = applications.filter(
    (app) => app.status === "accepted",
  );

  const getOpportunityStatus = (date) => {
    return new Date(date) < new Date() ? "closed" : "open";
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* HEADER */}
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}
        >
          NGO Dashboard
        </h1>
        <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Manage opportunities, review applications, and engage volunteers
        </p>
      </div>

      {/* ===================== STATS ===================== */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
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
      <div
        className={`p-4 sm:p-6 rounded-2xl shadow-md transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => setShowForm(true)}
            className={`transition p-4 rounded-xl font-medium text-sm sm:text-base ${
              isDarkMode
                ? "bg-green-900 hover:bg-green-800 text-green-200"
                : "bg-green-100 hover:bg-green-200 text-green-700"
            }`}
          >
            + Create New Opportunity
          </button>

          <button
            onClick={() => navigate("/opportunities")}
            className={`transition p-4 rounded-xl font-medium text-sm sm:text-base ${
              isDarkMode
                ? "bg-indigo-900 hover:bg-indigo-800 text-indigo-200"
                : "bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
            }`}
          >
            View All Opportunities
          </button>

          <button
            onClick={() => navigate("/applications")}
            className={`transition p-4 rounded-xl font-medium text-sm sm:text-base ${
              isDarkMode
                ? "bg-orange-900 hover:bg-orange-800 text-orange-200"
                : "bg-orange-100 hover:bg-orange-200 text-orange-700"
            }`}
          >
            Review Applications
          </button>
        </div>
      </div>

      {showForm && (
        <CreateOpportunity
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            setShowForm(false);
            await fetchOpportunities();
          }}
        />
      )}

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
              Recent Opportunities
            </h2>
            <p
              className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Latest 5 opportunities with status and application count.
            </p>
          </div>

          <span
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
              isDarkMode
                ? "bg-gray-700 text-gray-200"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {recentOpportunities.length} shown
          </span>
        </div>

        {recentOpportunities.length === 0 ? (
          <div
            className={`text-center py-8 border border-dashed rounded-xl ${
              isDarkMode
                ? "text-gray-400 border-gray-700 bg-gray-700"
                : "text-gray-400 border-gray-300 bg-gray-50"
            }`}
          >
            No opportunities created yet
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {recentOpportunities.map((opp) => {
                const status = getOpportunityStatus(opp.date);
                return (
                  <div
                    key={opp._id}
                    className={`rounded-xl p-4 border space-y-3 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className={`font-semibold leading-snug ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {opp.title}
                      </h3>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          status === "closed"
                            ? isDarkMode
                              ? "bg-red-900 text-red-200"
                              : "bg-red-100 text-red-600"
                            : isDarkMode
                              ? "bg-green-900 text-green-200"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`px-2.5 py-1 rounded-full ${
                          isDarkMode
                            ? "bg-gray-800 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {opp.location}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full ${
                          isDarkMode
                            ? "bg-gray-800 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {new Date(opp.date).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full ${
                          isDarkMode
                            ? "bg-indigo-900 text-indigo-200"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {applicationCountMap[opp._id] || 0} applications
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-190 text-left">
                <thead
                  className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
                >
                  <tr>
                    <th
                      className={`py-3 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      Title
                    </th>
                    <th
                      className={`py-3 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      Location
                    </th>
                    <th
                      className={`py-3 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      Date
                    </th>
                    <th
                      className={`py-3 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      Status
                    </th>
                    <th
                      className={`py-3 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      Applications
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOpportunities.map((opp) => {
                    const status = getOpportunityStatus(opp.date);
                    return (
                      <tr
                        key={opp._id}
                        className={`border-b transition ${
                          isDarkMode
                            ? "hover:bg-gray-700 border-gray-700"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        <td
                          className={`py-3 pr-3 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                        >
                          {opp.title}
                        </td>

                        <td
                          className={`py-3 pr-3 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                        >
                          {opp.location}
                        </td>

                        <td
                          className={`py-3 pr-3 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                        >
                          {new Date(opp.date).toLocaleDateString()}
                        </td>

                        <td className="py-3 pr-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              status === "closed"
                                ? isDarkMode
                                  ? "bg-red-900 text-red-200"
                                  : "bg-red-100 text-red-600"
                                : isDarkMode
                                  ? "bg-green-900 text-green-200"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td
                          className={`py-3 font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
                        >
                          {applicationCountMap[opp._id] || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/opportunities")}
            className={`hover:underline ${isDarkMode ? "text-green-400" : "text-green-600"}`}
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
    className={`bg-linear-to-r ${color} text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md`}
  >
    <p className="text-xs sm:text-sm opacity-85 leading-tight">{title}</p>
    <h2 className="text-xl sm:text-2xl font-bold mt-1.5 sm:mt-2">{value}</h2>
  </div>
);

export default NgoDashboard;
