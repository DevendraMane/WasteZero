import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BASE_URL = "http://localhost:5000";

const wasteBreakdown = [
  { name: "Plastic", value: 120, color: "#3b82f6" },
  { name: "Organic", value: 85, color: "#22c55e" },
  { name: "E-Waste", value: 60, color: "#f59e0b" },
  { name: "Paper", value: 35, color: "#8b5cf6" },
  { name: "Metal", value: 20, color: "#ef4444" },
];

const Impact = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/applications/volunteer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const total = applications.length;
  const accepted = applications.filter((a) => a.status === "accepted").length;

  const totalHours = applications
    .filter((a) => a.status === "accepted" && a.opportunity_id?.duration)
    .reduce((sum, a) => {
      const match = a.opportunity_id.duration.match(/\d+/);
      return sum + (match ? parseInt(match[0]) : 0);
    }, 0);

  const weekSet = new Set(
    applications
      .filter((a) => a.status === "accepted" && a.opportunity_id?.date)
      .map((a) => {
        const d = new Date(a.opportunity_id.date);
        const jan1 = new Date(d.getFullYear(), 0, 1);
        return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
      })
  );
  const streak = weekSet.size;
  const co2Saved = totalHours * 2;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          My Environmental Impact
        </h1>
        <p className="text-gray-500 mt-2">
          Track your contribution towards a cleaner planet
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Opportunities Joined",
            value: total,
            icon: "📋",
            bg: "bg-blue-500",
            bar: total,
            barMax: 10,
            sub: "Out of 10 goal",
          },
          {
            label: "Accepted",
            value: accepted,
            icon: "✅",
            bg: "bg-green-500",
            bar: accepted,
            barMax: 10,
            sub: `${total - accepted} pending/rejected`,
          },
          {
            label: "Hours Invested",
            value: `${totalHours}h`,
            icon: "⏱️",
            bg: "bg-violet-500",
            bar: totalHours,
            barMax: 20,
            sub: "Goal: 20 hours",
          },
          {
            label: "CO₂ Saved",
            value: `${co2Saved}kg`,
            icon: "🌍",
            bg: "bg-teal-500",
            bar: co2Saved,
            barMax: 50,
            sub: "Est. 2kg per hour",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-2xl p-5 shadow-md flex flex-col justify-between min-h-[160px]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-medium uppercase tracking-wide opacity-80">
                {stat.label}
              </span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white mt-2">
                {stat.value}
              </div>
              <div className="text-white text-xs mt-1 opacity-70">
                {stat.sub}
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
                <div
                  className="bg-white rounded-full h-1.5 transition-all"
                  style={{
                    width: `${Math.min((stat.bar / stat.barMax) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DONUT CHART */}
      <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row items-center gap-10">
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Waste Breakdown by Type
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={wasteBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
              >
                {wasteBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} kg`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Summary</h2>
          {wasteBreakdown.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 text-sm">{item.name}</span>
              </div>
              <span className="font-semibold text-gray-800">
                {item.value} kg
              </span>
            </div>
          ))}
          <div className="border-t pt-4 flex justify-between">
            <span className="font-semibold text-gray-700">Total Collected</span>
            <span className="font-bold text-green-600">320 kg</span>
          </div>
        </div>
      </div>

      {/* STREAK */}
      <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-6">
        <div className="text-5xl">🔥</div>
        <div>
          <h2 className="text-xl font-semibold text-gray-700">
            Participation Streak
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            You have been active across{" "}
            <span className="font-bold text-orange-500">
              {streak} week{streak !== 1 ? "s" : ""}
            </span>{" "}
            — keep it up!
          </p>
        </div>
        <div className="ml-auto text-4xl font-bold text-orange-500">
          {streak}w
        </div>
      </div>

      {/* MY OPPORTUNITIES */}
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">My Opportunities</h2>
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="text-gray-400 text-center py-8 border border-dashed rounded-lg">
            You have not applied to any opportunities yet
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="flex justify-between items-center border-b pb-4"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {app.opportunity_id?.title || "Opportunity"}
                  </p>
                  <p className="text-sm text-gray-500">
                    📍 {app.opportunity_id?.location || "—"} &nbsp;|&nbsp; ⏱️{" "}
                    {app.opportunity_id?.duration || "—"} &nbsp;|&nbsp; 📅{" "}
                    {app.opportunity_id?.date
                      ? new Date(app.opportunity_id.date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    app.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : app.status === "rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MONTHLY GOALS */}
      <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">
        <h2 className="text-xl font-semibold">Monthly Goal Progress</h2>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Waste Collection Goal</span>
            <span>320 / 500 kg</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-600 h-3 rounded-full w-[64%]"></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Opportunities Goal</span>
            <span>{accepted} / 10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min((accepted / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impact;
