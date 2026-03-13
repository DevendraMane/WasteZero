import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";

const Applications = () => {
  const { API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [applications, setApplications] = useState([]);

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
    <div className="space-y-8">
      <h1
        className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
      >
        Manage Applications
      </h1>

      <div
        className={`rounded-2xl shadow-md overflow-hidden transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <table className="w-full text-left">
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
            {applications.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className={`text-center p-6 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}
                >
                  No applications yet
                </td>
              </tr>
            ) : (
              applications.map((app) => (
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
                      className={`px-3 py-1 rounded-full text-sm capitalize ${
                        isDarkMode
                          ? "bg-yellow-900 text-yellow-200"
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
                          onClick={() => updateStatus(app._id, "accepted")}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => updateStatus(app._id, "rejected")}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
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
