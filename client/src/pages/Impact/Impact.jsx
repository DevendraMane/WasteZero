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
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          My Environmental Impact
        </h1>
        <p className="text-gray-500 mt-2">
          Track your contribution towards a cleaner planet
        </p>
      </div>

      {/* STAT CARDS — white with colored left border + icon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Opportunities Joined",
            value: total,
            icon: "📋",
            border: "border-l-blue-500",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
            bar: total,
            barMax: 10,
            barColor: "bg-blue-400",
            sub: "Out of 10 goal",
          },
          {
            label: "Accepted",
            value: accepted,
            icon: "✅",
            border: "border-l-green-500",
            iconBg: "bg-green-50",
            iconColor: "text-green-500",
            bar: accepted,
            barMax: 10,
            barColor: "bg-green-400",
            sub: "Confirmed",
          },
          {
            label: "Hours Invested",
            value: `${totalHours}h`,
            icon: "⏱️",
            border: "border-l-violet-500",
            iconBg: "bg-violet-50",
            iconColor: "text-violet-500",
            bar: totalHours,
            barMax: 20,
            barColor: "bg-violet-400",
            sub: "Goal: 20 hours",
          },
          {
            label: "CO₂ Saved",
            value: `${co2Saved}kg`,
            icon: "🌍",
            border: "border-l-teal-500",
            iconBg: "bg-teal-50",
            iconColor: "text-teal-500",
            bar: co2Saved,
            barMax: 50,
            barColor: "bg-teal-400",
            sub: "Est. 2kg per hour",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 ${stat.border} flex flex-col gap-4`}
          >
            {/* Top row — icon + label */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {stat.label}
              </span>
              <div className={`${stat.iconBg} p-2 rounded-xl text-lg`}>
                {stat.icon}
              </div>
            </div>
            {/* Value */}
            <div>
              <div className={`text-3xl font-extrabold ${stat.iconColor}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`${stat.barColor} h-1.5 rounded-full transition-all`}
                style={{
                  width: `${Math.min((stat.bar / stat.barMax) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* DONUT CHART */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10">
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="bg-orange-50 p-4 rounded-2xl text-4xl">🔥</div>
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            Participation Streak
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Active across{" "}
            <span className="font-bold text-orange-500">
              {streak} week{streak !== 1 ? "s" : ""}
            </span>{" "}
            — keep it up!
          </p>
        </div>
        <div className="ml-auto">
          <div className="text-3xl font-extrabold text-orange-500">
            {streak}w
          </div>
          <div className="text-xs text-gray-400 text-right">streak</div>
        </div>
      </div>

      {/* MY OPPORTUNITIES */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          My Opportunities
        </h2>
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
                  <p className="text-sm text-gray-500 mt-0.5">
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
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Monthly Goal Progress
        </h2>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Waste Collection Goal</span>
            <span className="font-medium text-gray-800">320 / 500 kg</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full w-[64%]"></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Opportunities Goal</span>
            <span className="font-medium text-gray-800">{accepted} / 10</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-blue-400 h-3 rounded-full transition-all"
              style={{ width: `${Math.min((accepted / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impact;
