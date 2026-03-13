import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";

const UserManagement = () => {
  const { authorizationToken, API } = useAuth();
  const { isDarkMode } = useDarkMode();
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
    <div
      className={`space-y-6 p-8 rounded-lg transition duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <h1
        className={`text-3xl font-bold transition duration-300 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        User Management ({filteredUsers.length})
      </h1>

      {/* Filters */}
      <div
        className={`p-4 rounded-2xl shadow-md flex flex-col md:flex-row gap-4 transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`flex-1 border rounded-lg px-4 py-2 transition duration-300 ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-green-500 focus:outline-none focus:ring-2"
              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          }`}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={`border rounded-lg px-4 py-2 transition duration-300 ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300 bg-white text-gray-900"
          }`}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="ngo">NGO</option>
          <option value="volunteer">Volunteer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`border rounded-lg px-4 py-2 transition duration-300 ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300 bg-white text-gray-900"
          }`}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div
        className={`rounded-2xl shadow-md overflow-hidden transition duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <table className="w-full text-left">
          <thead
            className={`border-b transition duration-300 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <tr>
              <th
                className={`p-4 transition duration-300 ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Name
              </th>
              <th
                className={`p-4 transition duration-300 ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Email
              </th>
              <th
                className={`p-4 transition duration-300 ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Role
              </th>
              <th
                className={`p-4 transition duration-300 ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Status
              </th>
              <th
                className={`p-4 transition duration-300 ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className={`text-center p-6 transition duration-300 ${
                    isDarkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className={`border-b transition duration-300 ${
                    isDarkMode
                      ? "border-gray-700 hover:bg-gray-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <td
                    className={`p-4 font-medium transition duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.name}
                  </td>
                  <td
                    className={`p-4 transition duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {user.email}
                  </td>

                  <td className="p-4 capitalize">
                    <span
                      className={`px-3 py-1 text-xs rounded-full transition duration-300 ${
                        user.role === "admin"
                          ? isDarkMode
                            ? "bg-purple-900 text-purple-200"
                            : "bg-purple-100 text-purple-700"
                          : user.role === "ngo"
                            ? isDarkMode
                              ? "bg-blue-900 text-blue-200"
                              : "bg-blue-100 text-blue-700"
                            : isDarkMode
                              ? "bg-green-900 text-green-200"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="p-4">
                    {user.isSuspended ? (
                      <span
                        className={`font-semibold transition duration-300 ${
                          isDarkMode ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        Suspended
                      </span>
                    ) : (
                      <span
                        className={`font-semibold transition duration-300 ${
                          isDarkMode ? "text-green-400" : "text-green-600"
                        }`}
                      >
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
                        className={`px-3 py-1 rounded-lg text-sm transition duration-300 ${
                          isDarkMode
                            ? "bg-blue-900 text-blue-200 hover:bg-blue-800"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                      >
                        View Details
                      </button>
                      {user.role !== "admin" && (
                        <button
                          onClick={() => toggleSuspend(user._id)}
                          className={`px-4 py-1 rounded-lg text-sm transition duration-300 ${
                            user.isSuspended
                              ? isDarkMode
                                ? "bg-green-900 text-green-200 hover:bg-green-800"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                              : isDarkMode
                                ? "bg-red-900 text-red-200 hover:bg-red-800"
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
          <div
            className={`rounded-2xl shadow-xl p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto transition duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-2xl font-bold transition duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                User Details
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className={`text-2xl transition duration-300 ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`text-sm font-semibold transition duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Full Name
                  </label>
                  <p
                    className={`transition duration-300 ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {selectedUser.name}
                  </p>
                </div>
                <div>
                  <label
                    className={`text-sm font-semibold transition duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Email
                  </label>
                  <p
                    className={`transition duration-300 ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`text-sm font-semibold transition duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Role
                  </label>
                  <p className="capitalize">
                    <span
                      className={`px-3 py-1 text-xs rounded-full transition duration-300 ${
                        selectedUser.role === "admin"
                          ? isDarkMode
                            ? "bg-purple-900 text-purple-200"
                            : "bg-purple-100 text-purple-700"
                          : selectedUser.role === "ngo"
                            ? isDarkMode
                              ? "bg-blue-900 text-blue-200"
                              : "bg-blue-100 text-blue-700"
                            : isDarkMode
                              ? "bg-green-900 text-green-200"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </p>
                </div>
                <div>
                  <label
                    className={`text-sm font-semibold transition duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Status
                  </label>
                  <p>
                    {selectedUser.isSuspended ? (
                      <span
                        className={`font-semibold transition duration-300 ${
                          isDarkMode ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        Suspended
                      </span>
                    ) : (
                      <span
                        className={`font-semibold transition duration-300 ${
                          isDarkMode ? "text-green-400" : "text-green-600"
                        }`}
                      >
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
