import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

const Analytics = () => {
  const stats = {
    totalUsers: 124,
    totalNGOs: 18,
    totalPickups: 560,
    completedPickups: 420,
    totalOpportunities: 73,
  };

  const completionRate = Math.round(
    (stats.completedPickups / stats.totalPickups) * 100,
  );

  const monthlyPickupData = [
    { month: "Jan", pickups: 40 },
    { month: "Feb", pickups: 65 },
    { month: "Mar", pickups: 90 },
    { month: "Apr", pickups: 75 },
    { month: "May", pickups: 110 },
  ];

  const userGrowthData = [
    { month: "Jan", users: 20 },
    { month: "Feb", users: 40 },
    { month: "Mar", users: 70 },
    { month: "Apr", users: 95 },
    { month: "May", users: 124 },
  ];

  const userDistribution = [
    { name: "Volunteers", value: 80 },
    { name: "NGOs", value: 30 },
    { name: "Admins", value: 14 },
  ];

  const COLORS = ["#16a34a", "#4f46e5", "#f59e0b"];

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Reports & Analytics
        </h1>
        <p className="text-gray-500 mt-2">
          In-depth system performance and growth insights
        </p>
      </div>

      {/* DATE RANGE FILTER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-800">
            Date Range Filter
          </h3>
          <button className="text-sm text-gray-500 hover:text-gray-800">
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              From Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              To Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <button className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium">
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: "Total Users", value: stats.totalUsers },
          { label: "Active NGOs", value: stats.totalNGOs },
          { label: "Total Pickups", value: stats.totalPickups },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            highlight: true,
          },
          { label: "Opportunities", value: stats.totalOpportunities },
        ].map((card, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <h2
              className={`text-2xl font-semibold mt-3 ${
                card.highlight ? "text-green-600" : "text-gray-900"
              }`}
            >
              {card.value}
            </h2>
          </div>
        ))}
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PICKUP TREND */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-6">
            Pickup Trend Analysis
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPickupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pickups" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* USER GROWTH */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-6">
            User Growth Over Time
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROLE DISTRIBUTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-6">
          User Role Distribution
        </h3>

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
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* EXPORT SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-6">
          Export Reports
        </h3>

        <div className="flex flex-wrap gap-4">
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            Export Users CSV
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            Export Pickups CSV
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Download Full Report (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
