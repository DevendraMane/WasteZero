import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import Loader from "../../components/Loader";
import { transformCloudinaryImage } from "../../utils/image";
import { devError } from "../../utils/logger";
import { showError, showSuccess } from "../../utils/alert";

const OpportunitiesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API, authorizationToken, user } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applying, setApplying] = useState(false);
  const [reportingOpen, setReportingOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ================= FETCH OPPORTUNITY ================= */

  const fetchOpportunity = async () => {
    try {
      const res = await axios.get(`${API}/api/opportunities/${id}`, {
        headers: { Authorization: authorizationToken },
      });

      setOpportunity(res.data);
    } catch (error) {
      devError("Error fetching opportunity:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH APPLICATION STATUS ================= */

  const fetchApplicationStatus = async () => {
    if (user?.role !== "volunteer") return;

    try {
      const res = await axios.get(`${API}/api/applications/check/${id}`, {
        headers: { Authorization: authorizationToken },
      });

      if (res.data.applied) {
        setApplicationStatus(res.data.status);
      } else {
        setApplicationStatus(null);
      }
    } catch (error) {
      devError(error);
    }
  };

  useEffect(() => {
    fetchOpportunity();
    fetchApplicationStatus();
  }, []);

  /* ================= APPLY ================= */

  const handleApply = async () => {
    try {
      setApplying(true);

      await axios.post(
        `${API}/api/applications/${id}`,
        {},
        { headers: { Authorization: authorizationToken } },
      );

      setApplicationStatus("pending");
      showSuccess("Application submitted successfully");
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Already applied");
      }
    } finally {
      setApplying(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`${API}/api/opportunities/${id}`, {
        headers: { Authorization: authorizationToken },
      });

      toast.success("Opportunity deleted successfully");
      setShowDeleteConfirm(false);
      navigate("/opportunities");
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ================= REPORT ================= */

  const handleReport = async () => {
    if (!reportReason) {
      toast.error("Please select a reason");
      return;
    }

    try {
      setReportSubmitting(true);

      await axios.post(
        `${API}/api/opportunities/${id}/report`,
        {
          reason: reportReason,
          description: reportDescription,
        },
        { headers: { Authorization: authorizationToken } },
      );

      toast.success(
        "Opportunity reported successfully. Admin has been notified.",
      );
      setReportingOpen(false);
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to report opportunity",
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!opportunity) {
    return (
      <div
        className={`text-center py-20 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
      >
        Opportunity not found
      </div>
    );
  }

  const isClosed = new Date(opportunity.date) < new Date();
  const currentUserId = String(user?._id || user?.id || "");
  const opportunityOwnerId = String(opportunity?.ngo_id?._id || "");
  const canManageOpportunity =
    user?.role === "ngo" &&
    currentUserId &&
    opportunityOwnerId &&
    currentUserId === opportunityOwnerId;

  const formattedDate = opportunity.date
    ? new Date(opportunity.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not specified";

  return (
    <div className="space-y-8">
      {/* BACK BUTTON */}

      <button
        onClick={() => navigate("/opportunities")}
        className={`transition ${
          isDarkMode
            ? "text-gray-400 hover:text-green-400"
            : "text-gray-500 hover:text-green-600"
        }`}
      >
        ← Back to Opportunities
      </button>

      {/* TITLE */}

      <div>
        <div className="flex items-center gap-3">
          <h1
            className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}
          >
            {opportunity.title}
          </h1>

          {isClosed ? (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isDarkMode
                  ? "bg-red-900 text-red-200"
                  : "bg-red-100 text-red-600"
              }`}
            >
              Closed
            </span>
          ) : (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isDarkMode
                  ? "bg-green-900 text-green-200"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Open
            </span>
          )}
        </div>

        <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Volunteer opportunity details
        </p>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}

        <div className="lg:col-span-2 space-y-6">
          {/* IMAGE */}

          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src={
                opportunity.image
                  ? transformCloudinaryImage(opportunity.image, {
                      width: 1200,
                      height: 600,
                    })
                  : "https://via.placeholder.com/800x400?text=Opportunity"
              }
              alt={opportunity.title}
              className="w-full h-80 object-cover"
            />
          </div>

          {/* DESCRIPTION */}

          <div
            className={`p-6 rounded-2xl shadow-md transition duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Description
            </h2>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
              {opportunity.description}
            </p>
          </div>

          {/* SKILLS */}

          <div
            className={`p-6 rounded-2xl shadow-md transition duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Required Skills
            </h2>

            <div className="flex flex-wrap gap-2">
              {opportunity.required_skills?.map((skill, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isDarkMode
                      ? "bg-green-900 text-green-200"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div
          className={`p-6 rounded-2xl shadow-md space-y-6 h-fit transition duration-300 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Opportunity Details
          </h2>

          <div
            className={`space-y-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            <p>📅 Date: {formattedDate}</p>
            <p>⏱ Duration: {opportunity.duration}</p>
            <p>📍 Location: {opportunity.location}</p>
            <p>👤 Posted by: {opportunity.ngo_id?.name || "NGO"}</p>
          </div>

          {/* NGO ACTIONS */}

          {canManageOpportunity && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => navigate(`/opportunities/edit/${id}`)}
                className={`flex-1 py-2 rounded-lg transition ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                Edit
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 bg-red-500 text-white hover:bg-red-600 py-2 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          )}

          {/* VOLUNTEER APPLY */}

          {user?.role === "volunteer" && (
            <div className="pt-4 space-y-3">
              {applicationStatus === "accepted" ? (
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full bg-green-600 text-white py-2 rounded-lg"
                  >
                    Accepted
                  </button>

                  {/* MESSAGE BUTTON ONLY AFTER APPROVAL */}
                  <button
                    onClick={() =>
                      navigate(`/messages?user=${opportunity.ngo_id._id}`)
                    }
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Message NGO
                  </button>
                </div>
              ) : applicationStatus === "pending" ? (
                <button
                  disabled
                  className={`w-full py-2 rounded-lg ${
                    isDarkMode
                      ? "bg-yellow-900 text-yellow-200"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  Applied (Pending)
                </button>
              ) : applicationStatus === "rejected" ? (
                <button
                  disabled
                  className={`w-full py-2 rounded-lg ${
                    isDarkMode
                      ? "bg-red-900 text-red-200"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  Rejected
                </button>
              ) : isClosed ? (
                <button
                  disabled
                  className={`w-full py-2 rounded-lg cursor-not-allowed ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  Opportunity Closed
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  {applying ? "Applying..." : "Apply Now"}
                </button>
              )}

              {/* REPORT BUTTON */}
              <button
                onClick={() => setReportingOpen(true)}
                className={`w-full py-2 rounded-lg transition ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-red-400 border border-red-600"
                    : "bg-gray-100 hover:bg-gray-200 text-red-600 border border-red-400"
                }`}
              >
                🚨 Report Opportunity
              </button>
            </div>
          )}
        </div>
      </div>

      {/* REPORT MODAL */}

      {reportingOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className={`rounded-2xl max-w-md w-full p-6 shadow-lg transition ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Report Opportunity
            </h2>

            <div className="space-y-4">
              {/* REASON SELECT */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Reason for Report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className={`w-full p-2 rounded-lg border transition ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Select a reason</option>
                  <option value="inappropriate-content">
                    Inappropriate Content
                  </option>
                  <option value="fake-opportunity">Fake Opportunity</option>
                  <option value="spam">Spam</option>
                  <option value="dangerous-activity">Dangerous Activity</option>
                  <option value="misleading-information">
                    Misleading Information
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* DESCRIPTION TEXTAREA */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Description (Optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide details about why you're reporting this opportunity..."
                  className={`w-full p-2 rounded-lg border resize-none h-24 transition ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setReportingOpen(false);
                    setReportReason("");
                    setReportDescription("");
                  }}
                  disabled={reportSubmitting}
                  className={`flex-1 py-2 rounded-lg transition ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={reportSubmitting}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition"
                >
                  {reportSubmitting ? "Reporting..." : "Report"}
                </button>
              </div>
            </div>
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
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className={`flex-1 py-2 rounded-lg transition font-medium ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition font-medium"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesDetail;
