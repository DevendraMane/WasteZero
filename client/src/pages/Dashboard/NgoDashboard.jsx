import React from "react";
import { useNavigate } from "react-router-dom";

const NgoDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">NGO Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Manage opportunities, review applications, and engage volunteers
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Opportunities"
          value="24"
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          title="Active Opportunities"
          value="12"
          color="from-indigo-500 to-purple-600"
        />
        <StatCard
          title="Total Applications"
          value="86"
          color="from-orange-400 to-red-500"
        />
        <StatCard
          title="Approved Volunteers"
          value="40"
          color="from-pink-500 to-purple-600"
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/opportunities")}
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

      {/* RECENT OPPORTUNITIES */}
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
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3">Beach Cleanup Drive</td>
                <td className="py-3">Chennai</td>
                <td className="py-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Active
                  </span>
                </td>
                <td className="py-3">12</td>
              </tr>

              <tr className="border-b hover:bg-gray-50">
                <td className="py-3">E-Waste Collection</td>
                <td className="py-3">Bangalore</td>
                <td className="py-3">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    Ongoing
                  </span>
                </td>
                <td className="py-3">8</td>
              </tr>
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

/* Reusable Stat Card */
const StatCard = ({ title, value, color }) => {
  return (
    <div
      className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow-lg`}
    >
      <p className="text-sm opacity-80">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
};

export default NgoDashboard;
