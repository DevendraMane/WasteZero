import React, { useState, useMemo } from "react";

const PickupManagement = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedPickup, setSelectedPickup] = useState(null);

  const [pickups, setPickups] = useState([
    {
      id: 1,
      user: "Ruthwik",
      location: "Hyderabad",
      wasteType: "Plastic",
      ngo: "Green Earth NGO",
      status: "pending",
      date: "Feb 25, 2026",
      description: "Plastic bottles and covers",
    },
    {
      id: 2,
      user: "Anjali",
      location: "Vijayawada",
      wasteType: "E-Waste",
      ngo: "Eco Mitra",
      status: "completed",
      date: "Feb 22, 2026",
      description: "Old mobile phones",
    },
    {
      id: 3,
      user: "Rahul",
      location: "Guntur",
      wasteType: "Organic",
      ngo: "Swachh Bharat",
      status: "cancelled",
      date: "Feb 20, 2026",
      description: "Kitchen waste",
    },
  ]);

  const filteredPickups = useMemo(() => {
    return pickups
      .filter((p) => (filter === "all" ? true : p.status === filter))
      .filter(
        (p) =>
          p.user.toLowerCase().includes(search.toLowerCase()) ||
          p.location.toLowerCase().includes(search.toLowerCase()),
      );
  }, [filter, search, pickups]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const updateStatus = (id, newStatus) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this pickup as ${newStatus}?`,
    );
    if (!confirmed) return;

    setPickups((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
    );
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Pickup Management
        </h1>
        <p className="text-gray-500 mt-2">
          Monitor and override pickup requests across the platform
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex gap-3 flex-wrap">
          {["all", "pending", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === status
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by user or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Location</th>
              <th className="p-4">Waste</th>
              <th className="p-4">NGO</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredPickups.map((pickup) => (
              <tr key={pickup.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{pickup.user}</td>
                <td className="p-4">{pickup.location}</td>
                <td className="p-4">{pickup.wasteType}</td>
                <td className="p-4">{pickup.ngo}</td>
                <td className="p-4">{pickup.date}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                      pickup.status,
                    )}`}
                  >
                    {pickup.status}
                  </span>
                </td>

                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => setSelectedPickup(pickup)}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                  >
                    View
                  </button>

                  {pickup.status !== "completed" && (
                    <button
                      onClick={() => updateStatus(pickup.id, "completed")}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Complete
                    </button>
                  )}

                  {pickup.status !== "cancelled" && (
                    <button
                      onClick={() => updateStatus(pickup.id, "cancelled")}
                      className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPickups.length === 0 && (
          <div className="p-6 text-center text-gray-400">No pickups found</div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Pickup Details</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>User:</strong> {selectedPickup.user}
              </p>
              <p>
                <strong>Location:</strong> {selectedPickup.location}
              </p>
              <p>
                <strong>Waste Type:</strong> {selectedPickup.wasteType}
              </p>
              <p>
                <strong>Description:</strong> {selectedPickup.description}
              </p>
              <p>
                <strong>Assigned NGO:</strong> {selectedPickup.ngo}
              </p>
              <p>
                <strong>Status:</strong> {selectedPickup.status}
              </p>
              <p>
                <strong>Date:</strong> {selectedPickup.date}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedPickup(null)}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupManagement;
