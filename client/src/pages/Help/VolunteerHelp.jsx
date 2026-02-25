import React, { useState } from "react";

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
  const [active, setActive] = useState(null);

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
          <h2 className="text-xl font-medium mb-4">Report an Issue</h2>

          <textarea
            placeholder="Describe your issue..."
            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-green-500 outline-none"
            rows="4"
          />

          <button className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
