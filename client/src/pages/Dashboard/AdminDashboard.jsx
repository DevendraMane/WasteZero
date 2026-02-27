import React from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

  // Dummy recent activity (connect later to AdminLogs API)
  const recentActivity = [
    { id: 1, action: "Suspended User #12", time: "2 hours ago" },
    { id: 2, action: "Deleted Opportunity #8", time: "Yesterday" },
    { id: 3, action: "Updated Pickup #4", time: "3 days ago" },
  ];

  // Dummy recent users preview
  const recentUsers = [
    { id: 1, name: "Rahul Kumar", role: "Volunteer" },
    { id: 2, name: "Green Earth NGO", role: "NGO" },
    { id: 3, name: "Admin Roshan", role: "Admin" },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Overview of platform performance and recent activity
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          onClick={() => navigate("/admin/users")}
          className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          <p className="text-sm opacity-80">Total Users</p>
          <h2 className="text-3xl font-bold mt-2">104</h2>
        </div>

        <div
          onClick={() => navigate("/admin/pickups")}
          className="cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          <p className="text-sm opacity-80">Completed Pickups</p>
          <h2 className="text-3xl font-bold mt-2">1,839</h2>
        </div>

        <div
          onClick={() => navigate("/admin/pickups")}
          className="cursor-pointer bg-gradient-to-r from-orange-400 to-red-500 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          <p className="text-sm opacity-80">Pending Pickups</p>
          <h2 className="text-3xl font-bold mt-2">245</h2>
        </div>

        <div
          onClick={() => navigate("/admin/opportunities")}
          className="cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          <p className="text-sm opacity-80">Active Opportunities</p>
          <h2 className="text-3xl font-bold mt-2">56</h2>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

      {/* RECENT ADMIN ACTIVITY */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Recent Admin Activity</h2>

        <ul className="space-y-3">
          {recentActivity.map((item) => (
            <li key={item.id} className="flex justify-between border-b pb-2">
              <span className="text-gray-700">{item.action}</span>
              <span className="text-sm text-gray-400">{item.time}</span>
            </li>
          ))}
        </ul>
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

      {/* USERS OVERVIEW SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Users Overview</h2>
          <button
            onClick={() => navigate("/admin/users")}
            className="text-green-600 font-medium hover:underline"
          >
            View All Users
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search users..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
        />

        {/* Recent Registrations */}
        <h3 className="text-sm font-semibold text-gray-500 mb-4">
          Recent Registrations
        </h3>

        <div className="space-y-3">
          {[
            { name: "Rahul Kumar", role: "Volunteer", time: "2 hours ago" },
            { name: "Green Earth NGO", role: "NGO", time: "Yesterday" },
            { name: "Sneha Reddy", role: "Volunteer", time: "3 days ago" },
          ].map((user, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-400">{user.time}</p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  user.role === "Admin"
                    ? "bg-purple-100 text-purple-600"
                    : user.role === "NGO"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-green-100 text-green-600"
                }`}
              >
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
