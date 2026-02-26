import React, { useState } from "react";

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
  const [active, setActive] = useState(null);

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">NGO Help & Support</h1>
        <p className="text-gray-500 mb-8">
          Manage campaigns, volunteers and track impact effectively.
        </p>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">
            Frequently Asked Questions
          </h2>

          {ngoFaqs.map((faq, index) => (
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
          <h2 className="text-xl font-medium mb-3">Contact NGO Support</h2>
          <p className="text-gray-600">📧 ngo-support@wastezero.com</p>
          <p className="text-gray-600">📞 +91 9123456780</p>
        </div>
      </div>
    </div>
  );
};

export default NGOHelp;
