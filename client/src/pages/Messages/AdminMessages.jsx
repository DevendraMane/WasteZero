import React, { useState, useMemo } from "react";

const AdminMessages = () => {
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

  return (
    <div className="flex flex-col h-[85vh] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* HEADER + FILTER */}
      <div className="p-6 border-b space-y-4">
        <h1 className="text-2xl font-semibold">Admin Message Monitoring</h1>

        <div className="flex gap-3 flex-wrap">
          {["all", "flagged", "under_review", "system"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeTab === tab
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
          {filteredConversations.map((conv, index) => (
            <div
              key={conv.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selected === index ? "bg-gray-100" : ""
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
                  <p className="text-sm font-medium">{conv.participants}</p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    conv.status,
                  )}`}
                >
                  {conv.status.replace("_", " ")}
                </span>
              </div>

              {conv.reports > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  🚨 {conv.reports} reports
                </p>
              )}

              <p className="text-xs text-gray-500 mt-1">
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
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{current.participants}</h3>
                  <p className="text-xs text-gray-500">
                    Last activity: {current.lastActivity}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => confirmAction("Marked Safe")}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    Mark Safe
                  </button>
                  <button
                    onClick={() => confirmAction("Flagged Conversation")}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Flag
                  </button>
                  <button
                    onClick={() => confirmAction("Suspended User")}
                    className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    Suspend
                  </button>
                </div>
              </div>

              {/* CHAT VIEW */}
              <div className="flex-1 p-6 bg-gray-50 overflow-y-auto space-y-3">
                {current.messages.map((msg, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">{msg.sender}</p>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* INSIGHTS + NOTES */}
              <div className="p-4 border-t bg-white space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Conversation Insights
                  </h4>
                  <p className="text-xs text-gray-600">
                    Total Messages: {current.messages.length}
                  </p>
                  <p className="text-xs text-gray-600">
                    Reports: {current.reports}
                  </p>
                  <p className="text-xs text-gray-600">
                    Risk Score: {current.riskScore}%
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Moderation Notes</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                    placeholder="Add internal note..."
                  />
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Activity Timeline
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1 max-h-24 overflow-y-auto">
                    {timeline.length === 0 && <p>No moderation actions yet.</p>}
                    {timeline.map((item, i) => (
                      <p key={i}>{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
