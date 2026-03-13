import React, { useState } from "react";
import { useAuth } from "../../store/AuthContext";
import API from "../../utils/api";
import { useDarkMode } from "../../store/DarkModeContext";

const ngoFaqs = [
  {
    question: "How do I create a new opportunity?",
    answer:
      "Go to Create Opportunity page, fill in event details, date, location and publish it.",
  },
  {
    question: "How do I manage volunteer applications?",
    answer:
      "Open Manage Applications from your dashboard to approve or reject volunteers.",
  },
  {
    question: "How do I send messages to volunteers?",
    answer: "Use the Messages section to communicate directly with volunteers.",
  },
  {
    question: "How can I track campaign impact?",
    answer:
      "Go to Dashboard → Analytics to see participation and impact reports.",
  },
];

const NGOHelp = () => {
  const { token } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [active, setActive] = useState(null);
  const [reportData, setReportData] = useState({
    issueType: "bug",
    subject: "",
    description: "",
  });
  const [userReportData, setUserReportData] = useState({
    reportedUserId: "",
    reportReason: "",
    reportDescription: "",
  });
  const [submitStatus, setSubmitStatus] = useState("");
  const [userReportStatus, setUserReportStatus] = useState("");

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserReportChange = (e) => {
    const { name, value } = e.target;
    setUserReportData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();

    if (!reportData.subject.trim() || !reportData.description.trim()) {
      setSubmitStatus("✗ Please fill all fields");
      setTimeout(() => setSubmitStatus(""), 3000);
      return;
    }

    try {
      setSubmitStatus("Sending report...");

      const response = await API.post(
        "/help/report-issue",
        {
          issueType: reportData.issueType,
          subject: reportData.subject,
          description: reportData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSubmitStatus("✓ " + response.data.message);
      setReportData({
        issueType: "bug",
        subject: "",
        description: "",
      });
      setTimeout(() => setSubmitStatus(""), 4000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to report issue. Please try again.";
      setSubmitStatus("✗ " + errorMsg);
      setTimeout(() => setSubmitStatus(""), 4000);
    }
  };

  const handleUserReportSubmit = async (e) => {
    e.preventDefault();

    if (
      !userReportData.reportedUserId.trim() ||
      !userReportData.reportReason.trim() ||
      !userReportData.reportDescription.trim()
    ) {
      setUserReportStatus("✗ Please fill all fields");
      setTimeout(() => setUserReportStatus(""), 3000);
      return;
    }

    try {
      setUserReportStatus("Submitting report...");

      const response = await API.post(
        "/help/report-user",
        {
          reportedUserId: userReportData.reportedUserId,
          reportReason: userReportData.reportReason,
          reportDescription: userReportData.reportDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUserReportStatus("✓ " + response.data.message);
      setUserReportData({
        reportedUserId: "",
        reportReason: "",
        reportDescription: "",
      });
      setTimeout(() => setUserReportStatus(""), 4000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to report user. Please try again.";
      setUserReportStatus("✗ " + errorMsg);
      setTimeout(() => setUserReportStatus(""), 4000);
    }
  };

  return (
    <div
      className={`p-10 min-h-screen transition duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className={`text-3xl font-semibold mb-2 transition duration-300 ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          NGO Help & Support
        </h1>
        <p
          className={`mb-8 transition duration-300 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Manage campaigns, volunteers and track impact effectively.
        </p>

        {/* FAQ Section */}
        <div
          className={`rounded-2xl shadow p-6 mb-8 transition duration-300 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-xl font-medium mb-4 transition duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Frequently Asked Questions
          </h2>

          {ngoFaqs.map((faq, index) => (
            <div
              key={index}
              className={`border-b py-4 transition duration-300 ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => setActive(active === index ? null : index)}
                className={`w-full text-left font-medium transition duration-300 ${
                  isDarkMode
                    ? "text-gray-200 hover:text-white"
                    : "text-gray-800"
                }`}
              >
                {faq.question}
              </button>

              {active === index && (
                <p
                  className={`mt-2 text-sm transition duration-300 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Report an Issue Section */}
        <div
          className={`rounded-2xl shadow p-6 mb-8 transition duration-300 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-xl font-medium mb-6 transition duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Report an Issue
          </h2>

          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Issue Type
              </label>
              <select
                name="issueType"
                value={reportData.issueType}
                onChange={handleReportChange}
                className={`w-full border rounded-lg px-4 py-2 transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    : "border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                }`}
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="feedback">General Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 transition duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={reportData.subject}
                onChange={handleReportChange}
                placeholder="Brief title of the issue"
                className={`w-full border rounded-lg px-4 py-2 transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 transition duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Description
              </label>
              <textarea
                name="description"
                value={reportData.description}
                onChange={handleReportChange}
                placeholder="Detailed description of the issue..."
                rows="5"
                className={`w-full border rounded-lg px-4 py-2 transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                }`}
              />
            </div>

            {submitStatus && (
              <div
                className={`p-3 rounded-lg transition duration-300 ${
                  submitStatus.startsWith("✓")
                    ? isDarkMode
                      ? "bg-green-900 text-green-200"
                      : "bg-green-100 text-green-700"
                    : isDarkMode
                      ? "bg-red-900 text-red-200"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {submitStatus}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium duration-300"
            >
              Submit Report
            </button>
          </form>
        </div>

        {/* Report a User Section */}
        <div
          className={`rounded-2xl shadow p-6 mb-8 transition duration-300 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-xl font-medium mb-6 transition duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Report a User
          </h2>
          <p
            className={`mb-4 transition duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            If you've had issues with a volunteer or another user, you can
            report them here. Our admin team will review and take appropriate
            action.
          </p>

          <form onSubmit={handleUserReportSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                User Email or ID
              </label>
              <input
                type="text"
                name="reportedUserId"
                value={userReportData.reportedUserId}
                onChange={handleUserReportChange}
                placeholder="Enter the email or user ID of the person to report"
                className={`w-full border rounded-lg px-4 py-2 transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 transition duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Reason for Report
              </label>
              <select
                name="reportReason"
                value={userReportData.reportReason}
                onChange={handleUserReportChange}
                className={`w-full border rounded-lg px-4 py-2 transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    : "border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                }`}
              >
                <option value="">Select a reason</option>
                <option value="Inappropriate Behavior">
                  Inappropriate Behavior
                </option>
                <option value="No-Show / Cancellation">
                  No-Show / Cancellation
                </option>
                <option value="Safety Concern">Safety Concern</option>
                <option value="Fraud">Fraud</option>
                <option value="Harassment">Harassment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 transition duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Description
              </label>
              <textarea
                name="reportDescription"
                value={userReportData.reportDescription}
                onChange={handleUserReportChange}
                placeholder="Please provide detailed information about the incident..."
                rows="5"
                className={`w-full border rounded-lg px-4 py-2 transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                }`}
              />
            </div>

            {userReportStatus && (
              <div
                className={`p-3 rounded-lg transition duration-300 ${
                  userReportStatus.startsWith("✓")
                    ? isDarkMode
                      ? "bg-green-900 text-green-200"
                      : "bg-green-100 text-green-700"
                    : isDarkMode
                      ? "bg-red-900 text-red-200"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {userReportStatus}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium duration-300"
            >
              Submit User Report
            </button>
          </form>
        </div>

        {/* Contact Section */}
        <div
          className={`rounded-2xl shadow p-6 transition duration-300 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-xl font-medium mb-3 transition duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Contact NGO Support
          </h2>
          <p
            className={`transition duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            📧 ngo-support@wastezero.com
          </p>
          <p
            className={`transition duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            📞 +91 9123456780
          </p>
        </div>
      </div>
    </div>
  );
};

export default NGOHelp;
