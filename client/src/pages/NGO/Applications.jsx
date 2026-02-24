import React, { useState } from "react";

const Applications = () => {
  const [applications, setApplications] = useState([
    {
      id: 1,
      name: "Ruthwik",
      email: "ruthwik@email.com",
      opportunity: "Beach Cleanup Drive",
      skills: "Waste Segregation, Teamwork",
      status: "pending",
    },
    {
      id: 2,
      name: "Ananya",
      email: "ananya@email.com",
      opportunity: "E-Waste Collection",
      skills: "Electronics Knowledge",
      status: "pending",
    },
  ]);

  const updateStatus = (id, newStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)),
    );
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Manage Applications
        </h1>
        <p className="text-gray-500 mt-2">
          Review and manage volunteer applications
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Opportunity</th>
              <th className="p-4">Skills</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-400">
                  No applications yet
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{app.name}</td>
                  <td className="p-4">{app.email}</td>
                  <td className="p-4">{app.opportunity}</td>
                  <td className="p-4">{app.skills}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-600"
                          : app.status === "rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>

                  <td className="p-4 text-center space-x-2">
                    {app.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(app.id, "accepted")}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => updateStatus(app.id, "rejected")}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Applications;
