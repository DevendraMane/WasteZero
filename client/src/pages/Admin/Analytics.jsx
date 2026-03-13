import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";
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
  const { API, authorizationToken } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const COLORS = ["#16a34a", "#4f46e5", "#f59e0b"];

  const fetchAnalytics = async (from = "", to = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (from) params.append("fromDate", from);
      if (to) params.append("toDate", to);

      const res = await fetch(
        `${API}/api/admin/analytics?${params.toString()}`,
        {
          headers: { Authorization: authorizationToken },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [API, authorizationToken]);

  const handleApplyFilter = () => {
    fetchAnalytics(fromDate, toDate);
  };

  const handleResetFilter = () => {
    setFromDate("");
    setToDate("");
    fetchAnalytics();
  };

  const handleExportUsersCSV = async () => {
    try {
      const res = await fetch(`${API}/api/admin/export/users`, {
        headers: { Authorization: authorizationToken },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users-report.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleExportPickupsCSV = async () => {
    try {
      const res = await fetch(`${API}/api/admin/export/pickups`, {
        headers: { Authorization: authorizationToken },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pickups-report.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleExportFullReport = async () => {
    try {
      const res = await fetch(`${API}/api/admin/export/full-report`, {
        headers: { Authorization: authorizationToken },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "wastezero-full-report.html";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Loading analytics...</p>
      </div>
    );
  }

  const stats = analytics?.stats || {};
  const monthlyPickupData = analytics?.monthlyPickupData || [];
  const userGrowthData = analytics?.userGrowthData || [];
  const userDistribution = analytics?.userDistribution || [];

  const completionRate = stats.completionRate || 0;

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
          <button
            onClick={handleResetFilter}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
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
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <button
              onClick={handleApplyFilter}
              className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: "Total Users", value: stats.totalUsers || 0 },
          { label: "Active NGOs", value: stats.totalNGOs || 0 },
          { label: "Total Pickups", value: stats.totalPickups || 0 },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            highlight: true,
          },
          { label: "Opportunities", value: stats.totalOpportunities || 0 },
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

          {monthlyPickupData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPickupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pickups" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-20">
              No pickup data yet
            </p>
          )}
        </div>

        {/* OPPORTUNITY TREND */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-6">
            Opportunity Trend Analysis
          </h3>

          {monthlyPickupData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPickupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="opportunities"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
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

      {/* SECOND CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* USER GROWTH */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-6">
            User Growth Over Time
          </h3>

          {userGrowthData.length > 0 ? (
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
          ) : (
            <p className="text-gray-400 text-center py-20">No user data yet</p>
          )}
        </div>

        {/* ROLE DISTRIBUTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-6">
            User Role Distribution
          </h3>

          {userDistribution.length > 0 ? (
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
          ) : (
            <p className="text-gray-400 text-center py-20">
              No distribution data yet
            </p>
          )}
        </div>
      </div>

      {/* EXPORT SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-6">
          Export Reports
        </h3>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExportUsersCSV}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Export Users CSV
          </button>
          <button
            onClick={handleExportPickupsCSV}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Export Pickups CSV
          </button>
          <button
            onClick={handleExportFullReport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Download Full Report (HTML)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
