import React from "react";

const NgoDashboard = () => {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">NGO Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Manage your opportunities and track volunteer engagement
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Total Opportunities</p>
          <h2 className="text-3xl font-bold mt-2">24</h2>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Active Volunteers</p>
          <h2 className="text-3xl font-bold mt-2">86</h2>
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Completed Events</p>
          <h2 className="text-3xl font-bold mt-2">18</h2>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Pending Requests</p>
          <h2 className="text-3xl font-bold mt-2">12</h2>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-green-100 hover:bg-green-200 transition p-4 rounded-xl font-medium">
            + Create Opportunity
          </button>

          <button className="bg-indigo-100 hover:bg-indigo-200 transition p-4 rounded-xl font-medium">
            View All Opportunities
          </button>

          <button className="bg-orange-100 hover:bg-orange-200 transition p-4 rounded-xl font-medium">
            Manage Volunteers
          </button>
        </div>
      </div>

      {/* OPPORTUNITIES TABLE SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Recent Opportunities</h2>

        <div className="text-gray-400 text-center py-10 border border-dashed rounded-lg">
          No opportunities created yet
        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;
