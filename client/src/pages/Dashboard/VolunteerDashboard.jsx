import React from "react";

const VolunteerDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Volunteer Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Track your activities and joined opportunities
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Opportunities Joined</p>
          <h2 className="text-3xl font-bold mt-2">12</h2>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Completed Activities</p>
          <h2 className="text-3xl font-bold mt-2">8</h2>
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Pending Activities</p>
          <h2 className="text-3xl font-bold mt-2">4</h2>
        </div>
      </div>

      {/* Joined Opportunities */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">My Opportunities</h2>

        <div className="text-gray-400 text-center py-10 border border-dashed rounded-lg">
          No joined opportunities yet
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
