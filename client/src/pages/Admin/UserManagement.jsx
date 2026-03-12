import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../store/AuthContext";

const UserManagement = () => {
  const { authorizationToken, API } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/users`, {
        headers: { Authorization: authorizationToken },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [search]);

  const toggleSuspend = async (id) => {
    const confirmAction = window.confirm(
      "Are you sure you want to change this user's status?",
    );
    if (!confirmAction) return;

    try {
      await axios.patch(
        `${API}/api/admin/users/${id}/suspend`,
        {},
        { headers: { Authorization: authorizationToken } },
      );
      fetchUsers();
    } catch (error) {
      console.error("Error toggling suspend:", error.response?.data || error);
    }
  };

  // Filtering logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !user.isSuspended) ||
      (statusFilter === "suspended" && user.isSuspended);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        User Management ({filteredUsers.length})
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-md flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="ngo">NGO</option>
          <option value="volunteer">Volunteer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>

                  <td className="p-4 capitalize">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "ngo"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

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

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="px-3 py-1 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                      >
                        View Details
                      </button>
                      {user.role !== "admin" && (
                        <button
                          onClick={() => toggleSuspend(user._id)}
                          className={`px-4 py-1 rounded-lg text-sm transition ${
                            user.isSuspended
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {user.isSuspended ? "Unsuspend" : "Suspend"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Full Name
                  </label>
                  <p className="text-gray-800">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-800">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Role
                  </label>
                  <p className="capitalize">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        selectedUser.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : selectedUser.role === "ngo"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Status
                  </label>
                  <p>
                    {selectedUser.isSuspended ? (
                      <span className="text-red-600 font-semibold">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        Active
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {selectedUser.location && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Location
                  </label>
                  <p className="text-gray-800">{selectedUser.location}</p>
                </div>
              )}

              {selectedUser.address && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Address
                  </label>
                  <p className="text-gray-800">{selectedUser.address}</p>
                </div>
              )}

              {selectedUser.bio && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Bio
                  </label>
                  <p className="text-gray-800">{selectedUser.bio}</p>
                </div>
              )}

              {selectedUser.skills && selectedUser.skills.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Verification Status
                  </label>
                  <p>
                    {selectedUser.isVerified ? (
                      <span className="text-green-600 font-semibold">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">
                        Pending
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Member Since
                  </label>
                  <p className="text-gray-800">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedUser.latitude && selectedUser.longitude && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500">
                      Latitude
                    </label>
                    <p className="text-gray-800">
                      {selectedUser.latitude.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">
                      Longitude
                    </label>
                    <p className="text-gray-800">
                      {selectedUser.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-500">
                  User ID
                </label>
                <p className="text-gray-600 text-xs font-mono">
                  {selectedUser._id}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
              {selectedUser.role !== "admin" && (
                <button
                  onClick={() => {
                    toggleSuspend(selectedUser._id);
                    setShowModal(false);
                    setSelectedUser(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition ${
                    selectedUser.isSuspended
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {selectedUser.isSuspended ? "Unsuspend" : "Suspend"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
