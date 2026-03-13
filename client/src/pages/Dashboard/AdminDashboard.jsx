import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
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
  const { API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/api/admin/dashboard-stats`, {
          headers: { Authorization: authorizationToken },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API, authorizationToken]);

  const COLORS = ["#22c55e", "#6366f1", "#f59e0b", "#ef4444"];

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p
          className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Loading dashboard...
        </p>
      </div>
    );
  }

  const barData = stats?.barData || [];
  const pieData = stats?.pieData || [];
  const recentUsers = stats?.recentUsers || [];
  const filteredUsers = recentUsers.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* HEADER */}
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}
        >
          Admin Dashboard
        </h1>
        <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Overview of platform performance and recent activity
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div
          onClick={() => navigate("/admin/users")}
          className="cursor-pointer bg-linear-to-r from-indigo-500 to-purple-600 text-white p-5 sm:p-6 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          <p className="text-sm opacity-80">Total Users</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            {stats?.totalUsers ?? 0}
          </h2>
        </div>

        <div
          onClick={() => navigate("/admin/pickups")}
          className="cursor-pointer bg-linear-to-r from-pink-500 to-purple-600 text-white p-5 sm:p-6 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          <p className="text-sm opacity-80">Completed Pickups</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            {stats?.completedPickups?.toLocaleString() ?? 0}
          </h2>
        </div>

        <div
          onClick={() => navigate("/admin/pickups")}
          className="cursor-pointer bg-linear-to-r from-orange-400 to-red-500 text-white p-5 sm:p-6 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          <p className="text-sm opacity-80">Pending Pickups</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            {stats?.pendingPickups?.toLocaleString() ?? 0}
          </h2>
        </div>

        <div
          onClick={() => navigate("/admin/opportunities")}
          className="cursor-pointer bg-linear-to-r from-green-500 to-emerald-600 text-white p-5 sm:p-6 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          <p className="text-sm opacity-80">Active Opportunities</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            {stats?.activeOpportunities ?? 0}
          </h2>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <div
          className={`p-6 rounded-2xl shadow-md transition duration-300 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Monthly Pickups
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pickups" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-20">
              No pickup data yet
            </p>
          )}
        </div>

        <div
          className={`p-6 rounded-2xl shadow-md transition duration-300 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Monthly Opportunities
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="opportunities"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-20">
              No opportunity data yet
            </p>
          )}
        </div>
      </div>

      <div
        className={`p-6 rounded-2xl shadow-md transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          User Distribution
        </h3>
        {pieData.length > 0 ? (
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
        ) : (
          <p className="text-gray-400 text-center py-20">No user data yet</p>
        )}
      </div>

      {/* USERS OVERVIEW SECTION */}
      <div
        className={`p-6 rounded-2xl shadow-md transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2
            className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Users Overview
          </h2>
          <button
            onClick={() => navigate("/admin/users")}
            className={`font-medium hover:underline ${isDarkMode ? "text-green-400" : "text-green-600"}`}
          >
            View All Users
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 mb-6 transition duration-300 ${
            isDarkMode
              ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
              : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
          }`}
        />

        {/* Recent Registrations */}
        <h3
          className={`text-sm font-semibold mb-4 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Recent Registrations
        </h3>

        <div className="space-y-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className={`flex justify-between items-center border-b pb-2 ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div>
                  <p
                    className={`font-medium ${isDarkMode ? "text-white" : "text-gray-700"}`}
                  >
                    {user.name}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {formatTimeAgo(user.createdAt)}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-600"
                      : user.role === "ngo"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                  }`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            ))
          ) : (
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}
            >
              No users found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
