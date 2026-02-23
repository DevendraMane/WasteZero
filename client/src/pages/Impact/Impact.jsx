import React from "react";

const Impact = () => {
  const impactData = {
    totalPickups: 18,
    totalWasteCollected: 320, // kg
    treesSaved: 12,
    co2Reduced: 85, // kg
  };

  const activities = [
    {
      id: 1,
      title: "Beach Cleanup Drive",
      date: "2026-02-12",
      waste: "45kg",
    },
    {
      id: 2,
      title: "E-Waste Collection",
      date: "2026-02-18",
      waste: "30kg",
    },
  ];

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

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Total Pickups</p>
          <h2 className="text-3xl font-bold mt-2">{impactData.totalPickups}</h2>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Waste Collected</p>
          <h2 className="text-3xl font-bold mt-2">
            {impactData.totalWasteCollected} kg
          </h2>
        </div>

        <div className="bg-gradient-to-r from-lime-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">Trees Saved</p>
          <h2 className="text-3xl font-bold mt-2">{impactData.treesSaved}</h2>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">CO₂ Reduced</p>
          <h2 className="text-3xl font-bold mt-2">
            {impactData.co2Reduced} kg
          </h2>
        </div>
      </div>

      {/* PROGRESS SECTION */}
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
            <span>Tree Saving Goal</span>
            <span>12 / 20</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-600 h-3 rounded-full w-[60%]"></div>
          </div>
        </div>
      </div>

      {/* ACTIVITY HISTORY */}
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Recent Activities</h2>

        {activities.length === 0 ? (
          <div className="text-gray-400 text-center py-10 border border-dashed rounded-lg">
            No activity yet
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
                <span className="text-green-600 font-semibold">
                  {activity.waste}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Impact;
