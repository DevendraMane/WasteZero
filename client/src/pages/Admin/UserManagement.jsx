import React, { useEffect, useState } from "react";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleSuspend = async (id) => {
    console.log("BUTTON CLICKED", id); // 👈 ADD THIS

    try {
      const res = await axios.patch(
        `http://localhost:5000/api/admin/users/${id}/suspend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("SUCCESS:", res.data);
      fetchUsers();
    } catch (error) {
      console.error("ERROR:", error.response?.data || error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>

                  {/* STATUS */}
                  <td className="p-4">
                    {user.isSuspended ? (
                      <span className="text-red-600 font-semibold">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        Active
                      </span>
                    )}
                  </td>

                  {/* ACTION BUTTON */}
                  <td className="p-4">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => toggleSuspend(user._id)}
                        className={`px-4 py-1 rounded-lg text-sm ${
                          user.isSuspended
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isSuspended ? "Unsuspend" : "Suspend"}
                      </button>
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

export default UserManagement;
