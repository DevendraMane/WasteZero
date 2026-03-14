import React, { useState, useMemo } from "react";

const AdminMessages = ({ isDarkMode = false }) => {
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBulk, setSelectedBulk] = useState([]);
  const [notes, setNotes] = useState("");
  const [timeline, setTimeline] = useState([]);

  const conversations = [
    {
      id: 1,
      participants: "Ruthwik ↔ Green Earth NGO",
      status: "under_review",
      reports: 2,
      riskScore: 65,
      lastActivity: "Feb 22, 2026",
      messages: [
        { sender: "Ruthwik", text: "Why is pickup delayed?" },
        { sender: "NGO", text: "We are checking the issue." },
      ],
    },
    {
      id: 2,
      participants: "Anjali ↔ Eco Mitra",
      status: "flagged",
      reports: 3,
      riskScore: 82,
      lastActivity: "Feb 21, 2026",
      messages: [
        { sender: "Anjali", text: "This is unacceptable." },
        { sender: "Eco Mitra", text: "Please stay respectful." },
      ],
    },
    {
      id: 3,
      participants: "System Alert",
      status: "system",
      reports: 0,
      riskScore: 10,
      lastActivity: "Feb 20, 2026",
      messages: [{ sender: "System", text: "New user registered." }],
    },
  ];

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((c) => (activeTab === "all" ? true : c.status === activeTab))
      .filter((c) =>
        c.participants.toLowerCase().includes(search.toLowerCase()),
      );
  }, [activeTab, search]);

  const current = filteredConversations[selected];

  const confirmAction = (action) => {
    if (!current) return;
    const confirmed = window.confirm(`Are you sure you want to ${action}?`);
    if (confirmed) {
      setTimeline((prev) => [
        ...prev,
        `${action} on ${current.participants} at ${new Date().toLocaleString()}`,
      ]);
    }
  };

  const toggleBulk = (id) => {
    setSelectedBulk((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "safe":
        return "bg-green-100 text-green-700";
      case "under_review":
        return "bg-yellow-100 text-yellow-700";
      case "flagged":
        return "bg-red-100 text-red-700";
      case "system":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusColorDark = (status) => {
    switch (status) {
      case "safe":
        return "bg-green-900 text-green-200";
      case "under_review":
        return "bg-yellow-900 text-yellow-200";
      case "flagged":
        return "bg-red-900 text-red-200";
      case "system":
        return "bg-blue-900 text-blue-200";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  return (
    <div
      className={`flex flex-col lg:flex-row h-full lg:h-full rounded-none lg:rounded-xl shadow-none lg:shadow-sm border-none lg:border overflow-hidden transition duration-300 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      }`}
    >
      {/* HEADER + FILTER */}
      {/* HEADER + FILTER */}
      <div
        className={`p-3 sm:p-4 md:p-6 border-b space-y-3 md:space-y-4 transition duration-300 ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h1
          className={`text-xl sm:text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          Admin Monitoring
        </h1>

        <div className="flex gap-2 md:gap-3 flex-wrap">
          {["all", "flagged", "under_review", "system"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition duration-300 ${
                activeTab === tab
                  ? "bg-green-600 text-white"
                  : isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full rounded-lg px-3 sm:px-4 py-2 border text-sm transition duration-300 ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          }`}
        />
      </div>

      <div className="flex flex-1">
        {/* LEFT PANEL */}
        {/* LEFT PANEL */}
        <div
          className={`w-full lg:w-1/3 border-r overflow-y-auto transition duration-300 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          {filteredConversations.map((conv, index) => (
            <div
              key={conv.id}
              className={`p-4 border-b cursor-pointer transition duration-300 flex-shrink-0 ${
                isDarkMode
                  ? `border-gray-700 ${
                      selected === index ? "bg-gray-700" : "hover:bg-gray-700"
                    }`
                  : `border-gray-200 ${
                      selected === index ? "bg-gray-100" : "hover:bg-gray-100"
                    }`
              }`}
              onClick={() => setSelected(index)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBulk.includes(conv.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleBulk(conv.id);
                    }}
                  />
                  <p
                    className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                  >
                    {conv.participants}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode
                      ? getStatusColorDark(conv.status)
                      : getStatusColor(conv.status)
                  }`}
                >
                  {conv.status.replace("_", " ")}
                </span>
              </div>

              {conv.reports > 0 && (
                <p
                  className={`text-xs mt-1 ${isDarkMode ? "text-red-400" : "text-red-500"}`}
                >
                  🚨 {conv.reports} reports
                </p>
              )}

              <p
                className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Risk Score: {conv.riskScore}%
              </p>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col">
          {current ? (
            <>
              {/* HEADER */}
              <div
                className={`p-4 border-b flex justify-between items-center transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div>
                  <h3
                    className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {current.participants}
                  </h3>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Last activity: {current.lastActivity}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => confirmAction("Marked Safe")}
                    className={`px-3 py-1 rounded border transition duration-300 ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Mark Safe
                  </button>
                  <button
                    onClick={() => confirmAction("Flagged Conversation")}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
                  >
                    Flag
                  </button>
                  <button
                    onClick={() => confirmAction("Suspended User")}
                    className={`px-3 py-1 rounded border transition duration-300 ${
                      isDarkMode
                        ? "border-red-700 text-red-400 hover:bg-red-900"
                        : "border-red-300 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    Suspend
                  </button>
                </div>
              </div>

              {/* CHAT VIEW */}
              <div
                className={`flex-1 p-2 overflow-y-auto space-y-2 transition duration-300 ${
                  isDarkMode ? "bg-gray-900" : "bg-gray-50"
                }`}
              >
                {current.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl shadow-sm transition ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {msg.sender}
                    </p>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* INSIGHTS + NOTES */}
              <div
                className={`p-2 border-t space-y-2 transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div>
                  <h4
                    className={`font-medium text-sm mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Conversation Insights
                  </h4>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Total Messages: {current.messages.length}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Reports: {current.reports}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Risk Score: {current.riskScore}%
                  </p>
                </div>

                <div>
                  <h4
                    className={`font-medium text-sm mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Moderation Notes
                  </h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full rounded-lg p-2 text-sm border transition duration-300 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Add internal note..."
                  />
                </div>

                <div>
                  <h4
                    className={`font-medium text-sm mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Activity Timeline
                  </h4>
                  <div
                    className={`text-xs space-y-1 max-h-24 overflow-y-auto ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {timeline.length === 0 && <p>No moderation actions yet.</p>}
                    {timeline.map((item, i) => (
                      <p key={i}>{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              className={`flex-1 flex items-center justify-center transition duration-300 ${
                isDarkMode
                  ? "text-gray-500 bg-gray-900"
                  : "text-gray-400 bg-white"
              }`}
            >
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
