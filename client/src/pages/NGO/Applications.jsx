import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";

const Applications = () => {
  const { API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [applications, setApplications] = useState([]);

  const getStatusClasses = (status) => {
    if (status === "accepted") {
      return isDarkMode
        ? "bg-green-900 text-green-200"
        : "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return isDarkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-600";
    }

    return isDarkMode
      ? "bg-yellow-900 text-yellow-200"
      : "bg-yellow-100 text-yellow-600";
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API}/api/applications/ngo`, {
        headers: { Authorization: authorizationToken },
      });
      setApplications(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API}/api/applications/${id}`,
        { status: newStatus },
        { headers: { Authorization: authorizationToken } },
      );
      fetchApplications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Manage Applications
          </h1>
          <p
            className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Review incoming volunteer applications quickly.
          </p>
        </div>

        <span
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
            isDarkMode
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {applications.length} total
        </span>
      </div>

      {applications.length === 0 ? (
        <div
          className={`text-center py-10 border border-dashed rounded-xl ${
            isDarkMode
              ? "text-gray-400 border-gray-700 bg-gray-800"
              : "text-gray-400 border-gray-300 bg-white"
          }`}
        >
          No applications yet
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {applications.map((app) => (
              <div
                key={app._id}
                className={`rounded-xl p-4 border space-y-3 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={`font-semibold ${
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {app.volunteer_id?.name || "Unknown Volunteer"}
                    </p>
                    <p
                      className={`text-sm mt-1 break-all ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {app.volunteer_id?.email || "No email"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(
                      app.status,
                    )}`}
                  >
                    {app.status}
                  </span>
                </div>

                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Opportunity: {app.opportunity_id?.title || "N/A"}
                </div>

                {app.status === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(app._id, "accepted")}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => updateStatus(app._id, "rejected")}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No actions available
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            className={`hidden md:block rounded-2xl shadow-md overflow-x-auto transition duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <table className="w-full min-w-190 text-left">
              <thead
                className={`border-b ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <tr>
                  <th
                    className={`p-4 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                  >
                    Name
                  </th>
                  <th
                    className={`p-4 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                  >
                    Email
                  </th>
                  <th
                    className={`p-4 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                  >
                    Opportunity
                  </th>
                  <th
                    className={`p-4 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                  >
                    Status
                  </th>
                  <th
                    className={`p-4 text-center ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    className={`border-b transition ${
                      isDarkMode
                        ? "hover:bg-gray-700 border-gray-700"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <td
                      className={`p-4 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {app.volunteer_id?.name}
                    </td>
                    <td
                      className={`p-4 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {app.volunteer_id?.email}
                    </td>
                    <td
                      className={`p-4 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {app.opportunity_id?.title}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(
                          app.status,
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="p-4 text-center space-x-2">
                      {app.status === "pending" ? (
                        <>
                          <button
                            onClick={() => updateStatus(app._id, "accepted")}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() => updateStatus(app._id, "rejected")}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Applications;
