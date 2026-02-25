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

const AdminDashboard = () => {
  // Bar chart data
  const barData = [
    { month: "Jan", pickups: 40 },
    { month: "Feb", pickups: 60 },
    { month: "Mar", pickups: 50 },
    { month: "Apr", pickups: 80 },
    { month: "May", pickups: 70 },
  ];

  // Pie chart data
  const pieData = [
    { name: "Volunteers", value: 60 },
    { name: "NGOs", value: 25 },
    { name: "Admins", value: 15 },
  ];

  const COLORS = ["#22c55e", "#6366f1", "#f59e0b"];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Manage platform users, monitor activity, and generate reports
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Total Users</p>
          <h2 className="text-3xl font-bold mt-2">104</h2>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Completed Pickups</p>
          <h2 className="text-3xl font-bold mt-2">1,839</h2>
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Pending Pickups</p>
          <h2 className="text-3xl font-bold mt-2">245</h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Active Opportunities</p>
          <h2 className="text-3xl font-bold mt-2">56</h2>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Monthly Pickups</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
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
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
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

      {/* REPORTS SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Generate Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-gray-100 hover:bg-green-100 transition p-3 rounded-xl font-medium">
            Users Report
          </button>
          <button className="bg-gray-100 hover:bg-green-100 transition p-3 rounded-xl font-medium">
            Pickups Report
          </button>
          <button className="bg-gray-100 hover:bg-green-100 transition p-3 rounded-xl font-medium">
            Opportunities Report
          </button>
          <button className="bg-gray-100 hover:bg-green-100 transition p-3 rounded-xl font-medium">
            Full Activity Report
          </button>
        </div>
      </div>

      {/* USERS SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Users</h2>

        <input
          type="text"
          placeholder="Search users..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
        />

        <div className="text-gray-400 text-center py-10 border border-dashed rounded-lg">
          No users found
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
