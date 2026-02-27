import React, { useState, useMemo } from "react";

const OpportunityManagement = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const [opportunities, setOpportunities] = useState([
    {
      id: 1,
      title: "Beach Cleanup Drive",
      ngo: "Green Earth NGO",
      location: "Hyderabad",
      status: "active",
      date: "Mar 5, 2026",
      featured: false,
      description: "Join us to clean the city beach area.",
    },
    {
      id: 2,
      title: "Tree Plantation",
      ngo: "Eco Mitra",
      location: "Vijayawada",
      status: "closed",
      date: "Mar 10, 2026",
      featured: true,
      description: "Plant 500 trees across the district.",
    },
    {
      id: 3,
      title: "River Cleanup",
      ngo: "Swachh Bharat",
      location: "Guntur",
      status: "flagged",
      date: "Mar 15, 2026",
      featured: false,
      description: "Clean river banks and remove plastic waste.",
    },
  ]);

  const filtered = useMemo(() => {
    return opportunities
      .filter((o) => (filter === "all" ? true : o.status === filter))
      .filter((o) => o.ngo.toLowerCase().includes(search.toLowerCase()));
  }, [filter, search, opportunities]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-200 text-gray-700";
      case "flagged":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const toggleFeatured = (id) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, featured: !o.featured } : o)),
    );
  };

  const changeStatus = (id, status) => {
    const confirm = window.confirm(`Change status to ${status}?`);
    if (!confirm) return;

    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Opportunity Moderation
        </h1>
        <p className="text-gray-500 mt-2">
          Review and manage all NGO opportunities
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <div className="flex gap-3 flex-wrap">
          {["all", "active", "closed", "flagged"].map((status) => (
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
          placeholder="Search by NGO..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">NGO</th>
              <th className="p-4">Location</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{o.title}</td>
                <td className="p-4">{o.ngo}</td>
                <td className="p-4">{o.location}</td>
                <td className="p-4">{o.date}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                      o.status,
                    )}`}
                  >
                    {o.status}
                  </span>
                </td>

                <td className="p-4">{o.featured ? "⭐ Featured" : "—"}</td>

                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => setSelected(o)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    View
                  </button>

                  <button
                    onClick={() => toggleFeatured(o.id)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                  >
                    Toggle Featured
                  </button>

                  <button
                    onClick={() => changeStatus(o.id, "closed")}
                    className="px-3 py-1 border text-red-600 border-red-300 rounded text-sm"
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Opportunity Details</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Title:</strong> {selected.title}
              </p>
              <p>
                <strong>NGO:</strong> {selected.ngo}
              </p>
              <p>
                <strong>Location:</strong> {selected.location}
              </p>
              <p>
                <strong>Date:</strong> {selected.date}
              </p>
              <p>
                <strong>Status:</strong> {selected.status}
              </p>
              <p>
                <strong>Description:</strong> {selected.description}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-100 rounded"
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

export default OpportunityManagement;
