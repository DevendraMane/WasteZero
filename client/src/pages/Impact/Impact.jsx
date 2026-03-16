import React, { useEffect, useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import Loader from "../../components/Loader";
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

const COLORS = {
  Plastic: "#3b82f6",
  Organic: "#22c55e",
  "E-Waste": "#f59e0b",
  Paper: "#8b5cf6",
  Metal: "#ef4444",
};

const Impact = () => {
  const [applications, setApplications] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();
  // console.log("Applications State:", applications);
  // console.log("Pickups State:", pickups);
  /* FETCH DATA */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, pickupRes] = await Promise.all([
          fetch(`${API}/api/applications/volunteer`, {
            headers: {
              Authorization: authorizationToken,
            },
          }),
          fetch(`${API}/api/pickups/volunteer`, {
            headers: {
              Authorization: authorizationToken,
            },
          }),
        ]);

        const appData = await appRes.json();
        const pickupData = await pickupRes.json();

        // console.log("Applications API:", appData);
        // console.log("Pickups API:", pickupData);

        setApplications(Array.isArray(appData) ? appData : []);
        setPickups(Array.isArray(pickupData) ? pickupData : []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API, authorizationToken]);
  /* APPLICATION STATS */

  const total = applications.length;

  const accepted = applications.filter((a) => a.status === "accepted").length;

  const totalHours = applications.reduce((sum, a) => {
    if (a.status !== "accepted") return sum;

    const duration = a.opportunity_id?.duration || "";

    const match = duration.match(/\d+/);

    return sum + (match ? parseInt(match[0], 10) : 0);
  }, 0);

  const weekSet = new Set(
    applications
      .filter((a) => a.status === "accepted" && a.opportunity_id?.date)
      .map((a) => {
        const d = new Date(a.opportunity_id.date);
        const jan1 = new Date(d.getFullYear(), 0, 1);
        return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
      }),
  );

  const streak = weekSet.size;

  /* PICKUP STATS */

  const completedPickups = pickups.filter((p) => p.status === "completed");

  const co2Saved = completedPickups.length * 5;

  /* WASTE BREAKDOWN */

  const wasteBreakdown = useMemo(() => {
    const categories = {
      Plastic: 0,
      Organic: 0,
      "E-Waste": 0,
      Paper: 0,
      Metal: 0,
    };

    const source = completedPickups.length > 0 ? completedPickups : pickups;

    source.forEach((p) => {
      if (categories[p.category] !== undefined) {
        categories[p.category] += 10; // estimated weight
      }
    });

    return Object.keys(categories).map((key) => ({
      name: key,
      value: categories[key],
      color: COLORS[key],
    }));
  }, [pickups, completedPickups]);

  const totalWaste = wasteBreakdown.reduce((sum, item) => sum + item.value, 0);

  const hasWasteData = wasteBreakdown.some((w) => w.value > 0);

  if (loading) return <Loader />;

  return (
    <div
      className={`space-y-8 p-8 rounded-lg transition duration-300 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <h1
        className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}
      >
        My Environmental Impact
      </h1>

      {/* STAT CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Opportunities Joined"
          value={total}
          icon="📋"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Accepted"
          value={accepted}
          icon="✅"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Hours Invested"
          value={`${totalHours}h`}
          icon="⏱️"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="CO₂ Saved"
          value={`${co2Saved}kg`}
          icon="🌍"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* WASTE CHART */}

      <div
        className={`p-8 rounded-xl shadow transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          Waste Breakdown by Type
        </h2>

        {!hasWasteData ? (
          <div
            className={`text-center py-10 border border-dashed rounded-lg transition duration-300 ${
              isDarkMode
                ? "text-gray-400 border-gray-700 bg-gray-900"
                : "text-gray-400 border-gray-300 bg-white"
            }`}
          >
            No waste collected yet. Complete a pickup to see impact.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={wasteBreakdown}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {wasteBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip formatter={(value) => `${value} kg`} />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}

        <div
          className={`mt-4 font-semibold ${isDarkMode ? "text-green-400" : "text-green-600"}`}
        >
          Total Waste Collected: {totalWaste} kg
        </div>
      </div>

      {/* STREAK */}

      <div
        className={`p-6 rounded-xl shadow flex justify-between items-center transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div>
          <div className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            Participation Streak
          </div>
          <div
            className={`text-xl font-bold ${isDarkMode ? "text-orange-400" : "text-orange-500"}`}
          >
            {streak} week{streak !== 1 && "s"}
          </div>
        </div>
        <div className="text-3xl">🔥</div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, isDarkMode }) => (
  <div
    className={`p-5 rounded-xl shadow flex justify-between items-center transition duration-300 ${
      isDarkMode ? "bg-gray-800" : "bg-white"
    }`}
  >
    <div>
      <div
        className={
          isDarkMode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"
        }
      >
        {label}
      </div>
      <div
        className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
      >
        {value}
      </div>
    </div>
    <div className="text-2xl">{icon}</div>
  </div>
);

export default Impact;
