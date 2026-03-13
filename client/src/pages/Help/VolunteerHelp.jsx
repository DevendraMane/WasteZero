import React, { useState } from "react";
import { useAuth } from "../../store/AuthContext";
import API from "../../utils/api";

const volunteerFaqs = [
  {
    question: "How do I join an opportunity?",
    answer:
      "Go to Opportunities page, choose an event and click Join. You can track it in your Dashboard.",
  },
  {
    question: "How do I cancel a joined opportunity?",
    answer:
      "Open the opportunity from My Dashboard and click Cancel Participation.",
  },
  {
    question: "How do I schedule a waste pickup?",
    answer:
      "Go to Schedule Pickup page, choose date and location, and confirm submission.",
  },
  {
    question: "How is my impact calculated?",
    answer:
      "Your impact is calculated based on completed activities and verified contributions.",
  },
];

const HelpSupport = () => {
  const { token } = useAuth();
  const [active, setActive] = useState(null);
  const [reportData, setReportData] = useState({
    issueType: "bug",
    subject: "",
    description: "",
  });
  const [submitStatus, setSubmitStatus] = useState("");

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportData((prev) => ({
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

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">
          Volunteer Help & Support
        </h1>
        <p className="text-gray-500 mb-8">
          Find answers to common questions or contact support.
        </p>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">
            Frequently Asked Questions
          </h2>

          {volunteerFaqs.map((faq, index) => (
            <div key={index} className="border-b py-4">
              <button
                onClick={() => setActive(active === index ? null : index)}
                className="w-full text-left font-medium text-gray-800"
              >
                {faq.question}
              </button>

              {active === index && (
                <p className="mt-2 text-gray-600 text-sm">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>

        {/* Contact Card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-medium mb-3">Contact Support</h2>
          <p className="text-gray-600">📧 support@wastezero.com</p>
          <p className="text-gray-600">📞 +91 9876543210</p>
        </div>

        {/* Report Issue */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-medium mb-6">Report an Issue</h2>

          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type
              </label>
              <select
                name="issueType"
                value={reportData.issueType}
                onChange={handleReportChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="feedback">General Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={reportData.subject}
                onChange={handleReportChange}
                placeholder="Brief title of the issue"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={reportData.description}
                onChange={handleReportChange}
                placeholder="Detailed description of the issue..."
                rows="5"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {submitStatus && (
              <div
                className={`p-3 rounded-lg ${
                  submitStatus.startsWith("✓")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {submitStatus}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
