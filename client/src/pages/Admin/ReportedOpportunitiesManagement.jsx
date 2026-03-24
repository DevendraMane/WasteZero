import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import { showError, showSuccess } from "../../utils/alert";
import Loader from "../../components/Loader";

const ReportedOpportunitiesManagement = () => {
  const { authorizationToken, API } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [reportCounts, setReportCounts] = useState({
    pending: 0,
    reviewed: 0,
    dismissed: 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteReportId, setPendingDeleteReportId] = useState(null);

  // Fetch report counts for all statuses
  const fetchReportCounts = async () => {
    try {
      const [pending, reviewed, dismissed] = await Promise.all([
        axios.get(`${API}/api/admin/opportunities/reports?status=pending`, {
          headers: { Authorization: authorizationToken },
        }),
        axios.get(`${API}/api/admin/opportunities/reports?status=reviewed`, {
          headers: { Authorization: authorizationToken },
        }),
        axios.get(`${API}/api/admin/opportunities/reports?status=dismissed`, {
          headers: { Authorization: authorizationToken },
        }),
      ]);

      setReportCounts({
        pending: pending.data.length,
        reviewed: reviewed.data.length,
        dismissed: dismissed.data.length,
      });
    } catch (error) {
      console.error("Error fetching report counts:", error);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/api/admin/opportunities/reports?status=${filter}`,
        {
          headers: { Authorization: authorizationToken },
        },
      );
      setReports(res.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportCounts();
    fetchReports();
  }, [filter]);

  // Delete reported opportunity
  const handleDeleteOpportunity = async () => {
    try {
      setActionInProgress(pendingDeleteReportId);
      await axios.delete(
        `${API}/api/admin/opportunities/reports/${pendingDeleteReportId}/delete`,
        {
          headers: { Authorization: authorizationToken },
        },
      );
      toast.success("Opportunity deleted successfully");
      setShowDetailModal(false);
      setShowDeleteConfirm(false);
      setPendingDeleteReportId(null);
      fetchReports();
      fetchReportCounts();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete opportunity",
      );
    } finally {
      setActionInProgress(null);
    }
  };

  // Dismiss report
  const handleDismissReport = async (reportId) => {
    try {
      setActionInProgress(reportId);
      await axios.patch(
        `${API}/api/admin/opportunities/reports/${reportId}/dismiss`,
        {},
        {
          headers: { Authorization: authorizationToken },
        },
      );
      toast.success("Report dismissed");
      setShowDetailModal(false);
      fetchReports();
      fetchReportCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to dismiss report");
    } finally {
      setActionInProgress(null);
    }
  };

  // Get reason display name
  const getReasonDisplay = (reason) => {
    const reasons = {
      "inappropriate-content": "Inappropriate Content",
      "fake-opportunity": "Fake Opportunity",
      spam: "Spam",
      "dangerous-activity": "Dangerous Activity",
      "misleading-information": "Misleading Information",
      other: "Other",
    };
    return reasons[reason] || reason;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return isDarkMode
          ? "bg-yellow-900 text-yellow-200"
          : "bg-yellow-100 text-yellow-700";
      case "reviewed":
        return isDarkMode
          ? "bg-green-900 text-green-200"
          : "bg-green-100 text-green-700";
      case "dismissed":
        return isDarkMode
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-200 text-gray-700";
      default:
        return isDarkMode
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-200 text-gray-700";
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div>
        <h1
          className={`text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Reported Opportunities
        </h1>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
          Review and manage opportunity reports from volunteers
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2">
        {["pending", "reviewed", "dismissed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              filter === status
                ? "bg-green-600 text-white"
                : isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} (
            {reportCounts[status]})
          </button>
        ))}
      </div>

      {/* REPORTS LIST */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <div
            className={`text-center py-12 rounded-lg ${
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
              No {filter} reports
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report._id}
              className={`p-4 rounded-lg shadow-md border transition ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Opportunity Title */}
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {report.opportunity_id?.title || "Deleted Opportunity"}
                  </h3>

                  {/* Report Details */}
                  <div
                    className={`text-sm space-y-1 mb-3 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <p>
                      <strong>Reason:</strong> {getReasonDisplay(report.reason)}
                    </p>
                    <p>
                      <strong>Reporter:</strong>{" "}
                      {report.reported_by?.name || "Unknown"} (
                      {report.reported_by?.email || "No email"})
                    </p>
                    <p>
                      <strong>Reported:</strong>{" "}
                      {new Date(report.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      report.status,
                    )}`}
                  >
                    {report.status.charAt(0).toUpperCase() +
                      report.status.slice(1)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setShowDetailModal(true);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className={`rounded-2xl max-w-2xl w-full p-6 shadow-lg transition max-h-[90vh] overflow-y-auto ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-6 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Report Details
            </h2>

            <div className="space-y-6">
              {/* Opportunity Info */}
              <div>
                <h3
                  className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Opportunity Details
                </h3>
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedReport.opportunity_id?.title ||
                      "Deleted Opportunity"}
                  </p>
                  {selectedReport.opportunity_id && (
                    <>
                      <p
                        className={`text-sm mt-2 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {selectedReport.opportunity_id.description}
                      </p>
                      <p
                        className={`text-sm mt-2 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <strong>Location:</strong>{" "}
                        {selectedReport.opportunity_id.location}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <strong>Posted by:</strong>{" "}
                        {selectedReport.opportunity_id.ngo_id?.name ||
                          "Unknown"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Report Info */}
              <div>
                <h3
                  className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Report Information
                </h3>
                <div
                  className={`p-4 rounded-lg space-y-2 ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <strong>Reason:</strong>{" "}
                    {getReasonDisplay(selectedReport.reason)}
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <strong>Reporter:</strong>{" "}
                    {selectedReport.reported_by?.name || "Unknown"} (
                    {selectedReport.reported_by?.email || "No email"})
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <strong>Reported Date:</strong>{" "}
                    {new Date(selectedReport.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <strong>Status:</strong>{" "}
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                        selectedReport.status,
                      )}`}
                    >
                      {selectedReport.status.charAt(0).toUpperCase() +
                        selectedReport.status.slice(1)}
                    </span>
                  </p>
                  {selectedReport.description && (
                    <p
                      className={`text-sm mt-3 p-3 rounded ${
                        isDarkMode ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <strong>Description:</strong>
                      <br />
                      <span
                        className={
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }
                      >
                        {selectedReport.description}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedReport.status === "pending" && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-600">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                  }}
                  disabled={actionInProgress}
                  className={`flex-1 py-2 rounded-lg transition font-medium ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => handleDismissReport(selectedReport._id)}
                  disabled={actionInProgress === selectedReport._id}
                  className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 transition font-medium"
                >
                  {actionInProgress === selectedReport._id
                    ? "Processing..."
                    : "Dismiss Report"}
                </button>
                <button
                  onClick={() => {
                    setPendingDeleteReportId(selectedReport._id);
                    setShowDeleteConfirm(true);
                  }}
                  disabled={actionInProgress === selectedReport._id}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition font-medium"
                >
                  {actionInProgress === selectedReport._id
                    ? "Processing..."
                    : "Delete Opportunity"}
                </button>
              </div>
            )}

            {selectedReport.status !== "pending" && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-600">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`flex-1 py-2 rounded-lg transition font-medium ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className={`rounded-2xl max-w-sm w-full p-6 shadow-lg transition ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Delete Opportunity?
            </h2>
            <p
              className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Are you sure you want to delete this opportunity? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPendingDeleteReportId(null);
                }}
                disabled={actionInProgress}
                className={`flex-1 py-2 rounded-lg transition font-medium ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOpportunity}
                disabled={actionInProgress}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition font-medium"
              >
                {actionInProgress ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportedOpportunitiesManagement;
