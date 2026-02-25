import React, { useState } from "react";

const adminFaqs = [
  {
    question: "How do I manage users?",
    answer: "Go to User Management to view, suspend or modify user roles.",
  },
  {
    question: "How do I access platform analytics?",
    answer:
      "Open Reports & Analytics to view system activity and growth metrics.",
  },
  {
    question: "How do I handle reported issues?",
    answer:
      "Check Support Tickets section to review and resolve reported problems.",
  },
  {
    question: "How do I update platform settings?",
    answer:
      "Use Platform Settings to configure system preferences and controls.",
  },
];

const AdminHelp = () => {
  const [active, setActive] = useState(null);

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Admin Help & Support</h1>
        <p className="text-gray-500 mb-8">
          Manage platform operations and monitor system activity.
        </p>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">
            Frequently Asked Questions
          </h2>

          {adminFaqs.map((faq, index) => (
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

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-medium mb-3">Admin Support Contact</h2>
          <p className="text-gray-600">📧 admin-support@wastezero.com</p>
          <p className="text-gray-600">📞 +91 9988776655</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHelp;
