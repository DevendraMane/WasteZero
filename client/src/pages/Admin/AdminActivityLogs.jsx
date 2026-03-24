import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Trash2,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../store/AuthContext";

const AdminActivityLogs = () => {
  const { API, authorizationToken } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({});

  // Filters
  const [filters, setFilters] = useState({
    action: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearOldLogs, setShowClearOldLogs] = useState(false);
  const [daysOld, setDaysOld] = useState(90);
  const [clearingOldLogs, setClearingOldLogs] = useState(false);

  // Fetch logs
  const fetchLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum,
        limit,
        ...(filters.action && { action: filters.action }),
        ...(filters.status && { status: filters.status }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
      });

      const response = await axios.get(`${API}/api/admin/logs?${queryParams}`, {
        headers: { Authorization: authorizationToken },
      });

      setLogs(response.data.logs);
      setPagination(response.data.pagination);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error(error.response?.data?.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters, API, authorizationToken]);

  // Delete log
  const handleDeleteLog = async () => {
    try {
      await axios.delete(`${API}/api/admin/logs/${deletingLogId}`, {
        headers: {
          Authorization: authorizationToken,
        },
      });
      toast.success("Log deleted successfully");
      setShowDeleteConfirm(false);
      setDeletingLogId(null);
      fetchLogs(page);
    } catch (error) {
      console.error("Error deleting log:", error);
      toast.error(error.response?.data?.message || "Failed to delete log");
    }
  };

  // Clear old logs
  const handleClearOldLogs = async () => {
    try {
      setClearingOldLogs(true);
      const response = await axios.post(
        `${API}/api/admin/logs/clear-old`,
        { daysOld: parseInt(daysOld) },
        {
          headers: {
            Authorization: authorizationToken,
          },
        },
      );
      toast.success(response.data.message);
      setShowClearOldLogs(false);
      setDaysOld(90);
      fetchLogs(1);
    } catch (error) {
      console.error("Error clearing logs:", error);
      toast.error(error.response?.data?.message || "Failed to clear logs");
    } finally {
      setClearingOldLogs(false);
    }
  };

  // Format action display
  const getActionLabel = (action) => {
    const actionMap = {
      delete_opportunity: "Delete Opportunity",
      dismiss_report: "Dismiss Report",
      delete_report: "Delete Report",
      update_user: "Update User",
      delete_user: "Delete User",
      view_analytics: "View Analytics",
      update_settings: "Update Settings",
      other: "Other",
    };
    return actionMap[action] || action;
  };

  // Format status badge
  const getStatusBadge = (status) => {
    return status === "success" ? (
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        Success
      </span>
    ) : (
      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
        Failed
      </span>
    );
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Activity Logs
              </h1>
            </div>
            <button
              onClick={() => fetchLogs(page)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track all admin actions and system activities
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </button>
            <button
              onClick={() => setShowClearOldLogs(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear Old Logs
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action
                </label>
                <select
                  value={filters.action}
                  onChange={(e) =>
                    setFilters({ ...filters, action: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Actions</option>
                  <option value="delete_opportunity">Delete Opportunity</option>
                  <option value="dismiss_report">Dismiss Report</option>
                  <option value="delete_report">Delete Report</option>
                  <option value="update_user">Update User</option>
                  <option value="delete_user">Delete User</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters({ ...filters, fromDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters({ ...filters, toDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading logs...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              No logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div>
                          <p className="font-medium">{log.adminName}</p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {log.adminEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {getActionLabel(log.action)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {log.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {log.ipAddress || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => {
                            setDeletingLogId(log._id);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages} (Total:{" "}
                {pagination.total})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Log?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this log entry? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLog}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Old Logs Modal */}
      {showClearOldLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Clear Old Logs
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Delete all logs older than:
            </p>
            <div className="mb-6">
              <input
                type="number"
                value={daysOld}
                onChange={(e) => setDaysOld(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                days
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearOldLogs(false)}
                disabled={clearingOldLogs}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearOldLogs}
                disabled={clearingOldLogs}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {clearingOldLogs ? "Clearing..." : "Clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogs;
