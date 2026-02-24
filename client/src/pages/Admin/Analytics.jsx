import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Analytics = () => {
  const stats = {
    totalUsers: 124,
    totalNGOs: 18,
    totalPickups: 560,
    totalOpportunities: 73,
  };

  const monthlyData = [
    { month: "Jan", pickups: 40 },
    { month: "Feb", pickups: 65 },
    { month: "Mar", pickups: 90 },
    { month: "Apr", pickups: 75 },
    { month: "May", pickups: 110 },
  ];

  const userDistribution = [
    { name: "Volunteers", value: 80 },
    { name: "NGOs", value: 30 },
    { name: "Admins", value: 14 },
  ];

  const COLORS = ["#22c55e", "#6366f1", "#f59e0b"];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Platform Analytics</h1>
        <p className="text-gray-500 mt-2">
          Monitor system activity and performance metrics
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <p className="text-sm text-gray-500">Total Users</p>
          <h2 className="text-2xl font-bold mt-2">{stats.totalUsers}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <p className="text-sm text-gray-500">NGOs</p>
          <h2 className="text-2xl font-bold mt-2">{stats.totalNGOs}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <p className="text-sm text-gray-500">Total Pickups</p>
          <h2 className="text-2xl font-bold mt-2">{stats.totalPickups}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <p className="text-sm text-gray-500">Opportunities</p>
          <h2 className="text-2xl font-bold mt-2">
            {stats.totalOpportunities}
          </h2>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Monthly Pickup Activity
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pickups" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">User Distribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {userDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Recent System Activity</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-3">User</th>
              <th className="py-3">Action</th>
              <th className="py-3">Date</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="py-3">Ruthwik</td>
              <td className="py-3">Scheduled Pickup</td>
              <td className="py-3">Feb 20, 2026</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">Green NGO</td>
              <td className="py-3">Created Opportunity</td>
              <td className="py-3">Feb 21, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
