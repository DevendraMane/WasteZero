import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../store/AuthContext";

const Applications = () => {
  const { API, authorizationToken } = useAuth();
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
      <h1 className="text-3xl font-bold">Manage Applications</h1>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Opportunity</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-400">
                  No applications yet
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id} className="border-b">
                  <td className="p-4 font-medium">{app.volunteer_id?.name}</td>
                  <td className="p-4">{app.volunteer_id?.email}</td>
                  <td className="p-4">{app.opportunity_id?.title}</td>

                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-600 capitalize">
                      {app.status}
                    </span>
                  </td>

                  <td className="p-4 text-center space-x-2">
                    {app.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(app._id, "accepted")}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => updateStatus(app._id, "rejected")}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg"
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
